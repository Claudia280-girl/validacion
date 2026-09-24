pipeline {
  agent any

  environment {
    NODE_ENV = 'development'
    NPM_CONFIG_PRODUCTION = 'false'
    IMAGE_NAME = 'taskflow-backend'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    SONAR_HOST_URL = 'http://sonarqube:9000'
    SONAR_PROJECT_KEY = 'taskflow:backend'
    SONAR_LOGIN = 'admin'
    SONAR_PASSWORD = 'Coco258%'
  }

  tools {
    nodejs 'Node 20'
  }

  stages {
    stage('Checkout') {
      steps {
        echo 'Clonando repositorio...'
        checkout scm
      }
    }

    stage('Instalar dependencias') {
      steps {
        echo 'Instalando paquetes de Node...'
        sh 'npm ci'
      }
    }

    stage('Ejecutar pruebas unitarias') {
      steps {
        echo 'Ejecutando pruebas del backend...'
        sh 'npm run test:unit'
      }
    }

    stage('Compilar aplicación') {
      steps {
        echo 'Compilando la app NestJS...'
        sh 'npm run build'
      }
    }

    stage('Analisis con SonarQube') {
      steps {
        echo 'Enviando analisis a SonarQube...'
        sh """
          npx sonarqube-scanner \
            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
            -Dsonar.projectName=taskflow-backend \
            -Dsonar.sources=src \
            -Dsonar.host.url=${SONAR_HOST_URL} \
            -Dsonar.login=${SONAR_LOGIN} \
            -Dsonar.password=${SONAR_PASSWORD}
        """
      }
    }

    stage('Quality Gate') {
      steps {
        echo 'Esperando resultado de la Quality Gate...'
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Construir imagen Docker') {
      steps {
        echo 'Generando imagen Docker para despliegue posterior...'
        sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
      }
    }
  }

  post {
    always {
      echo 'Pipeline finalizado.'
    }
    success {
      echo 'Todo salió bien: pruebas, SonarQube y Docker OK.'
    }
    failure {
      echo 'La pipeline falló. Revisar errores de pruebas, SonarQube o Docker.'
    }
  }
}
