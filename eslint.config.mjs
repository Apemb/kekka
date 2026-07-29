import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/'] },
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // Attrape l'assertion asynchrone dont le `await` a été oublié. Rien d'autre ne le fait :
      // Vitest 4 attend la promesse de lui-même et se contente d'un avertissement sur stderr,
      // et `no-unused-expressions` ne voit pas une chaîne qui se termine par un appel.
      '@typescript-eslint/no-floating-promises': 'error'
    }
  }
)
