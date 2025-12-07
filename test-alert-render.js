// Test if Alert component will render correctly
const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

// Extract the Alert rendering section
const alertStart = content.indexOf('{doneMessage &&');
const alertEnd = content.indexOf('</Alert>', alertStart) + 8;
const alertSection = content.substring(alertStart, alertEnd);

console.log('=== Alert Component Check ===');
console.log('Alert section found:', alertSection.length > 0);
console.log('Has conditional render:', alertSection.includes('doneMessage &&'));
console.log('Has Alert component:', alertSection.includes('<Alert'));
console.log('Has title prop:', alertSection.includes('title='));
console.log('Has message content:', alertSection.includes('{doneMessage}'));
console.log('Has color prop:', alertSection.includes('color='));
console.log('Has onClose handler:', alertSection.includes('onClose='));

// Check if doneMessage state is properly initialized
const hasState = content.includes('const [doneMessage, setDoneMessage] = useState<string | null>(null)');
console.log('State initialized:', hasState);

// Check if setDoneMessage is called
const hasSetDone = content.includes('setDoneMessage(message)');
console.log('setDoneMessage called:', hasSetSet);

// Write full analysis
const analysis = {
  alertSectionExists: alertSection.length > 0,
  hasConditionalRender: alertSection.includes('doneMessage &&'),
  hasAlertComponent: alertSection.includes('<Alert'),
  hasTitle: alertSection.includes('title='),
  hasMessage: alertSection.includes('{doneMessage}'),
  hasColor: alertSection.includes('color='),
  hasOnClose: alertSection.includes('onClose='),
  stateInitialized: hasState,
  setDoneCalled: hasSetDone
};

fs.writeFileSync('.alert-analysis.log', JSON.stringify(analysis, null, 2));
console.log('\n✅ Full analysis written to .alert-analysis.log');
