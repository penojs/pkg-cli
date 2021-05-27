const { existsSync, readFile, writeFile } = require('fs')
const path = require('path')
const { promisify } = require('util')
const clear = require('clear')
const chalk = require('chalk')
const rimraf = require('rimraf')
const ora = require('ora')
const inquirer = require('inquirer')
const download = require('download-git-repo')
const version = require('./version')
const { runCommand } = require('./util')

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)
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

  try {
    await checkPkgExists(pkgName)

    await chooseOneTemplate(options)

    const info = await generate(pkgName, options)

    await renamePackageName(pkgName, info.tplName)

    await initGitRepo(pkgName)

    await installDependencies(pkgName)
  } catch (e) {
    logError(e)
    process.exit(1)
  }
}

async function checkPkgExists(pkgName) {
  const to = path.resolve(process.cwd(), pkgName)
  if (existsSync(to)) {
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
        choices: ['js', 'ts', 'react-ts'], // TODO: get template list from git remote
        name: 'template',
      },
    ])
    .then(answers => {
      options.template = answers.template
    })
}

async function generate(pkgName, options = {}) {
  log(`Init project: ${pkgName}`)

  const prefix = 'pkg-template-'
  const tplName = prefix + (options.template || 'react-ts')
  const repo = `penojs/${tplName}`

  const spinner = ora(`Download ${repo}`)
  spinner.start()
  // clone git repo into pkg dir.
  await downloadRepo(repo, pkgName).catch(err => {
    logError(`\nOops, fail to download template ${tplName}: ${err.message}`)
    spinner.stop()
  })

  spinner.stop()

  return {
    tplName,
  }
}

async function renamePackageName(pkgName, tplName) {
  const filePath = path.resolve(`./${pkgName}/package.json`)
  let pkgJsonContent = await readFileAsync(filePath, 'utf8')
  pkgJsonContent = pkgJsonContent.replace(tplName, pkgName)
  await writeFileAsync(filePath, pkgJsonContent)
}

async function initGitRepo(pkgName) {
  await runCommand('git init', {
    cwd: path.join('./' + pkgName),
  })
}

async function installDependencies(pkgName) {
  await runCommand('yarn install', {
    cwd: path.join('./' + pkgName),
  })
}
