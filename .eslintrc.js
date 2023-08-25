module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "ignorePatterns": [".*", "**/www/*", "**/todo/*", "**/public/*"],
  "plugins": ["sonarjs"],
  "extends": ["eslint:recommended", "plugin:sonarjs/recommended"],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "sonarjs/no-small-switch": "off",
    "sonarjs/cognitive-complexity": "off",
    "sonarjs/no-duplicate-string": "off"
  }
};
