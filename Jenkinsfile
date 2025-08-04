pipeline {
  agent any

  environment {
    IMAGE_NAME='mygp-frontend'
    CONTAINER_NAME='mygp-frontend'
    BACKEND_URL='http://localhost:3000' 
    NEXT_PUBLIC_DEA_URL='http://localhost:8000'
    DEA_API_KEY= credentials('DEA_API_KEY')
  }

  stages {
      stage('Checkout') {
        steps {
          checkout scm
        }
      }

      stage('Build Docker Image') {
        steps {
          script {
            sh "docker build -f prod.Dockerfile -t ${IMAGE_NAME} ."
          }
        }
      }
    }

  post {
    success {
      echo "✅ Image ${IMAGE_NAME}:latest built and available locally."
    }
    cleanup {
      sh 'docker system prune -f || true'
    }
  }
}