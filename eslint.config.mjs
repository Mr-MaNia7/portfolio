import next from 'eslint-config-next';

// Next.js 16 ships eslint-config-next as a native flat-config array,
// so it's imported and spread directly (no @eslint/eslintrc FlatCompat shim).
const eslintConfig = [
  ...next,
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
];

export default eslintConfig;
