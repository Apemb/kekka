import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/'] },
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module'
    }
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
)
