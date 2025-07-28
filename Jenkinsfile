pipeline {
  agent any

  environment {
    IMAGE_NAME='mygp-frontend'
    CONTAINER_NAME='mygp-frontend'
    EVENT_TEST="TEST"
    BACKEND_URL='http://localhost:3000' 
    NEXT_PUBLIC_DEA_URL='http://localhost:8000'
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

    stage('Run Container') {
      steps {
        script {
          sh "docker stop ${CONTAINER_NAME} || true"
          sh "docker rm ${CONTAINER_NAME} || true"
          sh "docker run -d --restart unless-stopped --name ${CONTAINER_NAME} --network host \
          ${IMAGE_NAME}"
          }
        }
      }
    }
  }