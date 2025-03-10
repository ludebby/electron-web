const os = require('os')
const { execSync } = require('child_process')

function getCPUArchitecture () {
  const arch = process.arch

  if (arch === 'x64') {
    if (os.cpus()[0].model.includes('Apple')) {
      return isRunningUnderRosetta() ? 'Apple Silicon (Rosetta 2)' : 'Apple Intel (x86_64)'
    }
    return 'Intel Mac (x86_64)'
  }

  if (arch === 'arm64') {
    return 'Apple Silicon (M1/M2/M3, ARM64)'
  }

  return `未知架構: ${arch}`
}

function isRunningUnderRosetta () {
  try {
    const output = execSync('sysctl -n sysctl.proc_translated').toString().trim()
    return output === '1'
  } catch (e) {
    return false
  }
}

module.exports = { getCPUArchitecture }
