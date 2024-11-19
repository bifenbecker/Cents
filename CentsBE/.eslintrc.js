module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
    },
    extends: ['airbnb', 'prettier'],
    plugins: ['prettier'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2020,
    },
    rules: {
        'no-multi-assign': 'off',
        'no-lonely-if': 'off',
        'no-shadow': 'off',
        'no-extra-boolean-cast': 'off',
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-restricted-syntax': 'off',
        'no-unused-vars': [
            'error',
            {
                argsIgnorePattern: 'req|res|next|_',
            },
        ],
        'class-methods-use-this': 'off',
        'no-await-in-loop': 'off',
        'no-multiple-empty-lines': 'off',
        'no-param-reassign': 'off',
        'prettier/prettier': ['error'],
        'no-nested-ternary': 'off',
        'prefer-regex-literals': 'off',
        'default-param-last': 'off',
    },
};
