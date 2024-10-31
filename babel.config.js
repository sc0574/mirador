/*
 * babel.config.js used to support a UMD built version of Mirador that is
 * compatible with IE11 and Edge.
 */

const moduleFormatMap = {
  cjs: 'commonjs',
  es: false,
};

// eslint-disable-next-line jsdoc/require-jsdoc
module.exports = function (api) {
  const isDevelopmentEnv = api.env('development');
  const isProductionEnv = api.env('production');
  const isTestEnv = api.env('test');

  const presets = [
    isTestEnv && [
      '@babel/preset-env',
      {
        modules: 'commonjs',
        targets: {
          node: 'current',
        },
      },
    ],
    (isProductionEnv || isDevelopmentEnv) && [
      '@babel/preset-env',
      {
        corejs: 3,
        exclude: ['transform-typeof-symbol'],
        forceAllTransforms: true,
        modules: moduleFormatMap[process.env.MODULE_FORMAT] || false,
        useBuiltIns: 'entry',
      },
    ],
    [
      '@babel/preset-react',
      {
        development: isDevelopmentEnv || isTestEnv,
        runtime: 'automatic',
        useBuiltIns: true,
      },
    ],
  ].filter(Boolean);

  const plugins = [
    'babel-plugin-macros',
    '@babel/plugin-transform-destructuring',
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: false, // Needed to support IE/Edge
        regenerator: true,
      },
    ],
    [
      '@babel/plugin-transform-regenerator',
      {
        async: false,
      },
    ],
    ['transform-react-remove-prop-types',
      {
        ignoreFilenames: ['node_modules'],
        removeImport: true,
      },
    ],
    ['lodash', {
      id: [
        'lodash',
      ],
    },
    ],
  ].filter(Boolean);

  return {
    plugins,
    presets,
  };
};
