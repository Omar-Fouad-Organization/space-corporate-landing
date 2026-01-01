# SPACE Corporate Landing - GitHub Integration

This project includes automatic GitHub synchronization capabilities for seamless code management and deployment.

## 🚀 Quick Setup

### 1. Initial GitHub Setup
```bash
# Run the setup script
./setup-github.sh

# Or using npm
npm run github:setup
```

### 2. Manual Push to GitHub
```bash
# Quick push script
./push-to-github.sh

# Or using npm
npm run github:push
```

### 3. Auto-Sync (Continuous Integration)
```bash
# Auto-sync with timestamp
./auto-sync.sh

# Or using npm
npm run github:sync
```

## 📋 Prerequisites

1. **GitHub Account**: Create a repository on GitHub
2. **Personal Access Token**: Generate a token with `repo` and `workflow` permissions
3. **Git Configuration**: Ensure git is configured with your credentials

## 🔧 Setup Instructions

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Repository name: `space-corporate-landing` (or your preferred name)
3. Make it public or private as needed
4. **Don't** initialize with README, .gitignore, or license

### Step 2: Generate Personal Access Token
1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`
4. Copy the token (you'll need it for setup)

### Step 3: Run Setup Script
```bash
./setup-github.sh
```

The script will prompt you for:
- GitHub username
- Repository name
- Personal access token

## 🔄 Usage

### Automatic Sync
```bash
# Sync all changes with timestamp
npm run github:sync
```

### Manual Operations
```bash
# Add and commit changes
git add .
git commit -m "Your commit message"

# Push to GitHub
git push github main
```

### Build and Deploy
The project includes GitHub Actions workflow that will:
1. Build the project automatically
2. Deploy to GitHub Pages (if configured)
3. Run tests and linting

## 📁 File Structure

```
.github/
├── workflows/
│   └── deploy.yml          # GitHub Actions workflow
├── setup-github.sh         # Initial setup script
├── auto-sync.sh           # Auto-sync script
├── push-to-github.sh      # Quick push script
└── README-GITHUB.md       # This file
```

## ⚙️ GitHub Actions Workflow

The included workflow (`deploy.yml`) automatically:
- Builds the project on every push
- Runs tests and linting
- Deploys to GitHub Pages
- Syncs code between repositories

## 🌐 GitHub Pages Deployment

To enable GitHub Pages:
1. Go to your repository settings
2. Navigate to "Pages" section
3. Select "GitHub Actions" as source
4. The workflow will automatically deploy on push

Your site will be available at:
`https://[username].github.io/[repository-name]`

## 🔐 Security

- Personal access tokens are stored locally in `.env.local`
- Never commit tokens to the repository
- Use repository secrets for GitHub Actions
- Tokens have minimal required permissions

## 🛠️ Troubleshooting

### Authentication Issues
```bash
# Check remote configuration
git remote -v

# Update GitHub remote URL with token
git remote set-url github https://[username]:[token]@github.com/[username]/[repo].git
```

### Push Failures
```bash
# Force push (use with caution)
git push github main --force

# Check repository permissions
# Ensure token has 'repo' scope
```

### Workflow Failures
1. Check GitHub Actions tab in your repository
2. Verify all secrets are configured
3. Check build logs for specific errors

## 📊 Monitoring

- **Repository**: View at `https://github.com/[username]/[repo]`
- **Commits**: `https://github.com/[username]/[repo]/commits/main`
- **Actions**: `https://github.com/[username]/[repo]/actions`
- **Pages**: `https://[username].github.io/[repo]`

## 🎯 Best Practices

1. **Regular Syncing**: Use `npm run github:sync` after major changes
2. **Meaningful Commits**: Use descriptive commit messages
3. **Branch Protection**: Consider protecting the main branch
4. **Code Reviews**: Use pull requests for collaborative development
5. **Automated Testing**: Leverage GitHub Actions for CI/CD

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Verify token permissions
4. Ensure repository settings are correct

---

**Happy Coding! 🚀**