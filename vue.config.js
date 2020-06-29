const { execSync } = require('child_process');

const { DefinePlugin } = require('webpack');

const DEMO_VERSION = require('./package.json').version;

// 兼容 Jenkins 指定 COMMIT_ID
let COMMIT_ID = JSON.stringify(process.env.VUE_APP_COMMIT_ID);
if (!COMMIT_ID) {
  try {
    COMMIT_ID = JSON.stringify(execSync('git rev-parse HEAD').toString());
  } catch (err) {}
}

module.exports = {
  outputDir: 'dist',
  publicPath: '.',
  lintOnSave: true,
  productionSourceMap: process.env.NODE_ENV !== 'production',
  pages: {
    index: {
      entry: 'src/index.ts',
      template: 'public/index.html',
    },
  },
  configureWebpack (config) {
    config.plugins.push(
      new DefinePlugin({ 
        COMMIT_ID, 
        DEMO_VERSION: JSON.stringify(DEMO_VERSION),
      }),
    );
  },
};
