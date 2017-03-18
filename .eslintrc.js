module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: false,
    node: true
  },
  extends: 'standard',
  plugins: [
  ],
  'rules': {
    'padded-blocks': [2, 
      { 'blocks': 'never', 
        'switches': 'never', 
        'classes': 'always' 
      }
    ],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
