const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/sanje/OneDrive/Desktop/jobporlat-backend';

function processFile(filePath) {
    if (!filePath.endsWith('.js') || filePath.includes('convert.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. module.exports = { a, b } -> export { a, b }
    content = content.replace(/module\.exports\s*=\s*\{([^}]+)\};?/g, 'export { $1 };');
    
    // 2. module.exports = router -> export default router
    content = content.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);?/g, 'export default $1;');

    // 3. const { a, b } = require('./local') -> import { a, b } from './local.js'
    content = content.replace(/const\s+\{([^}]+)\}\s*=\s*require\((['"])([^'"]+)\2\);?/g, (match, vars, q, modulePath) => {
        let newPath = modulePath;
        if (newPath.startsWith('.') && !newPath.endsWith('.js')) newPath += '.js';
        return `import {${vars}} from '${newPath}';`;
    });

    // 4. const a = require('./local') -> import a from './local.js'
    content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\((['"])([^'"]+)\2\);?/g, (match, varName, q, modulePath) => {
        let newPath = modulePath;
        if (newPath.startsWith('.') && !newPath.endsWith('.js')) newPath += '.js';
        return `import ${varName} from '${newPath}';`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Updated: ' + filePath);
    }
}

function walk(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        if (file === 'node_modules') continue;
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

walk(dir);
console.log('Done');
