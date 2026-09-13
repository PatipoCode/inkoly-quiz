/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Скоупи за шарами проєкту — щоб історія читалась без відкривання дифів.
    'scope-enum': [
      1,
      'always',
      ['app', 'db', 'auth', 'editor', 'host', 'screen', 'play', 'realtime', 'i18n', 'ci', 'deps'],
    ],
  },
}
