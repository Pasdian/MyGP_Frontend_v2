pipeline {
  agent any

  environment {
    IMAGE_NAME='mygp-frontend-jenkins'
    CONTAINER_NAME='mygp-frontend-jenkins'
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
          withCredentials([
          string(credentialsId: 'POSTGRES_DB_PASSWORD', variable: 'POSTGRES_DB_PASSWORD'),
          string(credentialsId: 'FIREBIRD_PASSWORD', variable: 'FIREBIRD_PASSWORDSECRET')
          string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET')
          string(credentialsId: 'METABASE_SECRET_KEY', variable: 'METABASE_SECRET_KEY')
          string(credentialsId: 'EMAIL_PASS', variable: 'EMAIL_PASS')
          ]) {
            sh """
              docker run -d --restart unless-stopped --name ${CONTAINER_NAME} --network host \\
                -e POSTGRES_DB_PASSWORD=$POSTGRES_DB_PASSWORD \\
                -e FIREBIRD_PASSWORD=$FIREBIRD_PASSWORD \\
                -e JWT_SECRET=$JWT_SECRET \\
                -e METABASE_SECRET_KEY=$METABASE_SECRET_KEY \\
                -e EMAIL_PASS=$EMAIL_PASS \\
                ${IMAGE_NAME}
            """
            }
          }
        }
      }
    }
  }