const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Replace the placeholder with actual environment variable
content = content.replace(
    "'NETLIFY_API_KEY_PLACEHOLDER'", 
    `'${process.env.NETLIFY_API_KEY}'`
);

fs.writeFileSync(appJsPath, content);