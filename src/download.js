const {promisify} = require('util')
const ora = require('ora')
const downloadRepo = promisify(require('download-git-repo'))

module.exports.clone = async function(repo, desc){
    const process = ora(`download ${repo}`)
    process.start()
    await downloadRepo(repo, desc).catch(err=>{
        console.error(err)
    })
    process.succeed()
}   