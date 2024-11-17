pipeline {
    agent any
    parameters {
        string(name: 'GITHUB_REPO', defaultValue: '', description: 'GitHub repository link')
    }
    environment {
        IMAGE_NAME = 'smartchainops'
        DOCKER_REGISTRY = 'suyashgupta1'  // replace with your DockerHub username or registry
    }
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: "${params.GITHUB_REPO}"
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    docker.build("${env.IMAGE_NAME}")
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    // Log in to DockerHub (you may use Jenkins Credentials for safer authentication)
                    docker.withRegistry('', 'dockerhub-credentials-id') {
                        docker.image("${env.IMAGE_NAME}").push("latest")
                    }
                }
            }
        }
    }
    post {
        success {
            echo "Docker image is available at https://hub.docker.com/r/${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}"
        }
    }
}
