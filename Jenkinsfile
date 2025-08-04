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
      stage('Generate .env') {
        steps {
              script {
                writeFile file: '.env', text: 
                '''
                BACKEND_URL=${env.BACKEND_URL}
                NEXT_PUBLIC_DEA_URL=${env.NEXT_PUBLIC_DEA_URL}
                DEA_API_KEY=${env.DEA_API_KEY}
                '''
              }
        }
      }

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