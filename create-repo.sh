#!/bin/bash
# Script to create GitHub repository using API

echo "🔧 Creating GitHub repository..."

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  GITHUB_TOKEN environment variable not set."
    echo ""
    echo "To create a Personal Access Token:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Give it a name like 'Invoice Presenter Deploy'"
    echo "4. Select scopes: 'repo' (full control of private repositories)"
    echo "5. Click 'Generate token' and copy it"
    echo ""
    echo "Then run:"
    echo "  export GITHUB_TOKEN=your_token_here"
    echo "  ./create-repo.sh"
    echo ""
    exit 1
fi

# Create the repository
echo "📦 Creating repository 'invoicepresenter' in 'plyotools' organization..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/orgs/plyotools/repos \
  -d '{
    "name": "invoicepresenter",
    "description": "Invoice Presenter - Mantine UI table viewer for Excel data",
    "private": false,
    "auto_init": false
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo "✅ Repository created successfully!"
    echo ""
    echo "🚀 Now pushing code..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully deployed to:"
        echo "   https://github.com/plyotools/invoicepresenter"
    else
        echo "❌ Failed to push. Make sure the remote is set:"
        echo "   git remote add origin https://github.com/plyotools/invoicepresenter.git"
        echo "   git push -u origin main"
    fi
elif [ "$HTTP_CODE" -eq 422 ]; then
    echo "⚠️  Repository might already exist. Trying to push..."
    git push -u origin main
elif [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
    echo "❌ Authentication failed. Please check your GITHUB_TOKEN."
    echo "   Make sure it has 'repo' scope and access to 'plyotools' organization."
else
    echo "❌ Failed to create repository. HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi



