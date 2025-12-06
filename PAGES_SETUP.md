# How to Make Your App Visible on GitHub Pages

## Simple Steps:

1. **Go to your repository settings:**
   - Visit: https://github.com/plyotools/invoicepresenter/settings/pages
   - (Or: Click "Settings" tab → Scroll down to "Pages" in the left menu)

2. **Under "Source":**
   - Select: **"Deploy from a branch"**
   - Branch: Select **"main"**
   - Folder: Select **"/standalone"**
   - Click **"Save"**

3. **Wait 1-2 minutes** for GitHub to build your site

4. **Your app will be live at:**
   ```
   https://plyotools.github.io/invoicepresenter/
   ```

That's it! The standalone HTML file will be automatically served.

## Note:
You'll need to rebuild and push the standalone folder each time you make changes:
```bash
npm run build:standalone
git add standalone/
git commit -m "Update standalone build"
git push
```

