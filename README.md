# Scizor - AI-Powered Productivity Platform

A comprehensive AI-powered productivity platform that combines intelligent clipboard management, text enhancement, and workflow automation through a desktop application, web services, and cloud infrastructure.

## 🚀 Overview

Scizor transforms your workflow with AI-powered productivity features:
- **Smart Clipboard Management** - Automatic capture and intelligent organization
- **AI Text Enhancement** - GPT-powered prompt improvement and content optimization  
- **Global Hotkeys** - Instant access from anywhere with customizable shortcuts
- **Secure Authentication** - Enterprise-grade JWT security with Firebase integration
- **Cross-Platform Support** - Desktop app, web interface, and cloud backend

## 📁 Project Architecture

```
Scizor/
├── backend/          # Node.js/NestJS backend services (AWS Lambda)
├── desktop/          # Python desktop application (Windows)
├── scizor-website/   # Next.js website and authentication portal
├── terraform/        # Infrastructure as Code (AWS)
└── docs/            # Comprehensive documentation
```

## 🏗️ Components

### Backend (`/backend`)
- **Technology**: Node.js, NestJS, TypeScript, AWS Lambda
- **Purpose**: AI proxy services, authentication, payment processing
- **Features**: 
  - OpenAI API integration (GPT-4, text-to-speech)
  - JWT authentication with Firebase
  - RESTful APIs with Swagger documentation
  - Serverless deployment on AWS Lambda
  - Rate limiting and security middleware

### Desktop Application (`/desktop`)
- **Technology**: Python 3.8+, PyQt6, SQLite
- **Purpose**: Cross-platform productivity desktop application
- **Features**:
  - Smart clipboard history (auto-capture every 500ms)
  - AI-powered text enhancement and response generation
  - Global hotkey system (Ctrl+Alt+S, Ctrl+Alt+N, etc.)
  - Persistent notes with priority system
  - System tray integration and background operation
  - Advanced configuration with 50+ options

### Website (`/scizor-website`)
- **Technology**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Purpose**: Marketing website and authentication portal
- **Features**:
  - Modern landing page with feature showcase
  - Firebase authentication integration
  - Device authorization flow for desktop app
  - Pricing page with Lemon Squeezy integration
  - Responsive design and optimized performance

## 🔧 Technology Stack

### Backend Services
- **Framework**: NestJS with TypeScript
- **Runtime**: Node.js 18+ on AWS Lambda
- **Database**: Firebase Firestore
- **AI**: OpenAI GPT-4, text-to-speech APIs
- **Authentication**: JWT with Firebase Auth
- **Infrastructure**: AWS (Lambda, API Gateway, IAM)
- **Deployment**: Terraform Infrastructure as Code

### Desktop Application
- **Language**: Python 3.8+
- **GUI Framework**: PyQt6
- **Database**: SQLite for local storage
- **HTTP Client**: Requests library
- **System Integration**: pywin32, keyboard, pyperclip
- **Packaging**: PyInstaller for Windows executable

### Web Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Firebase Auth
- **Payment**: Lemon Squeezy integration
- **Deployment**: Optimized for Vercel

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Git** for version control
- **AWS Account** (for deployment)
- **Firebase Project** (for authentication)
- **OpenAI API Key** (for AI features)

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your API keys and secrets

# Development mode
npm run dev

# Build for production
npm run build

# Deploy to AWS (requires Terraform setup)
npm run deploy
```

### Desktop Application Setup
```bash
cd desktop

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python src/main.py

# Build executable (Windows)
python build_installer.py
```

### Website Setup
```bash
cd scizor-website

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Configure Firebase and other services

# Development mode
npm run dev

# Build for production
npm run build
npm run start
```

## 🔐 Authentication Flow

Scizor uses a secure JWT-based authentication system with PKCE (Proof Key for Code Exchange) for desktop applications:

### 1. Website Authorization (OAuth2 + PKCE)
```
User → Website (/auth/device) → Email/Google Login → Consent Page → JWT Token
```

### 2. Desktop Token Exchange
```
Desktop App → Receives Consent Token → Exchanges for Access/Refresh Tokens → Authenticated API Calls
```

### 3. API Request Authentication
All AI endpoints require JWT authentication:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Key Security Features
- **PKCE Protection**: Prevents authorization code interception
- **JWT Tokens**: Secure, stateless authentication
- **Token Refresh**: Automatic token renewal without re-authentication
- **Scope Control**: Granular permission management

## 🏗️ Infrastructure & Deployment

### AWS Architecture
- **API Gateway**: RESTful API with CORS and authentication
- **Lambda Functions**: Serverless NestJS application
- **IAM Roles**: Least-privilege access control
- **Terraform**: Infrastructure as Code for reproducible deployments

### Deployment Process
```bash
# Infrastructure deployment
cd backend/terraform
terraform init
terraform plan
terraform apply

# Application deployment (automated via Terraform)
npm run build  # Builds and packages for Lambda
```

### Environment Configuration
Required environment variables:
- `OPENAI_API_KEY`: OpenAI API access
- `FIREBASE_PROJECT_ID`: Firebase project identifier
- `FIREBASE_CLIENT_EMAIL`: Service account email
- `FIREBASE_PRIVATE_KEY`: Service account private key
- `JWT_SECRET`: Token signing secret (32+ characters)

## 💰 Pricing & Subscription

Scizor offers flexible pricing tiers:

### Free Tier
- **Tokens**: 20 per month
- **Features**: Basic clipboard, limited AI enhancements
- **Notes**: Unlimited local storage

### Premium Tier  
- **Tokens**: 500 per month
- **Features**: Full AI capabilities, text-to-speech, translation
- **Payment**: Managed via Lemon Squeezy integration
- **Renewal**: Automatic monthly token refresh

## 🔧 Development

### Backend Development
```bash
# Testing
npm test                    # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:cov           # Coverage report

# Code Quality
npm run lint               # ESLint
npm run format             # Prettier formatting

# Development
npm run dev                # Watch mode
npm run start:debug        # Debug mode
```

### Desktop Development
```bash
# Testing
python -m pytest tests/              # Run test suite
python tests/test_hotkey_enhance.py  # Specific tests

# Code Quality
black src/                 # Code formatting
flake8 src/               # Linting

# Development
python src/main.py        # Standard mode
python tests/test_hotkey_fixed.py  # Test mode
```

### Website Development
```bash
# Development
npm run dev               # Development server
npm run build             # Production build
npm run lint              # Next.js linting
npm run type-check        # TypeScript checking
```

## 📋 Key Features

### 🤖 AI-Powered Features
- **Prompt Enhancement**: GPT-4 powered text improvement with 7 enhancement types
- **Smart Response Generation**: Context-aware AI responses for various scenarios
- **Text-to-Speech**: High-quality voice synthesis with multiple voices
- **Translation**: Multi-language translation support
- **Content Analysis**: Intelligent text processing and optimization

### 📋 Clipboard Management
- **Auto-Capture**: Monitor clipboard changes every 500ms
- **Smart History**: 15-item history with duplicate prevention
- **Instant Access**: One-click copying from history
- **Search & Filter**: Find clipboard items quickly
- **Background Operation**: Silent monitoring without interference

### 📝 Notes System
- **Persistent Storage**: SQLite database for reliable data storage
- **CRUD Operations**: Create, read, update, delete with auto-save
- **Priority System**: 1-5 scale organization system
- **Inline Editing**: Direct editing in the interface
- **Search Functionality**: Quick note discovery

### ⌨️ Global Hotkeys
- **Dashboard Toggle**: `Ctrl+Alt+S` - Show/hide main interface
- **Quick Notes**: `Ctrl+Alt+N` - Create note from selected text
- **AI Enhancement**: `Ctrl+Alt+H` - Enhance selected text
- **Smart Response**: `Ctrl+Alt+G` - Generate AI response
- **System-Wide**: Works across all applications

### 🔒 Security & Privacy
- **Local Storage**: Notes and clipboard data stored locally only
- **JWT Authentication**: Secure API access with token refresh
- **PKCE Flow**: Enhanced security for desktop applications
- **No Cloud Dependencies**: Core features work offline
- **Encrypted Storage**: Secure handling of authentication tokens

## 🎯 Use Cases

### For Developers
- Enhance code comments and documentation
- Generate intelligent commit messages
- Quick text transformations and formatting
- Clipboard history for code snippets
- AI-powered coding assistance

### For Writers & Content Creators
- Improve writing quality and clarity
- Generate content ideas and outlines
- Text enhancement for different audiences
- Quick note-taking and organization
- Voice synthesis for content review

### For Business Professionals
- Enhance emails and professional communication
- Generate meeting notes and summaries
- Quick access to frequently used text
- Translation for international communication
- Productivity automation with hotkeys

## 📊 System Requirements

### Desktop Application
- **OS**: Windows 10/11 (64-bit)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Storage**: 500 MB disk space
- **Network**: Internet connection for AI features
- **Python**: 3.8+ (for development)

### Development Environment
- **Node.js**: v18 or higher
- **Python**: v3.8 or higher
- **Git**: Latest version
- **AWS CLI**: For deployment (optional)
- **Terraform**: v1.0+ for infrastructure

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/scizor.git
cd scizor
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### 3. Setup Desktop App
```bash
cd ../desktop
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python src/main.py
```

### 4. Access Features
- Use `Ctrl+Alt+S` to toggle the dashboard
- Configure hotkeys in settings
- Authenticate for AI features
- Start enhancing your productivity!

## 🔄 API Endpoints

### AI Services
- `POST /ai/enhance-prompt` - Enhance text prompts
- `POST /ai/generate-response` - Generate AI responses  
- `POST /ai/text-to-speech` - Convert text to speech
- `POST /ai/translate` - Translate text

### Authentication
- `POST /auth/device/token` - Exchange consent token
- `POST /auth/create-user-token` - Create user tokens
- `GET /auth/device` - Device authorization

### Payment
- `POST /payment/new-subscriber` - Upgrade to premium
- `POST /payment/return-to-free` - Downgrade to free
- `POST /payment/monthly-renew` - Process renewals

## 📚 Documentation

- [Backend API Documentation](backend/docs/API_DOCUMENTATION.md)
- [Desktop Application Guide](desktop/docs/)
- [Authentication Flow](JWT_AUTHENTICATION_FLOW_FIXED.md)
- [Deployment Guide](backend/terraform/README.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## 🆘 Support & Community

- **GitHub Issues**: [Report bugs and request features](https://github.com/your-username/scizor/issues)
- **Documentation**: [Comprehensive guides and API docs](docs/)
- **Email Support**: support@scizor.com
- **Community**: Join our community discussions

## 🙏 Acknowledgments

- OpenAI for GPT-4 and AI services
- Firebase for authentication infrastructure
- AWS for reliable cloud hosting
- PyQt6 for desktop application framework
- Next.js team for the excellent web framework

---

**Built with ❤️ by [Shaked Shoshan](https://github.com/shakedshoshan)**

*Scizor - Enhancing productivity through intelligent automation* 