import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Create standalone directory
const standaloneDir = join(process.cwd(), 'standalone')
if (!existsSync(standaloneDir)) {
  mkdirSync(standaloneDir, { recursive: true })
}

// First, build the app
console.log('Building app...')
const distDir = join(process.cwd(), 'dist')
if (!existsSync(distDir)) {
  console.error('ERROR: dist folder not found. Please run "npm run build" first.')
  process.exit(1)
}

// Read the built HTML
const indexPath = join(distDir, 'index.html')
if (!existsSync(indexPath)) {
  console.error('ERROR: dist/index.html not found.')
  process.exit(1)
}

let html = readFileSync(indexPath, 'utf-8')

// Find and inline CSS
const cssMatch = html.match(/<link[^>]*href=["']([^"']+\.css)["'][^>]*>/i)
if (cssMatch) {
  const cssPath = cssMatch[1]
  const fullCssPath = join(distDir, cssPath)
  if (existsSync(fullCssPath)) {
    const cssContent = readFileSync(fullCssPath, 'utf-8')
    // Replace link tag with style tag
    html = html.replace(/<link[^>]*href=["'][^"']+\.css["'][^>]*>/i, `<style>${cssContent}</style>`)
    console.log(`Inlined CSS: ${cssPath}`)
  }
}

// Remove all existing script tags (we'll add the inlined one at the end)
// Simple approach: remove script tags by matching the opening and closing tags
// This handles both self-closing and regular script tags
html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
// Also handle self-closing script tags (though Vite shouldn't generate these)
html = html.replace(/<script[^>]*\/>/gi, '')

// Find and inline main.js
const mainJsPath = join(distDir, 'assets/main.js')
if (existsSync(mainJsPath)) {
  const jsContent = readFileSync(mainJsPath, 'utf-8')
  // No need to escape </script> since the JS file doesn't contain it
  // Add it before closing body tag - use a more reliable method
  const bodyEndIndex = html.lastIndexOf('</body>')
  if (bodyEndIndex === -1) {
    console.error('ERROR: Could not find </body> tag in HTML')
    process.exit(1)
  }
  // Insert script before </body>
  html = html.slice(0, bodyEndIndex) + 
         `<script type="text/javascript">\n${jsContent}\n</script>\n` + 
         html.slice(bodyEndIndex)
  console.log('Inlined JavaScript: assets/main.js')
} else {
  console.error('ERROR: assets/main.js not found in dist folder')
  process.exit(1)
}

// Clean up the HTML - remove any comments
html = html.replace(/<!--[\s\S]*?-->/g, '')

// Format the HTML nicely (optional, but makes it more readable)
// We'll keep some whitespace for readability, just clean up excessive spaces
html = html.replace(/\n\s*\n/g, '\n')

// Write the standalone HTML file
const standaloneHtmlPath = join(standaloneDir, 'index.html')
writeFileSync(standaloneHtmlPath, html)

// Create .nojekyll file for GitHub Pages
const nojekyllPath = join(standaloneDir, '.nojekyll')
writeFileSync(nojekyllPath, '')
console.log('Created .nojekyll file for GitHub Pages')

console.log('\n✅ Standalone build created!')
console.log(`📁 Location: ${standaloneDir}/index.html`)
console.log('📦 You can now open this HTML file directly in any browser!')
console.log('   Just double-click index.html or open it from your file manager.')

