pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                git url: 'https://github.com/Mohammad-Sofyan-Abdullah/Journal_Web_App', branch: 'main'
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                dir('Journal_Web_App') {   
                    script {
                        sh 'docker compose down || true'
                        sh 'docker compose pull'
                        sh 'docker compose up -d'
                    }
                }
            }
        }

    }
}
