# SilansAutoCare

A comprehensive auto care management application.

## 🚀 Deployment

This application uses automated deployment from Cursor to Cloudways. For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Start

1. **Development in Cursor**:
   - Edit your code in Cursor editor
   - Commit and push to GitHub
   - Automatic deployment triggers

2. **Deployment to Cloudways**:
   - Push to `main` branch triggers auto-deployment
   - GitHub Actions handles the build and transfer
   - Application automatically restarts on Cloudways

## 📋 Prerequisites

- Node.js (v18 or higher)
- Cloudways hosting account
- GitHub repository access
- Cursor editor

## 🛠️ Setup

### For Development

```bash
# Clone the repository
git clone https://github.com/sosilans/SilansAutoCare.git
cd SilansAutoCare

# Install dependencies
npm install

# Run development server
npm run dev
```

### For Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment setup instructions.

## 📦 Features

- Automated deployment pipeline
- Cloudways hosting integration
- GitHub Actions CI/CD
- Cursor editor integration

## 🔒 Security

- SSH key-based authentication
- Secure GitHub secrets management
- Production environment variables

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [GitHub Actions](./.github/workflows/deploy-cloudways.yml) - Deployment workflow

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes in Cursor
3. Test locally
4. Push to GitHub
5. Deployment to Cloudways happens automatically when merged to `main`

## 📝 License

[Add your license here]

## 👥 Authors

- SilansAutoCare Team

---

For support or questions, please create an issue in this repository.