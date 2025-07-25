# Scizor

A comprehensive desktop application with backend services for enhanced productivity and system management.

## Project Structure

```
Scizor/
├── backend/          # Node.js/NestJS backend services
├── desktop/          # Python desktop application
├── docs/            # Documentation
└── terraform/       # Infrastructure as Code
```

## Components

### Backend (`/backend`)
- **Technology**: Node.js, NestJS, TypeScript
- **Purpose**: API services, data management, business logic
- **Features**: RESTful APIs, database integration, authentication

### Desktop (`/desktop`)
- **Technology**: Python, PyQt6/PySide6
- **Purpose**: Cross-platform desktop application
- **Features**: Clipboard management, system integration, user interface

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- Git

### Backend Setup
```bash
cd backend
npm install
npm run start:dev
```

### Desktop Setup
```bash
cd desktop
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python src/main.py
```

## Development

### Backend Development
- Run tests: `npm test`
- Build: `npm run build`
- Lint: `npm run lint`

### Desktop Development
- Run tests: `python -m pytest`
- Format code: `black src/`
- Lint: `flake8 src/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license here]

## Support

For support and questions, please open an issue on GitHub. 