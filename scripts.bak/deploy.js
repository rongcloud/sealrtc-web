const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const DeployConf = require('./deploy.conf');

const { FilePath, Steps, GenerateConfigFileStep } = DeployConf;
const DefaultConfig = require(FilePath.DefaultConfig);

const showLog = (name, out, err, other) => {
  console.log('\nLogger:', new Date(), name, out || '', err || '', other || '');
};

const runExec = (execName) => {
  return new Promise((resolve, reject) => {
    exec(execName, (err, stdout, stderr) => {
      const func = err ? reject : resolve;
      func({ err, stdout, stderr });
    });
  });
};

const getConfigText = (config, TplPath) => {
  const tpl = fs.readFileSync(TplPath, 'utf-8');
  return tpl.replace(/\{(.+?)\}/g, (regStr) => {
    const key = regStr.substring(1, regStr.length - 1);
    let value = config[key] || '';
    if (Object.prototype.toString.call(value) === '[object String]') {
      value = `"${value}"`;
    }
    return value;
  });
};

const generateConfigFile = (config, tplPath, outPath) => {
  showLog('Config:\n', config, tplPath, outPath);
  return new Promise((resolve, reject) => {
    try {
      const configText = getConfigText(config, tplPath);
      fs.writeFileSync(outPath, configText);
      resolve({});
    } catch (e) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject({ err: e });
    };
  });
};

const getConfig = () => {
  const argv = require('yargs').argv;
  const Config = Object.assign(DefaultConfig, argv);
  return Config;
};

const runStep = (steps, current, callback) => {
  current = current || 0;
  const total = steps.length;

  const stepName = steps[current];
  const isGenerateFile = stepName === GenerateConfigFileStep;

  current++;

  const func = isGenerateFile ? generateConfigFile : runExec;
  const params = [
    isGenerateFile ? getConfig() : stepName,
    FilePath.ConfigTpl,
    FilePath.Output,
  ];

  showLog('Step Start', stepName);
  func(params[0], params[1], params[2]).then(({ err, stdout, stderr }) => {
    showLog('Step Success End', stepName, err, stdout, stderr);
    const isFinished = current === total;
    isFinished ? callback() : runStep(steps, current, callback);
  }).catch(({ err, stdout, stderr }) => {
    showLog('Step Error End', stepName, err, stdout, stderr);
    callback(err);
  });
};

showLog('Deploy Start ....');

runStep(Steps, 0, (error) => {
  if (error) {
    showLog('Deploy Error End', error);
  } else {
    showLog('Deploy Success End');
  }
});
