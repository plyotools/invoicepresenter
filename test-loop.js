import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

let attempt = 0;
const maxAttempts = 20;
let lastError = null;

console.log('🔄 Starting test loop to verify Done message functionality...\n');

while (attempt < maxAttempts) {
  attempt++;
  console.log(`Attempt ${attempt}/${maxAttempts}...`);
  
  try {
    // Run the test
    execSync('npx playwright test test-done-message.spec.ts --reporter=list', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // Check if test passed by looking for result file
    if (existsSync('.test-result.json')) {
      const result = JSON.parse(readFileSync('.test-result.json', 'utf8'));
      
      if (result.alertFound) {
        console.log('\n✅ SUCCESS! Alert message is working!');
        console.log(`   Found on attempt ${result.attempts}`);
        console.log(`   Timestamp: ${result.timestamp}`);
        writeFileSync('.test-success.log', `SUCCESS on attempt ${attempt}\n${JSON.stringify(result, null, 2)}`);
        process.exit(0);
      }
    }
    
    // If we get here, test might have passed but we need to verify
    console.log('⚠️  Test completed but need to verify result...');
    
  } catch (error) {
    lastError = error.message;
    console.log(`❌ Attempt ${attempt} failed: ${error.message.substring(0, 100)}`);
    
    // Read failure details if available
    if (existsSync('.test-result.json')) {
      const result = JSON.parse(readFileSync('.test-result.json', 'utf8'));
      console.log(`   Alert found: ${result.alertFound}`);
    }
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

console.log(`\n❌ Failed after ${maxAttempts} attempts`);
if (lastError) {
  console.log(`Last error: ${lastError}`);
}
writeFileSync('.test-failure.log', `Failed after ${maxAttempts} attempts\nLast error: ${lastError}`);

// Analyze what went wrong
if (existsSync('.test-page.html')) {
  console.log('\n📄 Page HTML saved to .test-page.html for analysis');
}
if (existsSync('.test-failure.png')) {
  console.log('📸 Screenshot saved to .test-failure.png');
}

process.exit(1);

