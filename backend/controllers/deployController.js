const Deployment = require("../models/Deployment");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");

exports.createDeployment = async (req, res) => {
  try {
    const { repoUrl } = req.body;
    const newDeployment = new Deployment({
      user: req.user.id,
      repoUrl,
    });
    await newDeployment.save();
    res.json(newDeployment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getDeployments = async (req, res) => {
  try {
    const deployments = await Deployment.find({ user: req.user.id });
    res.json(deployments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// DockerHub credentials
const DOCKER_USERNAME = process.env.DOCKER_USERNAME;
const DOCKER_PASSWORD = process.env.DOCKER_PASSWORD;

// AWS Configuration
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const EKS_CLUSTER_NAME = process.env.EKS_CLUSTER_NAME;

// Configure AWS SDK
AWS.config.update({ region: AWS_REGION });

// Add AWS Console URL
const AWS_CONSOLE_URL =
  "https://us-east-1.console.aws.amazon.com/eks/clusters/charming-dubstep-seal?region=us-east-1&selectedResourceId=deployments&selectedTab=cluster-resources-tab";

// Update execPromise to handle timeout and env options
const execPromise = (command, options = {}) => {
  // Don't log repeated kubectl get ingress commands to avoid console spam
  const isGetIngressCommand =
    command.includes("kubectl get ingress") && command.includes("jsonpath");

  if (!isGetIngressCommand) {
    console.log("Executing Command:", command);
  }

  // Add --validate=false for kubectl apply commands
  if (command.includes("kubectl apply")) {
    command += " --validate=false";
  }

  return new Promise((resolve, reject) => {
    const { timeout, env } = options;
    const execOptions = {
      timeout,
      env: { ...process.env, ...(env || {}) },
    };

    const childProcess = exec(command, execOptions, (error, stdout, stderr) => {
      if (error) {
        if (!isGetIngressCommand) {
          console.error("Command Failed:", command);
          console.error("Error:", stderr || error.message);
        }
        reject(new Error(stderr || error.message));
      } else {
        if (!isGetIngressCommand) {
          console.log("Command Succeeded:", command);
          // Log output only if it's not a get ingress command to reduce console spam
          console.log("Output:", stdout);
        }
        resolve(stdout || stderr);
      }
    });
  });
};

// Ensure storage class exists
const ensureStorageClass = async () => {
  try {
    const storageClassExists = await execPromise(
      `kubectl get storageclass auto-ebs-sc --no-headers --ignore-not-found`
    );

    if (!storageClassExists) {
      console.log("Creating EBS storage class...");
      const storageClassYaml = `
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: auto-ebs-sc
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.eks.amazonaws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
  encrypted: "true"
      `;

      const tempFile = path.resolve(__dirname, "../../storage-class.yaml");
      fs.writeFileSync(tempFile, storageClassYaml);
      await execPromise(`kubectl apply -f "${tempFile}"`);
      fs.unlinkSync(tempFile);
      console.log("Storage class created successfully");
    } else {
      console.log("Storage class already exists, skipping creation");
    }

    return true;
  } catch (error) {
    console.error("Error ensuring storage class:", error.message);
    return false;
  }
};

// Ensure IngressClass exists
const ensureIngressClass = async () => {
  try {
    console.log("Creating ALB IngressClass...");
    const ingressClassYaml = `
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: alb
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: ingress.k8s.aws/alb
    `;

    const tempFile = path.resolve(__dirname, "../../ingressclass.yaml");
    fs.writeFileSync(tempFile, ingressClassYaml);
    await execPromise(`kubectl apply -f "${tempFile}"`);
    fs.unlinkSync(tempFile);
    console.log("IngressClass created successfully");
    return true;
  } catch (error) {
    console.error("Error ensuring IngressClass:", error.message);
    return false;
  }
};

// Add network diagnostics utility
const runNetworkDiagnostics = async () => {
  const diagnosticsScript = `
    echo "=== System Network Diagnostics ==="
    echo "Network Interfaces:"
    ip addr show
    echo -e "\nDNS Configuration:"
    cat /etc/resolv.conf
    echo -e "\nProxy Environment Variables:"
    env | grep -E '_proxy|PROXY'
    echo -e "\nDocker Network Configuration:"
    docker network ls
    docker network inspect bridge
    echo -e "\nConnectivity Tests:"
    ping -c 4 registry-1.docker.io
    ping -c 4 docker.io
    traceroute registry-1.docker.io
    echo -e "\nDocker System Information:"
    docker system info
    echo -e "\nPotential Network Configuration:"
    netstat -tuln
  `;

  try {
    const result = await execPromise(diagnosticsScript);
    console.log("Network Diagnostics Results:", result);
    return result;
  } catch (error) {
    console.error("Network Diagnostics Failed:", error);
    return null;
  }
};

// Ensure LoadBalancer Controller
const ensureLoadBalancerController = async () => {
  try {
    console.log("Checking AWS Load Balancer Controller...");

    // Check if controller exists
    const controllerExists = await execPromise(
      `kubectl get deployment -n kube-system aws-load-balancer-controller --no-headers --ignore-not-found`
    );

    if (!controllerExists) {
      console.log("AWS Load Balancer Controller not found. Installing...");

      // Add the EKS chart repo
      await execPromise(`helm repo add eks https://aws.github.io/eks-charts`);
      await execPromise(`helm repo update`);

      // Install the AWS Load Balancer Controller
      await execPromise(
        `helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
        -n kube-system \
        --set clusterName=${EKS_CLUSTER_NAME} \
        --set serviceAccount.create=true \
        --set serviceAccount.name=aws-load-balancer-controller`
      );

      console.log("Waiting for AWS Load Balancer Controller to be ready...");
      await execPromise(
        `kubectl wait --namespace kube-system \
        --for=condition=ready pod \
        --selector "app.kubernetes.io/name=aws-load-balancer-controller" \
        --timeout=90s`
      );

      console.log("AWS Load Balancer Controller installed successfully!");
    } else {
      console.log("AWS Load Balancer Controller already exists");
    }

    return true;
  } catch (error) {
    console.error(
      "Error ensuring AWS Load Balancer Controller:",
      error.message
    );
    return false;
  }
};

// Add this function to check and setup OIDC provider
const ensureOIDCProvider = async () => {
  try {
    console.log("Checking IAM OIDC provider...");

    // Check if OIDC provider exists
    const oidcExists = await execPromise(
      `aws eks describe-cluster --name ${EKS_CLUSTER_NAME} --query "cluster.identity.oidc" --output text`
    );

    if (!oidcExists || oidcExists === "None") {
      console.log("Setting up IAM OIDC provider...");
      await execPromise(
        `eksctl utils associate-iam-oidc-provider --region=${AWS_REGION} --cluster=${EKS_CLUSTER_NAME} --approve`
      );
      console.log("IAM OIDC provider setup complete");
    } else {
      console.log("IAM OIDC provider already exists");
    }

    return true;
  } catch (error) {
    console.error("Error ensuring IAM OIDC provider:", error.message);
    return false;
  }
};

// Setup Dockerfile if not exists
const setupDockerfile = async (clonePath) => {
  try {
    // Check if Dockerfile exists
    const dockerfilePath = path.join(clonePath, "Dockerfile");
    if (fs.existsSync(dockerfilePath)) {
      console.log("Dockerfile found in repository, using existing file");
      return true;
    }

    console.log("No Dockerfile found, creating one...");

    // Detect project type (Node.js, Python, etc.)
    let projectType = "node"; // Default to Node.js

    if (fs.existsSync(path.join(clonePath, "requirements.txt"))) {
      projectType = "python";
    } else if (fs.existsSync(path.join(clonePath, "pom.xml"))) {
      projectType = "java";
    } else if (fs.existsSync(path.join(clonePath, "go.mod"))) {
      projectType = "go";
    }

    let dockerfileContent = "";

    switch (projectType) {
      case "node":
        dockerfileContent = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`;
        break;

      case "python":
        dockerfileContent = `FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]`;
        break;

      case "java":
        dockerfileContent = `FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-slim
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]`;
        break;

      case "go":
        dockerfileContent = `FROM golang:1.18-alpine AS build
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
COPY --from=build /app/main /app/main
EXPOSE 8080
CMD ["/app/main"]`;
        break;
    }

    // Write Dockerfile
    fs.writeFileSync(dockerfilePath, dockerfileContent);
    console.log(`Created ${projectType} Dockerfile`);
    return true;
  } catch (error) {
    console.error("Error setting up Dockerfile:", error.message);
    return false;
  }
};

// Function to create Kubernetes deployment and service YAML
const createK8sDeployment = async (namespace, imageName, envVariables = {}) => {
  try {
    const deploymentYaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
  namespace: ${namespace}
  labels:
    app: ${namespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${namespace}
  template:
    metadata:
      labels:
        app: ${namespace}
    spec:
      containers:
      - name: ${namespace}
        image: ${imageName}
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"
        env:
${Object.entries(envVariables)
  .map(([key, value]) => `        - name: ${key}\n          value: "${value}"`)
  .join("\n")}
---
apiVersion: v1
kind: Service
metadata:
  name: app-service
  namespace: ${namespace}
spec:
  selector:
    app: ${namespace}
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: ${namespace}
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
    `;

    const deploymentPath = path.resolve(
      __dirname,
      `../../${namespace}-deployment.yaml`
    );
    fs.writeFileSync(deploymentPath, deploymentYaml);

    // Apply the deployment and verify it was created
    await execPromise(`kubectl apply -f "${deploymentPath}"`);

    // Check if deployment was created
    console.log(`Verifying deployment in namespace ${namespace}...`);
    await execPromise(`kubectl get deployment app-deployment -n ${namespace}`);

    // Check if pods are being created
    console.log(`Checking for pods in namespace ${namespace}...`);
    await execPromise(`kubectl get pods -n ${namespace} -l app=${namespace}`);

    // Check if service was created and has endpoints
    console.log(`Checking service in namespace ${namespace}...`);
    await execPromise(`kubectl get service app-service -n ${namespace}`);
    await execPromise(`kubectl get endpoints app-service -n ${namespace}`);

    // Cleanup
    fs.unlinkSync(deploymentPath);

    return true;
  } catch (error) {
    console.error("Error creating K8s deployment:", error.message);
    console.error("Deployment error details:", error);

    // Debug: Check what's in the namespace
    try {
      console.log(`Debug: Listing all resources in namespace ${namespace}`);
      await execPromise(`kubectl get all -n ${namespace}`);

      // Check if pods have issues
      console.log(`Debug: Checking pod status in namespace ${namespace}`);
      const podOutput = await execPromise(
        `kubectl get pods -n ${namespace} -o wide`
      );
      console.log("Pods status:", podOutput);

      // If there are pods, check their logs
      if (podOutput && !podOutput.includes("No resources found")) {
        console.log(`Debug: Checking logs for pods in namespace ${namespace}`);
        await execPromise(
          `kubectl logs -n ${namespace} -l app=${namespace} --tail=50`
        );
      }

      // Check events in the namespace for clues
      console.log(`Debug: Checking events in namespace ${namespace}`);
      await execPromise(
        `kubectl get events -n ${namespace} --sort-by='.lastTimestamp'`
      );
    } catch (debugError) {
      console.error("Error during debugging:", debugError.message);
    }

    return false;
  }
};
// Function to get ALB URL
const getALBUrl = async (namespace) => {
  try {
    console.log(
      `Waiting for ALB to be provisioned for namespace ${namespace}...`
    );

    let attempts = 0;
    let address = null;
    let delay = 5000; // Start with 5 seconds

    while (attempts < 30 && !address) {
      try {
        const ingressExists = await execPromise(
          `kubectl get ingress app-ingress -n ${namespace} --ignore-not-found`
        );

        if (!ingressExists || ingressExists.trim() === "") {
          console.log(
            `Ingress resource not created yet... (attempt ${attempts + 1}/30)`
          );
        } else {
          const ingressStatus = await execPromise(
            `kubectl get ingress app-ingress -n ${namespace} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'`
          );

          if (ingressStatus && ingressStatus.trim() !== "") {
            address = ingressStatus.trim();
            console.log(`ALB address obtained: ${address}`);
            break;
          } else {
            console.log(
              `Ingress exists but ALB address not ready yet... (attempt ${
                attempts + 1
              }/30)`
            );
          }
        }
      } catch (err) {
        console.log(`Waiting for Ingress/ALB... (attempt ${attempts + 1}/30)`);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff but cap it at 30 seconds
      delay = Math.min(delay * 1.5, 30000);
      attempts++;
    }

    if (address) {
      return `http://${address}`;
    } else {
      console.log("ALB address not found within timeout period");
      return "Pending - ALB provisioning in progress";
    }
  } catch (error) {
    console.error("Error getting ALB URL:", error.message);
    return "Error - Could not obtain ALB URL";
  }
};

const buildAndPushDockerImage = async (req, res) => {
  // Add authentication check at the start
  if (!req.user || !req.user.id) {
    console.error("User authentication required");
    return res.status(401).json({
      error: "Authentication required",
      message: "Please login before attempting to deploy",
    });
  }

  const { repoUrl, envVariables = {} } = req.body;

  // Validate repository URL
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

  // Check for Docker credentials
  if (!DOCKER_USERNAME || !DOCKER_PASSWORD) {
    console.error("Docker credentials not configured");
    return res
      .status(500)
      .json({ error: "Docker credentials are not properly configured" });
  }

  const repoName = path
    .basename(repoUrl)
    .replace(".git", "")
    .toLowerCase()
    .replace(/[^a-z0-9\-\.]/g, "-");
  const clonePath = path.resolve(__dirname, "../../repos", repoName);
  const imageName = `${DOCKER_USERNAME}/${repoName}:latest`;
  let serviceUrl = "Pending - Deployment in progress";

  try {
    console.log(`Starting deployment for repository: ${repoUrl}`);
    console.log(`Repository Name: ${repoName}`);
    console.log(`Clone Path: ${clonePath}`);
    console.log(`Docker Image Name: ${imageName}`);

    // Create repos directory if it doesn't exist
    const reposDir = path.resolve(__dirname, "../../repos");
    if (!fs.existsSync(reposDir)) {
      fs.mkdirSync(reposDir, { recursive: true });
    }

    const updateStep = (step) => {
      // Send the update to the frontend if possible
      if (req.body.updateStep && typeof req.body.updateStep === "function") {
        req.body.updateStep(step);
      } else {
        console.log("Step:", step);
      }
    };

    updateStep("Configuring kubectl for EKS...");
    await execPromise(
      `aws eks update-kubeconfig --name ${EKS_CLUSTER_NAME} --region ${AWS_REGION}`
    );

    updateStep("Setting up cluster resources...");
    await ensureOIDCProvider();
    await ensureLoadBalancerController();
    await ensureIngressClass();
    await ensureStorageClass();

    updateStep("Cloning repository...");
    if (fs.existsSync(clonePath)) {
      fs.rmSync(clonePath, { recursive: true, force: true });
    }
    await execPromise(`git clone "${repoUrl}" "${clonePath}"`);

    updateStep("Setting up Dockerfile...");
    await setupDockerfile(clonePath);

    updateStep("Building Docker image...");
    await execPromise(`docker build -t "${imageName}" "${clonePath}"`);

    updateStep("Pushing to Docker registry...");
    const dockerPushWithRetry = async (imageName, maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Logout and re-login to refresh credentials
          await execPromise("docker logout");
          await execPromise(
            `echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin`
          );

          // Use BuildKit for more robust image building
          const buildCommand = `DOCKER_BUILDKIT=1 docker build -t "${imageName}" "${clonePath}"`;
          await execPromise(buildCommand);

          // Verbose push with timeout
          const pushCommand = `docker push "${imageName}"`;
          const pushResult = await execPromise(pushCommand, {
            timeout: 5 * 60 * 1000, // 5-minute timeout
            env: {
              ...process.env,
              DOCKER_CLI_HINTS: "false",
            },
          });

          console.log("Docker push successful:", pushResult);
          return;
        } catch (pushError) {
          console.error(`Docker push attempt ${attempt} failed:`, pushError);

          if (pushError.message.includes("broken pipe")) {
            console.log(
              "Network interruption detected. Running diagnostics..."
            );
            await runNetworkDiagnostics();
          }

          if (attempt === maxRetries) {
            throw new Error(
              `Docker push failed after ${maxRetries} attempts: ${pushError.message}`
            );
          }

          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        }
      }
    };

    await dockerPushWithRetry(imageName);

    updateStep("Creating Kubernetes namespace...");
    await execPromise(
      `kubectl create namespace ${repoName} --dry-run=client -o yaml | kubectl apply -f -`
    );

    updateStep("Deploying application...");
    await createK8sDeployment(repoName, imageName, envVariables);

    updateStep("Waiting for Load Balancer...");
    serviceUrl = await getALBUrl(repoName);

    // When creating deployment record, double check user ID exists
    if (!req.user?.id) {
      throw new Error("User authentication lost during deployment process");
    }

    const deployment = new Deployment({
      user: req.user.id,
      repoUrl,
      imageName,
      serviceUrl,
      status: serviceUrl.startsWith("http") ? "Deployed" : "Pending",
      deployedAt: new Date(),
    });

    await deployment.save();

    updateStep("Deployment completed!");

    // Final response
    res.status(200).json({
      message: "Deployment completed successfully!",
      imageUrl: `https://hub.docker.com/r/${DOCKER_USERNAME}/${repoName}`,
      serviceUrl,
      deploymentId: deployment._id,
      awsConsoleUrl: AWS_CONSOLE_URL,
    });
  } catch (error) {
    console.error("Comprehensive Deployment Error:", {
      message: error.message,
      stack: error.stack,
      dockerUsername: DOCKER_USERNAME
        ? DOCKER_USERNAME.replace(/./g, "*")
        : "undefined",
      repoUrl: req.body?.repoUrl,
      userId: req.user?.id || "not authenticated",
    });

    // Run diagnostics on failure
    const diagnosticsResults = await runNetworkDiagnostics();

    res.status(500).json({
      error: "Deployment failed",
      details: error.message,
      suggestedActions: [
        "Check network connectivity",
        "Verify Docker Hub credentials",
        "Restart Docker daemon",
        "Check firewall settings",
      ],
      diagnostics: diagnosticsResults,
    });
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

module.exports = {
  buildAndPushDockerImage,
  createDeployment: exports.createDeployment,
  getDeployments: exports.getDeployments,
};
