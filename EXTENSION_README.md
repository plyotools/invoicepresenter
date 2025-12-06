# Chrome Extension Setup

This app can be built as a Chrome extension that opens in a new window.

## Building the Extension

1. **Add your icons** to the `icons/` folder:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

2. **Build the extension**:
   ```bash
   npm run build:extension
   ```

   This will:
   - Build the React app
   - Copy `manifest.json` and `background.js` to `dist/`
   - Copy icon files from `icons/` to `dist/icons/`

3. **Load the extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder

4. **Use the extension**:
   - Click the extension icon in Chrome toolbar
   - A new window will open with the Invoice Presenter app
   - Upload your Excel file and use the app as normal

## File Structure

```
Invoice Presenter/
├── icons/              # Place your icon files here
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── dist/               # Built extension (created after build)
│   ├── index.html
│   ├── manifest.json
│   ├── background.js
│   ├── icons/
│   └── assets/
├── manifest.json       # Extension manifest
├── background.js       # Service worker for extension
└── ...
```

## Development

- For regular web development: `npm run dev`
- For extension development: Build with `npm run build:extension` and reload the extension in Chrome after each build

