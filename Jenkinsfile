pipeline {
  agent any

  stages {
    stage('Clone Repo') {
      steps {
        echo 'Cloning repository...'
        checkout scm
      }
    }

    stage('List Files') {
      steps {
        echo 'Listing files in workspace...'
        sh 'ls -la'
      }
    }

    stage('Done') {
      steps {
        echo 'SCM pull was successful ✅'
      }
    }
  }
}
