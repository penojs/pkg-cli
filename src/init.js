const {promisify} = require('util')
const figlet = promisify(require('figlet'))
const clear = require('clear')
const chalk = require('chalk')
const {clone} = require('./download')
const log = (content) => console.log(chalk.green(content))

module.exports = async pkgName => {
    clear()
    const data = await figlet('PKG-CLI')
    log(data)

    if(!pkgName){
        log('Please specify the dir.')
        return
    }

    log(`创建项目： ${pkgName}`)
    await clone('google/zx#main', pkgName)  // clone git repo into pkg dir.
}
