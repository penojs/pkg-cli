const clear = require('clear');
const chalk = require('chalk');
const rimraf = require('rimraf');
const path = require('path');
const ora = require('ora');
const { promisify } = require('util');
const inquirer = require('inquirer');
const exists = require('fs').existsSync;
const version = require('./version');

const log = (...args) => console.log(chalk.green(...args));
const logError = (...args) => console.log(chalk.red(...args));
const rimrafAsync = promisify(rimraf);
const downloadRepo = promisify(require('download-git-repo'));

module.exports = async (pkgName, options = {}) => {
    clear();
    log('pkg-cli', `v${version}`);

    if (!pkgName) {
        log('Package name is required.');
        return;
    }

    await checkPkgExists(pkgName).catch((e) => {
        logError(e);
    });

    await generate(pkgName, options).catch((e) => {
        logError(e);
    });
};

async function checkPkgExists(pkgName) {
    const to = path.resolve(process.cwd(), pkgName);
    if (exists(to)) {
        logError('Target directory exists.');
        await inquirer
            .prompt([
                {
                    type: 'confirm',
                    message: 'Target directory exists. Remove it?',
                    name: 'ok',
                },
            ])
            .then(async (answers) => {
                if (answers.ok) {
                    await rimrafAsync(to);
                } else {
                    throw new Error('Target directory exists.');
                }
            })
            .catch((e) => {
                throw e;
            });
    }
}

async function generate(pkgName, options = {}) {
    log(`Init project: ${pkgName}`);

    const tplName = options.template || 'react-ts';
    const repo = `penojs/pkg-template-${tplName}`;

    const spinner = ora(`Download ${repo}`);
    spinner.start();
    // clone git repo into pkg dir.
    await downloadRepo(repo, pkgName).catch((err) => {
        console.log();
        logError(`Fail to download template ${tplName}: ${err.message}`);
        spinner.stop();
    });

    spinner.stop();
}
