const path = require('path');
const GenerateConfigFileStep = 'GenerateFile';

module.exports = {
  GenerateConfigFileStep,
  FilePath: {
    // 配置文件路径(最终生成配置文件到此路径)
    Output: path.join(__dirname, '..', 'src', 'config.js'),
    // 默认配置项
    DefaultConfig: path.join(__dirname, 'config.default.js'),
    // 配置模板
    ConfigTpl: path.join(__dirname, 'config.tpl'),
  },
  Steps: [
    'npm install',
    GenerateConfigFileStep,
  ],
};
