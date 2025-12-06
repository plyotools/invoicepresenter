#!/bin/bash
# Setup GitHub authentication for this project

echo "Setting up GitHub authentication for Invoice Presenter project..."
echo ""

# Option 1: Use token from environment or input
if [ -n "$GITHUB_TOKEN" ]; then
    echo "Using GITHUB_TOKEN from environment..."
    echo "$GITHUB_TOKEN" | gh auth login --with-token
    if [ $? -eq 0 ]; then
        echo "✅ Authentication successful!"
        exit 0
    fi
fi

# Option 2: Prompt for token
echo "To set up authentication:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Name it 'Invoice Presenter'"
echo "4. Select scopes: repo, workflow"
echo "5. Generate and copy the token"
echo ""
read -sp "Paste your GitHub token here: " token
echo ""

if [ -n "$token" ]; then
    echo "$token" | gh auth login --with-token
    if [ $? -eq 0 ]; then
        echo "✅ Authentication successful!"
        # Store token in .env for future use (optional, more secure)
        echo "GITHUB_TOKEN=$token" >> .env.local
        echo "Token saved to .env.local (add this file to .gitignore)"
    else
        echo "❌ Authentication failed"
        exit 1
    fi
else
    echo "No token provided"
    exit 1
fi

