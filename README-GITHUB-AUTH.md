# GitHub Authentication Setup

To enable automatic GitHub operations (like creating workflow files, deploying, etc.), set up authentication:

## Quick Setup (Recommended)

1. **Create a GitHub Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: "Invoice Presenter"
   - Scopes: Check `repo` and `workflow`
   - Click "Generate token"
   - Copy the token (you'll only see it once!)

2. **Set up authentication:**
   ```bash
   echo 'YOUR_TOKEN_HERE' | gh auth login --with-token
   ```

3. **Verify it works:**
   ```bash
   gh auth status
   ```

After this, the AI agent can manage your GitHub repository automatically!

## Alternative: Use Environment Variable

If you prefer to use an environment variable:

1. Create the token as above
2. Add to your shell profile (`~/.zshrc` or `~/.bashrc`):
   ```bash
   export GITHUB_TOKEN='your_token_here'
   ```
3. Restart your terminal or run: `source ~/.zshrc`

## Security Note

- Never commit tokens to git (`.env.local` is already in `.gitignore`)
- Tokens with `workflow` scope can modify GitHub Actions - keep them secure
- You can revoke tokens at any time from GitHub settings


