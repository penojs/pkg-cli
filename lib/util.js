const { spawn } = require('child_process')
const ora = require('ora')
const chalk = require('chalk')

const SPACES_REGEXP = / +/g

function parseCommand(cmd = '') {
  if (!cmd) return []
  const tokens = []

  for (let token of cmd.trim().split(SPACES_REGEXP)) {
    // Allow spaces to be escaped by a backslash if not meant as a delimiter
    const previousToken = tokens[tokens.length - 1]
    if (previousToken && previousToken.endsWith('\\')) {
      // Merge previous token with current one
      tokens[tokens.length - 1] = `${previousToken.slice(0, -1)} ${token}`
    } else {
      tokens.push(token)
    }
  }
  return tokens
}

async function runCommand(cmd = '', options = {}) {
  if (!cmd) return
  const tokens = parseCommand(cmd)
  if (!tokens.length) return

  const command = tokens[0],
    params = tokens.slice(1)
  const silent = options.silent || false
  let spinner,
    tip = chalk.green(`Run command: ${cmd}`)

  if (silent) {
    spinner = ora(tip)
    spinner.start()
  } else {
    console.log('\n' + tip)
  }

  return new Promise((resolve, reject) => {
    const terminal = spawn(command, params, { stdio: 'pipe', ...options })
    if (!silent) {
      terminal.stdout.pipe(process.stdout)
      terminal.stderr.pipe(process.stderr)
    }
    terminal.on('close', code => {
      spinner && spinner.stop()
      if (code) {
        reject()
      } else {
        resolve()
      }
    })
  })
}

module.exports = {
  runCommand,
}
