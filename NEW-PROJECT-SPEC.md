# Invoice Presenter - Project Specification

## Project Overview
A React web application that allows users to upload Excel files containing invoice/work log data, display it in a table, and mark rows as "Done" with fun confirmation messages.

## Technical Requirements

### Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine v7
- **Excel Parsing**: XLSX library
- **Testing**: Playwright
- **Deployment**: GitHub Pages

### Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mantine/core": "^7.0.0",
    "@mantine/hooks": "^7.0.0",
    "@tabler/icons-react": "^3.0.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
```

## Functional Requirements

### 1. Excel File Upload
- Accept `.xlsx` and `.xls` files
- Validate that file contains these required columns (case-insensitive):
  - Account Name
  - Issue Key
  - Issue summary
  - Work Description
  - Logged Hours
  - Work date
  - Full name
- Display error message if:
  - File is empty
  - Required columns are missing
  - No valid data rows found
- Sort data alphabetically by Account Name after parsing

### 2. Data Table Display
- Show data in a responsive table with:
  - Striped rows (alternating background colors)
  - Hover effect on rows
  - Fixed column widths (12.5% each)
  - Table borders and column borders
  - Proper text wrapping for long content
- **Issue Key Column**: 
  - Display as clickable link
  - Format: `https://plyolabs.atlassian.net/browse/{issueKey}`
  - Open in new tab (`target="_blank"`, `rel="noopener noreferrer"`)
- **Work Description Column**:
  - Display full text with word wrapping
  - Include a copy button (icon) that:
    - Copies text to clipboard
    - Shows green checkmark icon for 2 seconds after copying
    - Has tooltip: "Copy work description" / "Copied!"
- **Done Column**:
  - Contains a "Done" button for each row
  - Button styling changes when row is marked as done

### 3. Done Button Functionality
- Each row has a "Done" button in the last column
- **Normal State**:
  - Transparent background
  - Gray border (#ccc)
  - Dark text (#333)
- **Done State**:
  - Green background (#51cf66)
  - White text
  - No border
- **Behavior**:
  - Click toggles done state
  - When marking as done: Show confirmation message
  - When unmarking: Hide confirmation message
  - Row background changes to light green (#e8f5e9) when done

### 4. Confirmation Message System
- Display a green alert box when a row is marked as "Done"
- **Alert Design**:
  - Background: #d4edda (light green)
  - Border: 1px solid #c3e6cb
  - Text color: #155724 (dark green)
  - Padding: 12px 16px
  - Border radius: 4px
  - Margin bottom: 16px
- **Content**:
  - Icon: 💰 (moneybag emoji)
  - Title: "💰 Done!"
  - Message: Randomly selected from list of 200 Norwegian messages
- **Auto-hide**: Message disappears automatically after 5 seconds
- **Manual close**: Optional close button (X) to dismiss immediately

### 5. Norwegian Confirmation Messages
- Array of 200 fun Norwegian messages
- All messages end with 👰 emoji
- Example messages:
  - "Trykk \"send\" – la inntekten kjenne at du mener det. 👰"
  - "Hold prisen stram – marginen blir kåt av disiplin. 👰"
  - "Få fakturaen inn i systemet før du rekker å bli snill. 👰"
- Function `getRandomDoneMessage()` returns a random message
- Store messages in `src/doneMessages.ts`

## UI/UX Specifications

### Layout
- Container: Mantine Container with `size="xl"`
- Vertical padding: `py="xl"`
- Use Mantine Stack with `gap="lg"` between elements

### Title
- Text: "💰 Invoice Presenter"
- Use Mantine Title component with `order={1}`
- Include moneybag emoji (💰)

### File Input
- Use Mantine FileInput component
- Label: "Upload Excel file"
- Placeholder: "Select an Excel file (.xlsx, .xls)"
- Accept: `.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel`
- Show upload icon (IconUpload from @tabler/icons-react)

### Table
- Use Mantine Table component with:
  - `striped` prop
  - `highlightOnHover` prop
  - `withTableBorder` prop
  - `withColumnBorders` prop
  - `verticalSpacing="sm"`
  - `horizontalSpacing="md"`
  - `layout="fixed"`
- Column widths: 12.5% each (8 columns total)
- Row styling: Background color #e8f5e9 when done

### Done Button
- Type: HTML `<button>` element (not Mantine Button)
- Attributes:
  - `type="button"`
  - `data-testid="done-button-{index}"` (for testing)
- Styling:
  - Padding: 4px 12px
  - Font size: 12px
  - Border radius: 4px
  - Cursor: pointer
  - Normal: transparent bg, gray border, dark text
  - Done: green bg (#51cf66), white text, no border

### Copy Button
- Use Mantine ActionIcon component
- Variant: "subtle"
- Size: "sm"
- Icons:
  - Default: IconCopy
  - After copy: IconCheck (green color)
- Show tooltip with Mantine Tooltip

## File Structure

```
src/
  ├── App.tsx              # Main component
  ├── main.tsx             # Entry point (ReactDOM render)
  └── doneMessages.ts      # Array of 200 Norwegian messages + getRandomDoneMessage()

test-done-message.spec.ts  # Playwright test
package.json               # Dependencies
vite.config.ts            # Vite configuration
```

## Implementation Order

### Phase 1: Minimal Done Button + Message
1. Create basic React app with Vite
2. Install Mantine dependencies
3. Create `doneMessages.ts` with all 200 messages
4. Implement:
   - Title: "💰 Invoice Presenter"
   - Single "Done" button
   - Confirmation message display
   - Auto-hide after 5 seconds
5. Test: Button click shows random message, message disappears after 5 seconds

### Phase 2: Excel Upload + Table
1. Install XLSX library
2. Implement file upload with Mantine FileInput
3. Parse Excel file:
   - Validate required columns
   - Extract data rows
   - Sort by Account Name
4. Display data in Mantine Table
5. Test: Upload Excel file, see data in table

### Phase 3: Table Features
1. Add Issue Key as clickable link
2. Add copy button to Work Description
3. Implement clipboard API for copying
4. Test: Links work, copy button works

### Phase 4: Done Button in Table
1. Add "Done" column to table
2. Add Done button to each row
3. Implement toggle functionality
4. Update row background when done
5. Show confirmation message when marking as done
6. Test: Each row can be marked done, message appears

### Phase 5: Polish & Testing
1. Add error handling
2. Add loading states
3. Write Playwright tests
4. Test all functionality end-to-end

## Testing Requirements

### Playwright Test
- Test file: `test-done-message.spec.ts`
- Test cases:
  1. Page loads and shows title
  2. Done button is visible
  3. Clicking Done button shows confirmation message
  4. Message contains "Done!" and a Norwegian message
  5. Message disappears after 5 seconds
  6. (Optional) Upload Excel file and test Done button in table

## Deployment

### GitHub Pages
- Base path: `/invoicepresenter/`
- Build output: `./dist`
- Create `.nojekyll` file in dist to disable Jekyll processing
- GitHub Actions workflow:
  - Trigger: Push to main branch
  - Steps: Checkout → Setup Node → Install → Build → Deploy

### Vite Config
```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/invoicepresenter/' : '/',
  build: {
    outDir: 'dist',
  },
})
```

## Important Notes

1. **Start Simple**: Implement Phase 1 first and verify it works before moving on
2. **Use Plain HTML Button**: For Done button, use `<button>` not Mantine Button to avoid event handling issues
3. **Test Early**: Write tests as you implement each phase
4. **Check Console**: Always check browser console for JavaScript errors
5. **State Management**: Use React `useState` for:
   - File state
   - Table data
   - Done rows (Set<number>)
   - Done message (string | null)
   - Copied index (number | null)
   - Error message (string | null)

## Success Criteria

✅ User can upload Excel file
✅ Data displays correctly in table
✅ Issue Key links work
✅ Copy button works
✅ Done button toggles row state
✅ Confirmation message appears with random Norwegian text
✅ Message auto-hides after 5 seconds
✅ All functionality works in browser
✅ Playwright tests pass

## Getting Started Commands

```bash
# Create new project
npm create vite@latest invoice-presenter -- --template react-ts
cd invoice-presenter

# Install dependencies
npm install @mantine/core @mantine/hooks @tabler/icons-react xlsx
npm install -D @playwright/test @types/node

# Start dev server
npm run dev

# Run tests
npx playwright test
```

