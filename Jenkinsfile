pipeline {
    agent any

    environment {
        RAILWAY_TOKEN = '5e7bf088-6764-4fcd-9503-a5c050db2a85'
    }

    stages {
        stage('Clone Repository') {
            steps {
                checkout scm
            }
        }
        stage('Build and Push Docker Images') {
            steps {
                script {
                    sh 'docker build -t smartchainops-frontend ./frontend'
                    sh 'docker build -t smartchainops-backend ./backend'
                }
            }
        }
        stage('Deploy to Railway') {
            steps {
                script {
                    sh './railway-deploy.sh'
                }
            }
        }
    }
}
