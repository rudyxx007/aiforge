 # AiForge - Cloud Native AI-Powered Code Developer Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-aiforge--platform-blue?logo=github)](https://github.com/yourusername/aiforge-platform)
[![License](https://img.shields.io/badge/License-Not%20Licensed-red)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Google%20Cloud-4285F4?logo=google-cloud)](https://cloud.google.com/)

## 🚀 Overview

AiForge is a cutting-edge **cloud-native platform** that leverages artificial intelligence to enhance software development workflows. Built with a **microservices architecture**, it provides developers with intelligent code analysis, automated code generation, security vulnerability scanning, and collaborative project management—all deployed on Google Cloud Platform with modern DevOps practices.

## 🏗️ Architecture

### Microservices (7 Services)
- **🔐 Authentication Service** (Port 8000) - User management & JWT authentication
- **📁 Project Service** (Port 8001) - Project and team management
- **🤖 Code Analysis Service** (Port 8002) - AI-powered code quality analysis
- **⚡ Code Generation Service** (Port 8003) - Natural language to code conversion
- **🔒 Security Scan Service** (Port 8004) - Vulnerability detection & recommendations
- **📢 Notification Service** (Port 8005) - Alert and notification system
- **🖥️ Dashboard Service** (Port 3000) - React-based web interface

### Technology Stack
- **Backend:** Python (FastAPI), Node.js (Express), Flask
- **Frontend:** React.js, HTML5, CSS3, JavaScript
- **Databases:** SQLite, In-memory storage
- **AI Integration:** OpenAI GPT API
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Kubernetes (Google Kubernetes Engine)
- **Infrastructure:** Terraform (Infrastructure as Code)
- **CI/CD:** GitHub Actions
- **Cloud Platform:** Google Cloud Platform
- **Security:** Snyk, Trivy, OWASP scanning

## 🎯 Features

### Core Functionality
- ✅ **Smart Code Analysis** - AI-powered code quality assessment with improvement suggestions
- ✅ **Automated Code Generation** - Convert natural language descriptions into working code
- ✅ **Security Vulnerability Scanning** - Real-time security analysis with remediation advice
- ✅ **Project Management** - Collaborative development workspace
- ✅ **Real-time Notifications** - Email and webhook alerts for critical events
- ✅ **User Authentication** - Secure JWT-based authentication system

### DevOps & Cloud Native
- ✅ **Microservices Architecture** - Independently scalable and maintainable services
- ✅ **Container-First Design** - Full Docker containerization
- ✅ **Kubernetes Deployment** - Production-ready orchestration
- ✅ **Infrastructure as Code** - Terraform-managed GCP resources
- ✅ **Automated CI/CD** - GitHub Actions pipeline with security scanning
- ✅ **DevSecOps Integration** - Security embedded throughout the development lifecycle

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker Desktop
- Git
- Google Cloud SDK
- OpenAI API Key

### Local Development
Clone the repository
git clone https://github.com/yourusername/aiforge-platform.git
cd aiforge-platfor

Set environment variables
set OPENAI_API_KEY=your_openai_api_key_here

Run all services locally
docker-compose up --build

Access the dashboard
Open browser to: http://localhost:3000

### Cloud Deployment
Deploy infrastructure
cd terraform
terraform init
terraform apply

Deploy to Kubernetes
kubectl apply -f k8s/

Get public URL
kubectl get ingress


## 📋 Project Requirements Fulfilled

This project demonstrates all required course objectives:

| Requirement | Implementation | Status |
|------------|----------------|--------|
| **Microservices** | 7 independent services with REST APIs | ✅ |
| **Docker** | All services containerized with multi-stage builds | ✅ |
| **Infrastructure as Code** | Terraform for GCP resource provisioning | ✅ |
| **Kubernetes** | GKE deployment with scaling and load balancing | ✅ |
| **CI/CD Pipeline** | GitHub Actions with automated testing and deployment | ✅ |
| **DevSecOps** | Snyk, Trivy, OWASP security scanning integration | ✅ |
| **Cloud Provider** | Google Cloud Platform with managed services | ✅ |
| **Public Access** | Publicly accessible web interface and APIs | ✅ |

## 🌐 Live Demo

- **Dashboard:** [https://aiforge.your-domain.com](https://aiforge.your-domain.com) *(Available after deployment)*
- **API Documentation:** [https://api.aiforge.your-domain.com/docs](https://api.aiforge.your-domain.com/docs)
- **Status Page:** [https://status.aiforge.your-domain.com](https://status.aiforge.your-domain.com)

## 📁 Project Structure
aiforge-platform/
├── 🔐 auth-service/ # Authentication microservice
├── 📁 project-service/ # Project management microservice
├── 🤖 code-analysis-service/ # AI code analysis microservice
├── ⚡ code-generation-service/ # AI code generation microservice
├── 🔒 security-scan-service/ # Security scanning microservice
├── 📢 notification-service/ # Notification microservice
├── 🖥️ dashboard/ # React frontend application
├── 🏗️ terraform/ # Infrastructure as Code
├── ☸️ k8s/ # Kubernetes manifests
├── 🔄 .github/workflows/ # CI/CD pipelines
├── 📚 docs/ # Documentation
├── 📋 API_DESIGN.md # API specifications
├── 🛠️ TECH_STACK.md # Technology details
├── 🔧 SETUP.md # Development setup guide
├── 📈 WORKFLOW.md # Development workflow
└── 🐳 docker-compose.yml # Local development orchestration

## 🔧 Development

### Service Development Status
- [ ] Authentication Service
- [ ] Project Service  
- [ ] Code Analysis Service
- [ ] Code Generation Service
- [ ] Security Scan Service
- [ ] Notification Service
- [ ] Dashboard Service

### Development Commands
Start individual service
cd auth-service
python -m uvicorn main:app --reload --port 8000

Run tests
python -m pytest tests/

Build specific service
docker build -t aiforge/auth-service ./auth-service

View logs
docker-compose logs -f auth-service

## 🔒 Security

- **Authentication:** JWT tokens with refresh mechanism
- **Authorization:** Role-based access control
- **Data Protection:** Encrypted sensitive data storage
- **Container Security:** Vulnerability scanning with Trivy
- **Dependency Security:** Automated scanning with Snyk
- **Code Security:** Static analysis with SonarQube
- **Runtime Security:** Dynamic scanning with OWASP ZAP

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is currently not licensed. All rights reserved.

## 👨‍🎓 Academic Project

This project is developed as part of a **Cloud Native Applications and DevOps** university course, demonstrating:
- Advanced microservices design patterns
- Cloud-native development practices
- AI integration in development workflows
- Modern DevOps and DevSecOps practices
- Infrastructure automation and management

---

**⭐ If you find this project helpful, please give it a star on GitHub!**

**📧 Contact:** [your.email@example.com](mailto:your.email@example.com)
**🐙 GitHub:** [https://github.com/yourusername](https://github.com/yourusername)
