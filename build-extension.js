import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Create dist directory if it doesn't exist
const distDir = join(process.cwd(), 'dist')
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

// Copy manifest.json
copyFileSync('manifest.json', join(distDir, 'manifest.json'))

// Copy background.js
copyFileSync('background.js', join(distDir, 'background.js'))

// Create icons directory
const iconsDir = join(distDir, 'icons')
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true })
}

// Copy icons from source icons folder if they exist
const sourceIconsDir = join(process.cwd(), 'icons')
if (existsSync(sourceIconsDir)) {
  try {
    const iconFiles = readdirSync(sourceIconsDir).filter(file => 
      file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.svg')
    )
    iconFiles.forEach(file => {
      copyFileSync(join(sourceIconsDir, file), join(iconsDir, file))
    })
    console.log(`Copied ${iconFiles.length} icon file(s) to dist/icons/`)
  } catch (err) {
    console.warn('Could not copy icons:', err.message)
  }
}

// Fix index.html - ensure script is loaded as regular script, not module
const indexPath = join(distDir, 'index.html')
if (existsSync(indexPath)) {
  let html = readFileSync(indexPath, 'utf-8')
  
  // Validate: Check for any source file references (main.tsx, /src/, etc.)
  if (html.includes('main.tsx') || html.includes('/src/')) {
    console.error('ERROR: HTML still contains source file references!')
    console.error('This should not happen - Vite should have transformed these.')
    process.exit(1)
  }
  
  // Find the script tag with src attribute (should be the built main.js)
  const scriptMatch = html.match(/<script[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/)
  if (!scriptMatch) {
    console.error('ERROR: Could not find script tag with src attribute in built HTML')
    process.exit(1)
  }
  
  const scriptSrc = scriptMatch[1]
  
  // Validate: Ensure it's pointing to the built JS file, not source
  if (scriptSrc.includes('.tsx') || scriptSrc.includes('.ts') || scriptSrc.includes('/src/')) {
    console.error(`ERROR: Script src still points to source file: ${scriptSrc}`)
    console.error('Expected: ./assets/main.js or similar')
    process.exit(1)
  }
  
  // Remove ALL script tags (including any in head or body)
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  
  // Remove any link tags with crossorigin (Vite adds this)
  html = html.replace(/<link[^>]*crossorigin[^>]*>/gi, (match) => {
    return match.replace(/\s*crossorigin\s*/gi, ' ')
  })
  
  // Remove any HTML comments that might have been left behind
  html = html.replace(/<!--[\s\S]*?-->/g, '')
  
  // Add script at end of body using chrome.runtime.getURL for proper extension URL resolution
  html = html.replace('</body>', `<script type="text/javascript">
(function() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.src = chrome.runtime.getURL('${scriptSrc}');
    document.body.appendChild(script);
  } else {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.src = '${scriptSrc}';
    document.body.appendChild(script);
  }
})();
</script></body>`)
  
  // Final validation: Ensure no module type or source references remain
  if (html.includes('type="module"') || html.includes("type='module'")) {
    console.warn('WARNING: HTML still contains type="module" after processing')
  }
  
  writeFileSync(indexPath, html)
  console.log('Fixed index.html for Chrome extension compatibility')
  console.log(`  Script src: ${scriptSrc}`)
}

console.log('\n✅ Extension files copied to dist/')
console.log('📦 To load the extension in Chrome:')
console.log('   1. Open chrome://extensions/')
console.log('   2. Enable "Developer mode"')
console.log('   3. Click "Load unpacked"')
console.log('   4. Select the "dist" folder')

