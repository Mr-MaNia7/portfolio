import next from 'eslint-config-next';

// Next.js 16 ships eslint-config-next as a native flat-config array,
// so it's imported and spread directly (no @eslint/eslintrc FlatCompat shim).
const eslintConfig = [
  ...next,
  {
    // Agent tooling, not the app: skill assets and browser test scripts, whose
    // use*-named helpers are not React hooks.
    ignores: ['.next/**', 'node_modules/**', '.agents/**', '.claude/**', '.taste-skill/**'],
  },
];

export default eslintConfig;
