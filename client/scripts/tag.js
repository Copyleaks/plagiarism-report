const fs = require('fs');

const packageJsonText = fs.readFileSync('projects/plagiarism-report/package.json', { encoding: 'utf-8' });
const packageJson = JSON.parse(packageJsonText);
console.log(packageJson.version);
