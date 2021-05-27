#!/usr/bin/env node

const path = require('path')
const {runCommand} = require('./lib/util')

async function run(){

    await runCommand('yarn install', {
        silent: true
    })

    await runCommand('ls -lh', {
        cwd: path.resolve('./lib'),
    })

    
}

run().catch(err=>{
    console.error(err)
})