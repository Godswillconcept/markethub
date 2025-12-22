module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '**/useDeleteReview.js', '**/useAddReview.js', '**/useUpdateReview.js'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '19.1.1' } },
  plugins: ['react-refresh'],
  rules: {
    'react/prop-types': 'off', // specific to this project usually
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ]
  },
  overrides: [
    {
      files: ['fix-imports.js', 'import-audit.js'],
      env: {
        node: true,
        es2020: true
      },
      rules: {
        'no-unused-vars': 'off', // Allow unused variables in utility scripts
        'no-console': 'off' // Allow console.log in utility scripts
      }
    }
  ]
}
