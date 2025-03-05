const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')

function setEnvMode (mode, appBaseDir) {
  const envFile = path.join(appBaseDir, 'env.json')
  const env = JSON.parse(fs.readFileSync(envFile))
  env.mode = mode
  fs.writeFileSync(envFile, JSON.stringify(env))
}

function updateWeb (appBaseDir) {
  const webTarget = path.join(appBaseDir, 'web')
  const webSource = path.resolve(appBaseDir, '../web/build')

  console.log('webTarget:', webTarget)
  console.log('webSource:', webSource)

  if (fs.existsSync(webTarget)) {
    fs.rmSync(webTarget, { recursive: true, force: false })
  }

  try {
    fse.copySync(webSource, webTarget, { overwrite: false })
    console.log('web update success!')
  } catch (err) {
    console.error(err)
    throw err
  }
}

module.exports = {
  appId: 'com.m.test',
  productName: 'test app',
  setEnvMode,
  updateWeb
}
