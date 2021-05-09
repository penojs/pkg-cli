const clear = require('clear')
const chalk = require('chalk')
const {clone} = require('./download')
const pkgJson = require('../package.json')
const log = (...args) => console.log(chalk.green(...args))

module.exports = async pkgName => {
    clear()

    log('pkg-cli', `v${pkgJson.version}`)

    if(!pkgName){
        log('Please specify the dir.')
        return
    }

    log(`创建项目： ${pkgName}`)
    await clone('google/zx#main', pkgName)  // clone git repo into pkg dir.
}
