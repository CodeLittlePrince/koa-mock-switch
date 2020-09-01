// 创建这个文件的话，本王推荐用eslint --init创建
module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'es6': true
  },
  'extends': [
    'eslint:recommended',
  ],
  'parserOptions': {
    'ecmaVersion': 8
  },
  // https://eslint.org/docs/rules/
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': 0,
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-trailing-spaces': [
      'error',
      {
        'skipBlankLines': true
      }
    ],
    // https://eslint.org/docs/user-guide/configuring#using-configuration-files
    // "off" or 0 - turn the rule off
    // "warn" or 1 - turn the rule on as a warning (doesn’t affect exit code)
    // "error" or 2 - turn the rule on as an error (exit code is 1 when triggered)
    'no-prototype-builtins': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-console': 0,
  }
}