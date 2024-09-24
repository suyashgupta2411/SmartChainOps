pipeline {
    agent any

    environment {
<<<<<<< HEAD
        MONGO_URI="mongodb+srv://suyashgupta2411:pu7GqVJr1DGpgR9e@cluster0.co3aj.mongodb.net/smartchainops?retryWrites=true&w=majority&appName=Cluster0"
        JWT_SECRET='5e4c8615ad98bc421342f5d1f0de1839649ba5dbaf336767fbcf35c342efaa04ae88db5b77aeb1395073d08876753206098695d909b9813302b2ce3d3c96c7aa'
        PORT='5000'
        PATH="/Users/suyashgupta/.nvm/versions/node/v22.8.0/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    }

    stages {
        stage('Checkout Code') {
            steps {
                // This will clone your repository
                git url: 'https://github.com/suyashgupta2411/SmartChainOps.git', branch: 'main'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                script {
                    // Navigate to the backend directory and install dependencies
                    sh '''
                    cd backend 
                    npm install
                    '''
=======
        // Define environment variables
        BACKEND_IMAGE = "backend-image"
        FRONTEND_IMAGE = "frontend-image"
    }

    stages {
        stage('Clone Repository') {
            steps {
                // Clone the repository
                git branch: 'main', url: 'https://github.com/your-repo-url.git'
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    // Build the Docker image for backend
                    sh 'docker build -t $BACKEND_IMAGE ./backend'
>>>>>>> be61c11 (Error resolve)
                }
            }
        }

<<<<<<< HEAD
        stage('Install Frontend Dependencies') {
            steps {
                script {
                    // Navigate to the frontend directory and install dependencies
                    sh '''
                    cd frontend 
                    npm install
                    '''
=======
        stage('Build Frontend') {
            steps {
                script {
                    // Build the Docker image for frontend
                    sh 'docker build -t $FRONTEND_IMAGE ./frontend'
>>>>>>> be61c11 (Error resolve)
                }
            }
        }

<<<<<<< HEAD
        stage('Docker Login') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Build Docker images for both frontend and backend
                    sh 'docker-compose -f docker-compose.yml build'
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    // Deploy using Docker Compose
                    sh 'docker-compose -f docker-compose.yml up -d'
=======
        stage('Deploy Services') {
            steps {
                script {
                    // Run Docker Compose to deploy the services
                    sh 'docker-compose up -d'
>>>>>>> be61c11 (Error resolve)
                }
            }
        }
    }

    post {
        always {
<<<<<<< HEAD
            echo 'Pipeline finished!'
        }
        failure {
            echo 'Pipeline failed!'
=======
            // Cleanup Docker containers and images
            script {
                sh 'docker-compose down'
            }
>>>>>>> be61c11 (Error resolve)
        }
    }
}
