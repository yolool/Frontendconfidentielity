pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'adam020/frontend-confidentiality'
        DOCKER_TAG   = "${BUILD_NUMBER}"
        TELEGRAM_CHAT_ID = '-1003962149031'
    }
    
    stages {
        
        stage('1. Checkout Code') {
            steps {
                echo '📥 Pulling code from GitHub...'
                git branch: 'master', url: 'https://github.com/yolool/Frontendconfidentielity.git'
            }
        }
        
        stage('2. Install Dependencies') {
            steps {
                echo '📦 Installing npm dependencies...'
                sh 'npm install'
            }
        }
        
        stage('3. Build Angular App') {
            steps {
                echo '🔨 Building Angular application...'
                sh 'npm run build -- --configuration production'
            }
        }
        
        stage('4. SonarQube Analysis') {
            steps {
                echo '🔍 Scanning code with SonarQube...'
                withSonarQubeEnv('sonarqube') {
                    sh '''
                        npx sonar-scanner \
                        -Dsonar.projectKey=frontend-confidentiality \
                        -Dsonar.projectName=Frontend-Confidentiality \
                        -Dsonar.sources=src \
                        -Dsonar.exclusions=**/node_modules/**,**/*.spec.ts \
                        -Dsonar.host.url=$SONAR_HOST_URL \
                        -Dsonar.token=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }
        
        stage('5. Docker Build') {
            steps {
                echo '🐳 Building Docker image...'
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }
        
        stage('6. Docker Push') {
            steps {
                echo '🚀 Pushing image to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                    sh 'docker logout'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            withCredentials([string(credentialsId: 'telegram-token', variable: 'TG_TOKEN')]) {
                sh '''
                    curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
                      --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
                      --data-urlencode "text=✅ FRONTEND build #${BUILD_NUMBER} SUCCESS"
                '''
            }
        }
        failure {
            withCredentials([string(credentialsId: 'telegram-token', variable: 'TG_TOKEN')]) {
                sh '''
                    curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
                      --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
                      --data-urlencode "text=❌ FRONTEND build #${BUILD_NUMBER} FAILED — check Jenkins!"
                '''
            }
        }
    }
}