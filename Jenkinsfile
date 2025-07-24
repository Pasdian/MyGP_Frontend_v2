pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Production Images') {
      steps {
        sh 'make build-prod'
      }
    }

    stage('Stop Production Containers') {
      steps {
        sh 'make stop-prod'
      }
    }

    stage('Start Production Containers') {
      steps {
        sh 'make start-prod'
      }
    }

    stage('Show Logs') {
      steps {
        // Optional: tail logs for a while or until user abort
        sh 'make logs'
      }
    }
  }
}
