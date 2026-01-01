#!/bin/bash

# GitHub Auto-Sync Setup Script for SPACE Corporate Landing
# This script sets up automatic GitHub synchronization

echo "🚀 Setting up GitHub Auto-Sync for SPACE Corporate Landing"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Checking current Git configuration..."

# Check current Git status
git status

print_status "Current Git remotes:"
git remote -v

echo ""
echo "📋 To set up automatic GitHub sync, you need to:"
echo "1. Create a new repository on GitHub"
echo "2. Get a GitHub Personal Access Token"
echo "3. Configure the repository secrets"
echo ""

read -p "Do you want to continue with GitHub setup? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Setup cancelled by user."
    exit 0
fi

echo ""
echo "🔧 GitHub Repository Setup Instructions:"
echo "========================================"
echo ""
echo "1. Go to https://github.com and create a new repository"
echo "   - Repository name: space-corporate-landing (or your preferred name)"
echo "   - Make it public or private as needed"
echo "   - Don't initialize with README, .gitignore, or license"
echo ""
echo "2. Get your GitHub Personal Access Token:"
echo "   - Go to https://github.com/settings/tokens"
echo "   - Click 'Generate new token (classic)'"
echo "   - Select scopes: repo, workflow"
echo "   - Copy the token (you'll need it next)"
echo ""

read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your GitHub repository name: " GITHUB_REPO
read -s -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_REPO" ] || [ -z "$GITHUB_TOKEN" ]; then
    print_error "All fields are required. Please run the script again."
    exit 1
fi

GITHUB_REPO_URL="https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"

print_status "Setting up GitHub remote..."

# Add GitHub as a remote (if not already exists)
if git remote get-url github >/dev/null 2>&1; then
    print_warning "GitHub remote already exists. Updating URL..."
    git remote set-url github $GITHUB_REPO_URL
else
    git remote add github $GITHUB_REPO_URL
fi

print_success "GitHub remote configured: $GITHUB_REPO_URL"

# Create or update .env file for local development
if [ ! -f ".env.local" ]; then
    touch .env.local
fi

# Add GitHub configuration to .env.local
echo "" >> .env.local
echo "# GitHub Integration" >> .env.local
echo "GITHUB_USERNAME=$GITHUB_USERNAME" >> .env.local
echo "GITHUB_REPO=$GITHUB_REPO" >> .env.local

print_success ".env.local updated with GitHub configuration"

# Create a simple push script
cat > push-to-github.sh << EOF
#!/bin/bash
# Quick push to GitHub script

echo "🚀 Pushing to GitHub..."

# Add all changes
git add .

# Commit with timestamp
COMMIT_MSG="Auto-update: \$(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "\$COMMIT_MSG" || echo "No changes to commit"

# Push to GitHub
git push github main

echo "✅ Push to GitHub completed!"
EOF

chmod +x push-to-github.sh

print_success "Created push-to-github.sh script"

# Initial push to GitHub
print_status "Performing initial push to GitHub..."

# Add all current files
git add .

# Commit current state
git commit -m "Initial commit: SPACE Corporate Landing with Admin Dashboard" || echo "No changes to commit"

# Push to GitHub
if git push github main; then
    print_success "Successfully pushed to GitHub!"
else
    print_error "Failed to push to GitHub. Please check your token and repository settings."
    echo ""
    echo "Manual push command:"
    echo "git push https://${GITHUB_USERNAME}:YOUR_TOKEN@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git main"
fi

echo ""
echo "🎉 GitHub Auto-Sync Setup Complete!"
echo "=================================="
echo ""
echo "📁 Your repository: https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}"
echo ""
echo "🔄 To push changes to GitHub:"
echo "   ./push-to-github.sh"
echo ""
echo "🔧 Manual push:"
echo "   git add ."
echo "   git commit -m 'Your commit message'"
echo "   git push github main"
echo ""
echo "⚙️  For automatic deployment, configure GitHub Pages:"
echo "   1. Go to your repository settings"
echo "   2. Navigate to Pages section"
echo "   3. Select 'GitHub Actions' as source"
echo "   4. The workflow will automatically deploy on push"
echo ""

print_success "Setup completed successfully!"