module.exports = {
  // TypeScript and JavaScript files
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'git add',
  ],
  
  // JSON files
  '*.json': [
    'prettier --write',
    'git add',
  ],
  
  // CSS and SCSS files
  '*.{css,scss,sass}': [
    'prettier --write',
    'git add',
  ],
  
  // Markdown files
  '*.md': [
    'prettier --write',
    'git add',
  ],
  
  // YAML files
  '*.{yml,yaml}': [
    'prettier --write',
    'git add',
  ],
  
  // Run type checking for TypeScript files
  '*.{ts,tsx}': [
    () => 'tsc --noEmit',
  ],
  
  // Run tests for test files
  '*.{test,spec}.{ts,tsx}': [
    () => 'npm run test:run',
  ],
};
