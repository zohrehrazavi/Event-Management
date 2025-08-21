#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Custom Fields Tests...\n');

try {
  // Run the tests
  execSync('npm test', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('\n✅ All tests passed successfully!');
} catch (error) {
  console.error('\n❌ Some tests failed. Please check the output above.');
  process.exit(1);
} 