#!/bin/bash
# Load GitHub authentication token for this project

if [ -f .env.local ]; then
    source .env.local
    export GH_TOKEN
    echo "✅ GitHub token loaded from .env.local"
    gh auth status 2>&1 | grep -q "Logged in" && echo "✅ GitHub CLI authenticated" || echo "⚠️  Token loaded but not verified"
else
    echo "⚠️  .env.local not found. Run setup-github-auth.sh first"
fi

