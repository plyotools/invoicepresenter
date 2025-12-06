// Quick verification script
const fs = require('fs');
const path = require('path');

// Check if doneMessages.ts exists and has content
const doneMessagesPath = path.join(__dirname, 'src', 'doneMessages.ts');
if (fs.existsSync(doneMessagesPath)) {
  const content = fs.readFileSync(doneMessagesPath, 'utf8');
  const messageCount = (content.match(/"/g) || []).length / 2;
  console.log(`✅ doneMessages.ts exists with ~${messageCount} messages`);
} else {
  console.log('❌ doneMessages.ts missing');
}

// Check if App.tsx has the Alert rendering
const appPath = path.join(__dirname, 'src', 'App.tsx');
if (fs.existsSync(appPath)) {
  const content = fs.readFileSync(appPath, 'utf8');
  if (content.includes('doneMessage &&') && content.includes('<Alert')) {
    console.log('✅ Alert component is conditionally rendered');
  } else {
    console.log('❌ Alert component not found in render');
  }
  if (content.includes('setDoneMessage(message)')) {
    console.log('✅ setDoneMessage is called in toggleDone');
  } else {
    console.log('❌ setDoneMessage not found in toggleDone');
  }
}
