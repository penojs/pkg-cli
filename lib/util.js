const { spawn } = require('child_process')
const ora = require('ora')
const chalk = require('chalk')

async function runCommand(cmd = '', options = {}) {
  if (!cmd) return
  const _ = cmd.split(' ')
  const command = _[0],
    params = _.slice(1)
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
