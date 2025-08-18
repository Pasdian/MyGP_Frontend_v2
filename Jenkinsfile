pipeline {
  agent any

  environment {
    IMAGE_NAME = 'mygp-frontend'
    CONTAINER_NAME = 'mygp-frontend'
    DEA_API_KEY = credentials('DEA_API_KEY')
  }

  stages {
    stage('Checkout') {
      steps {
        dir('frontend') {
          checkout scm
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        dir('frontend') {
          script {
            sh "docker build -f prod.Dockerfile -t ${IMAGE_NAME} ."
          }
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
