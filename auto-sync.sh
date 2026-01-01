#!/bin/bash

# Auto-sync script for continuous GitHub integration
# This script can be run manually or set up as a cron job

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
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

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not a git repository. Please run from project root."
    exit 1
fi

print_status "Starting auto-sync to GitHub..."

# Check if there are any changes
if git diff-index --quiet HEAD --; then
    print_warning "No changes detected. Nothing to sync."
    exit 0
fi

# Add all changes
print_status "Adding changes..."
git add .

# Create commit message with timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="Auto-sync: $TIMESTAMP"

# Check if there are staged changes
if git diff-index --quiet --cached HEAD --; then
    print_warning "No staged changes to commit."
    exit 0
fi

# Commit changes
print_status "Committing changes..."
if git commit -m "$COMMIT_MSG"; then
    print_success "Changes committed successfully"
else
    print_error "Failed to commit changes"
    exit 1
fi

# Push to GitHub (if remote exists)
if git remote get-url github >/dev/null 2>&1; then
    print_status "Pushing to GitHub..."
    if git push github main; then
        print_success "Successfully pushed to GitHub!"
        
        # Get the GitHub repository URL for display
        GITHUB_URL=$(git remote get-url github | sed 's/\.git$//' | sed 's/https:\/\/.*@github\.com\//https:\/\/github.com\//')
        echo ""
        echo "🔗 View your repository: $GITHUB_URL"
        echo "📊 View commits: $GITHUB_URL/commits/main"
        
    else
        print_error "Failed to push to GitHub"
        exit 1
    fi
else
    print_warning "GitHub remote not configured. Run setup-github.sh first."
    exit 1
fi

print_success "Auto-sync completed successfully!"