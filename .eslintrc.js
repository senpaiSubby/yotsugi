module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier', 'node'],
  rules: {
    'prettier/prettier': ['error'],
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'consistent-return': ['off', { treatUndefinedAsUnspecified: true }],
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'no-plusplus': 'off',
    'no-await-in-loop': 'off',
    'no-param-reassign': 'off',
    'no-restricted-globals': 'off',
    'no-return-assign': 'off',
    'no-nested-ternary': 'off',
    'array-callback-return': 'off',
    'no-eval': 'off',
    'global-require': 'off',
    'no-prototype-builtins': 'off',
    'import/no-dynamic-require': 'off',
    'default-case': 'off',
    curly: ['error']
  }
}
