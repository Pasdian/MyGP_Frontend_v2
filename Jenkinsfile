pipeline {
  agent any

  environment {
    IMAGE_NAME = 'my-nextjs-app'
    CONTAINER_NAME = 'nextjs-container'
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
          // Build the Docker image using your Dockerfile
          sh "docker build -t ${IMAGE_NAME} ."
        }
      }
    }

    stage('Run Container') {
      steps {
        script {
          // Stop and remove any existing container with the same name (ignore errors)
          sh "docker rm -f ${CONTAINER_NAME} || true"

          // Run the container mapping port 3001
          sh "docker run -d --name ${CONTAINER_NAME} -p 3001:3001 ${IMAGE_NAME}"
        }
      }
    }
  }
}
