# Invoice Presenter

A Mantine UI-based table viewer application that extracts and displays specific columns from Excel files. Perfect for viewing and managing invoice data.

## Features

- **Excel File Upload**: Upload `.xlsx` or `.xls` files
- **Column Extraction**: Automatically extracts and displays:
  - Account Name
  - Issue Key (clickable Jira links)
  - Issue Summary
  - Work Description (with copy functionality)
  - Logged Hours
  - Work Date
  - Full Name
- **Interactive Table**: 
  - Sortable by Account Name
  - Copy work descriptions to clipboard
  - Mark rows as "Done" (light green background)
  - Responsive design with fixed column widths
- **Multiple Build Options**:
  - Chrome Extension
  - Standalone HTML file

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build Options

#### Chrome Extension

```bash
npm run build:extension
```

The built extension will be in the `dist/` folder. Load it in Chrome via `chrome://extensions/` in developer mode.

#### Standalone HTML

```bash
npm run build:standalone
```

The standalone HTML file will be in the `standalone/` folder. You can open `standalone/index.html` directly in any browser.

## Project Structure

```
├── src/
│   ├── App.tsx          # Main application component
│   └── main.tsx          # React entry point
├── dist/                 # Chrome extension build output
├── standalone/           # Standalone HTML build output
├── icons/                # Extension icons
├── build-extension.js    # Extension build script
├── build-standalone.js   # Standalone build script
└── vite.config.ts        # Vite configuration
```

## Technologies

- React 18
- TypeScript
- Vite
- Mantine UI
- xlsx (Excel file parsing)

## License

MIT


