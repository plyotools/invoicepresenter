#!/bin/bash
# Deployment script for Invoice Presenter

echo "🚀 Deploying to GitHub..."

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✓ Remote 'origin' already configured"
else
    echo "⚠️  Remote 'origin' not found. Adding..."
    git remote add origin https://github.com/plyotools/invoicepresenter.git
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed to https://github.com/plyotools/invoicepresenter"
else
    echo "❌ Deployment failed. Make sure:"
    echo "   1. The repository exists at https://github.com/plyotools/invoicepresenter"
    echo "   2. You have push access to the repository"
    echo "   3. Your GitHub credentials are configured"
fi


