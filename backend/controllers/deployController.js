const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// DockerHub credentials
const DOCKER_USERNAME = process.env.DOCKER_USERNAME;
const DOCKER_PASSWORD = process.env.DOCKER_PASSWORD;

const buildAndPushDockerImage = async (req, res) => {
  const { repoUrl, envVariables } = req.body; // Environment variables included

  if (
    !repoUrl ||
    typeof repoUrl !== "string" ||
    !repoUrl.startsWith("https://")
  ) {
    console.error("Invalid GitHub repository URL provided:", repoUrl);
    return res
      .status(400)
      .json({ error: "Valid GitHub repository URL is required." });
  }

  const repoName = path
    .basename(repoUrl)
    .replace(".git", "")
    .toLowerCase()
    .replace(/[^a-z0-9\-\.]/g, "-");
  const clonePath = path.resolve(__dirname, "../../repos", repoName);
  const imageName = `${DOCKER_USERNAME}/${repoName}:latest`;

  try {
    console.log(`Starting deployment for repository: ${repoUrl}`);
    console.log(`Repository Name: ${repoName}`);
    console.log(`Clone Path: ${clonePath}`);
    console.log(`Docker Image Name: ${imageName}`);

    // Step 1: Clone the repository
    if (fs.existsSync(clonePath)) {
      console.log("Removing existing repository clone...");
      fs.rmSync(clonePath, { recursive: true, force: true });
    }

    console.log(`Cloning repository: ${repoUrl}`);
    await execPromise(`git clone "${repoUrl}" "${clonePath}"`);
    console.log("Repository cloned successfully!");

    // Step 2: Check if the Dockerfile exists, create one if not
    const dockerfilePath = path.join(clonePath, "Dockerfile");
    if (!fs.existsSync(dockerfilePath)) {
      console.log("No Dockerfile found. Creating a default Dockerfile...");

      const envString = Object.entries(envVariables || {})
        .map(([key, value]) => `ENV ${key}="${value}"`)
        .join("\n");

      const defaultDockerfile = `
        FROM node:16 AS builder
        WORKDIR /app
        COPY package*.json ./
        RUN npm install
        COPY . .
        RUN npm run build

        FROM node:16
        WORKDIR /app
        COPY --from=builder /app ./
        EXPOSE 3000
        ${envString}
        CMD ["npm", "start"]
      `;
      fs.writeFileSync(dockerfilePath, defaultDockerfile.trim());
      console.log("Default Dockerfile created at:", dockerfilePath);
    }

    // Step 3: Build the Docker image
    console.log(`Building Docker image: ${imageName}`);
    await execPromise(`docker build -t "${imageName}" "${clonePath}"`);
    console.log("Docker image built successfully!");

    // Step 4: Log in to Docker Hub
    console.log("Logging in to Docker Hub...");
    await execPromise(
      `echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin`
    );
    console.log("Logged in to Docker Hub successfully!");

    // Step 5: Push the Docker image
    console.log(`Pushing Docker image to Docker Hub: ${imageName}`);
    await execPromise(`docker push "${imageName}"`);
    console.log("Docker image pushed successfully!");

    // Step 6: Deploy to Kubernetes
    console.log("Creating Kubernetes deployment...");
    const deploymentYaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${repoName}-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${repoName}
  template:
    metadata:
      labels:
        app: ${repoName}
    spec:
      containers:
      - name: ${repoName}
        image: ${imageName}
        ports:
        - containerPort: 3000
        env:
        ${Object.entries(envVariables || {})
          .map(
            ([key, value]) =>
              `        - name: ${key}\n          value: "${value}"`
          )
          .join("\n")}
---
apiVersion: v1
kind: Service
metadata:
  name: ${repoName}-service
spec:
  selector:
    app: ${repoName}
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
`;
    const deploymentPath = path.join(clonePath, "kubernetes-deployment.yaml");
    fs.writeFileSync(deploymentPath, deploymentYaml);
    console.log("Kubernetes deployment file created.");

    await execPromise(`kubectl apply --validate=false -f "${deploymentPath}"`);
    console.log("Kubernetes deployment applied successfully!");

    // Step 7: Fetch Service URL
    let serviceUrl;
    const externalIP = await execPromise(
      `kubectl get service ${repoName}-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}'`
    );

    if (!externalIP.trim()) {
      console.log("External IP not available. Falling back to NodePort.");
      const minikubeIp = await execPromise("minikube ip");
      const nodePort = await execPromise(
        `kubectl get service ${repoName}-service -o jsonpath='{.spec.ports[0].nodePort}'`
      );
      serviceUrl = `http://${minikubeIp.trim()}:${nodePort.trim()}`;
    } else {
      serviceUrl = `http://${externalIP.trim()}:80`;
    }

    // Respond with success
    res.status(200).json({
      message:
        "Docker image built, pushed, and deployed to Kubernetes successfully!",
      imageUrl: `https://hub.docker.com/r/${DOCKER_USERNAME}/${repoName}`,
      serviceUrl,
    });
  } catch (error) {
    console.error("An error occurred during the deployment process:");
    console.error("Error Message:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    // Cleanup: Remove cloned repository
    try {
      if (fs.existsSync(clonePath)) {
        console.log("Cleaning up cloned repository...");
        fs.rmSync(clonePath, { recursive: true, force: true });
        console.log("Repository cleaned up.");
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError.message);
    }
  }
};

// Utility function to execute shell commands with detailed logging
const execPromise = (command) => {
  console.log("Executing Command:", command);
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Command Failed:", command);
        console.error("Error:", stderr || error.message);
        reject(new Error(stderr || error.message));
      } else {
        console.log("Command Succeeded:", command);
        console.log("Output:", stdout);
        resolve(stdout || stderr);
      }
    });
  });
};

module.exports = { buildAndPushDockerImage };
