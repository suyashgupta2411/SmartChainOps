pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials') // Set up Docker Hub credentials in Jenkins
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Checkout code from GitHub repository
                git url: 'https://github.com/username/repo.git', branch: 'main'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build Docker image
                    docker.build('username/smartchainops:${BUILD_NUMBER}')
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // Login to Docker Hub
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        // Push Docker image to Docker Hub
                        docker.image('username/smartchainops:${BUILD_NUMBER}').push()
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh './deploy.sh'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
