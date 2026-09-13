// @ts-check
import prettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Prettier йде останнім і вимикає всі правила про форматування:
  // формат — зона відповідальності Prettier, ESLint відповідає за код.
  prettier,
  {
    rules: {
      // Заглушки фази 1 навмисно приймають аргументи, які ще не використовують.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
    },
  },
)
