#!/usr/bin/env node

const program = require('commander')
const version = require('../lib/version')
program.version(version)

program
  .command('init <pkg-name>')
  .description('generate a project from a remote template')
  .option('-t --template', 'Use specific template')
  .option('-c --clone', 'Use git clone when fetching remote template')
  .action(require('../lib/init'))

program.parse(process.argv)
