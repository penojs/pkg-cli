const exists = require('fs').existsSync
const path = require('path')
const { promisify } = require('util')
const clear = require('clear')
const chalk = require('chalk')
const rimraf = require('rimraf')
const ora = require('ora')
const inquirer = require('inquirer')
const download = require('download-git-repo')
const version = require('./version')

const rimrafAsync = promisify(rimraf)
const downloadRepo = promisify(download)
const log = (...args) => console.log(chalk.green(...args))
const logError = (...args) => console.log(chalk.red(...args))

module.exports = async (pkgName, options = {}) => {
  clear()
  log('pkg-cli', `v${version}`)

  if (!pkgName) {
    log('Package name is required.')
    return
  }

  await checkPkgExists(pkgName).catch(e => {
    logError(e)
  })

  await chooseOneTemplate(options).catch(e => {
    logError(e)
  })

  await generate(pkgName, options).catch(e => {
    logError(e)
  })
}

async function checkPkgExists(pkgName) {
  const to = path.resolve(process.cwd(), pkgName)
  if (exists(to)) {
    logError('Target directory exists.')
    await inquirer
      .prompt([
        {
          type: 'confirm',
          message: 'Target directory exists. Remove it?',
          name: 'ok',
        },
      ])
      .then(async answers => {
        if (answers.ok) {
          await rimrafAsync(to)
        } else {
          throw new Error('Target directory exists.')
        }
      })
      .catch(e => {
        throw e
      })
  }
}

async function chooseOneTemplate(options) {
  if (options.template) return

  await inquirer
    .prompt([
      {
        type: 'list',
        message: 'Choose one template you want to clone:',
        choices: ['js', 'react-ts'], // TODO: get template list from git remote
        name: 'template',
      },
    ])
    .then(answers => {
      options.template = answers.template
    })
}

async function generate(pkgName, options = {}) {
  log(`Init project: ${pkgName}`)

  const tplName = options.template || 'react-ts'
  const repo = `penojs/pkg-template-${tplName}`

  const spinner = ora(`Download ${repo}`)
  spinner.start()
  // clone git repo into pkg dir.
  await downloadRepo(repo, pkgName).catch(err => {
    logError(`\nOops, fail to download template ${tplName}: ${err.message}`)
    spinner.stop()
  })

  spinner.stop()
}
