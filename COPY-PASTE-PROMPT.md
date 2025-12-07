# Copy-Paste Prompt for New Invoice Presenter Project

Copy everything below this line and paste into a new Cursor project:

---

Create a React + TypeScript application called "Invoice Presenter" with the following requirements:

## Tech Stack
- React 18+ with TypeScript
- Vite as build tool
- Mantine v7 for UI components
- XLSX library for Excel parsing
- Playwright for testing

## Core Functionality

### 1. Excel File Upload
- Accept .xlsx and .xls files
- Validate required columns (case-insensitive): Account Name, Issue Key, Issue summary, Work Description, Logged Hours, Work date, Full name
- Show error if file is empty, missing columns, or has no valid data
- Sort data alphabetically by Account Name

### 2. Data Table
- Display data in Mantine Table with striped rows, hover effect, borders
- Fixed column widths (12.5% each)
- Issue Key: Clickable link to `https://plyolabs.atlassian.net/browse/{issueKey}` (opens in new tab)
- Work Description: Show full text with word wrap + copy button (IconCopy/IconCheck from @tabler/icons-react)
- Done column: Button for each row

### 3. Done Button
- HTML `<button>` element (not Mantine Button)
- Normal state: transparent bg, gray border (#ccc), dark text (#333)
- Done state: green bg (#51cf66), white text, no border
- Toggle functionality: Click to mark/unmark row as done
- Done rows: Light green background (#e8f5e9)

### 4. Confirmation Message
- Show green alert box when row marked as "Done"
- Styling: bg #d4edda, border #c3e6cb, text #155724, padding 12px 16px
- Content: "💰 Done!" + random Norwegian message from array of 200 messages
- Auto-hide after 5 seconds
- All messages end with 👰 emoji

### 5. Norwegian Messages
Create `src/doneMessages.ts` with:
- Array of 200 fun Norwegian messages (all ending with 👰)
- Export function `getRandomDoneMessage()` that returns random message
- Example messages:
  - "Trykk \"send\" – la inntekten kjenne at du mener det. 👰"
  - "Hold prisen stram – marginen blir kåt av disiplin. 👰"
  - "Få fakturaen inn i systemet før du rekker å bli snill. 👰"

## UI Layout
- Title: "💰 Invoice Presenter" (Mantine Title, order={1})
- Mantine Container (size="xl", py="xl")
- Mantine Stack (gap="lg")
- Mantine FileInput with upload icon
- Mantine Table with all specified props

## Implementation Order
1. **Phase 1 (Start Here)**: Minimal Done button + confirmation message (NO Excel yet)
   - Create basic app with title
   - Single "Done" button
   - Show random Norwegian message on click
   - Auto-hide message after 5 seconds
   - Test this works before moving on

2. **Phase 2**: Add Excel upload + table display
3. **Phase 3**: Add Issue Key links + copy button
4. **Phase 4**: Add Done buttons to table rows
5. **Phase 5**: Polish and testing

## Important Notes
- Use plain HTML `<button>` for Done button (not Mantine Button)
- Use React `useState` for: file, tableData, doneRows (Set<number>), doneMessage, copiedIndex, error
- Test each phase before moving to next
- Check browser console for errors
- Use `data-testid="done-button-{index}"` for testing

## Dependencies to Install
```bash
npm install @mantine/core @mantine/hooks @tabler/icons-react xlsx
npm install -D @playwright/test @types/node
```

## Success Criteria
✅ Excel upload works
✅ Data displays in table
✅ Issue Key links work
✅ Copy button works
✅ Done button toggles row state
✅ Confirmation message appears with random Norwegian text
✅ Message auto-hides after 5 seconds

Start with Phase 1 only. Get the minimal Done button + message working first, then we'll add Excel functionality.

---

