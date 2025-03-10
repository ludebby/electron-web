const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const { exec } = require('child_process')

function setEnvMode (mode, appBaseDir) {
  const envFile = path.join(appBaseDir, 'env.json')
  const env = JSON.parse(fs.readFileSync(envFile))
  env.mode = mode
  fs.writeFileSync(envFile, JSON.stringify(env))
}

// ------------------------------------------ //

async function buildAndCopyWebBuild (appBaseDir) {
  console.log('[tabUI]prepare build')
  await buildAndCopyWebBuildPack(appBaseDir, 'tabUI')
  console.log('[tabUI]build ok')

  console.log('[tab1]prepare build')
  await buildAndCopyWebBuildPack(appBaseDir, 'tab1')
  console.log('[tab1]build ok')

  console.log('[tab2]prepare build')
  await buildAndCopyWebBuildPack(appBaseDir, 'tab2')
  console.log('[tab2]build ok')
}

async function buildAndCopyWebBuildPack (appBaseDir, webName) {
  // 定義路徑
  const webPath = path.join(appBaseDir, '..', webName)
  const webBuildPath = path.join(webPath, 'build')
  const targetPath = path.join(appBaseDir, 'render', webName)

  // console.log(webPath)
  // console.log(webBuildPath)
  // console.log(targetPath)

  await runBuild(webPath)
  await copyBuildDir(webBuildPath, targetPath)
}

// 執行npm run build指令
function runBuild (webPath) {
  return new Promise((resolve, reject) => {
    console.log('正在執行 npm run build...')

    exec('npm run build', { cwd: webPath }, (error, stdout, stderr) => {
      if (error) {
        console.error(`執行錯誤: ${error.message}`)
        reject(error)
        return
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`)
        reject(stderr)
        return
      }
      console.log(`stdout: ${stdout}`)
      resolve()
    })
  })
}

// 複製build目錄
function copyBuildDir (webSource, webTarget) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(webSource)) {
      reject(new Error('目錄不存在:' + webSource))
      return
    }

    console.log('webSource:', webSource)
    console.log('webTarget:', webTarget)

    if (fs.existsSync(webTarget)) {
      fs.rmSync(webTarget, { recursive: true, force: false })
    }

    try {
      fse.copySync(webSource, webTarget, { overwrite: false })
      console.log('copyBuildDir success!')
    } catch (err) {
      console.error(err)
      throw err
    }
    resolve()
  })
}

// ------------------------------------------ //

async function copyWebBuild (appBaseDir) {
  console.log('[tabUI]prepare build')
  copyWebBuildPack(appBaseDir, 'tabUI')
  console.log('[tabUI]build ok')

  console.log('[tab1]prepare build')
  copyWebBuildPack(appBaseDir, 'tab1')
  console.log('[tab1]build ok')

  console.log('[tab2]prepare build')
  copyWebBuildPack(appBaseDir, 'tab2')
  console.log('[tab2]build ok')
}

function copyWebBuildPack (appBaseDir, packName) {
  // 各web程式程式包編譯結果
  const webSource = path.resolve(appBaseDir, '../' + packName + '/build')
  // 複製到main下的web目錄
  const webTarget = path.join(appBaseDir, 'render', packName)

  console.log('webSource:', webSource)
  console.log('webTarget:', webTarget)

  if (fs.existsSync(webTarget)) {
    fs.rmSync(webTarget, { recursive: true, force: false })
  }

  try {
    fse.copySync(webSource, webTarget, { overwrite: false })
    console.log('copyWebBuildPack success!')
  } catch (err) {
    console.error(err)
    throw err
  }
}

// ------------------------------------------ //

module.exports = {
  appId: 'com.m.test',
  productName: 'test app',
  setEnvMode,
  buildAndCopyWebBuild,
  copyWebBuild
}
