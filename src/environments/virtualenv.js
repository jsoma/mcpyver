import { exec } from '../executive'
import Environment from './environment'
import { homedir, platform } from 'os'
import { join } from 'path'
import { existsSync } from 'fs'

const WORKON_HOME = join(homedir(), '.virtualenvs')

export default class VirtualEnv extends Environment {

  constructor (name) {
    super()
    this.name = name
    this.basepath = join(WORKON_HOME, this.name)
  }

  getCommandPath (command) {
    return new Promise((resolve, reject) => {
      resolve(join(this.basepath, `/bin/${command}`))
    })
  }

  setEnvData () {
    return Promise.all([
      this.setPipData(),
      this.setPythonData()
    ])
  }

  static get command () {
    return 'virtualenv'
  }

  static lsvirtualenv () {
    return new Promise((resolve, reject) => {
      let cmd = 'lsvirtualenv -b'
      let bashPath = join(homedir(), '.bash_profile')

      if (platform() !== 'win32' && existsSync(bashPath)) {
        cmd = `source ${bashPath};${cmd}`
      }

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        }
        if (stderr) {
          resolve(null)
        } else {
          resolve(stdout)
        }
      })
    })
  }

  static find () {
    return this.lsvirtualenv()
      .then((stdout) => {
        if (!stdout) {
          return []
        }
        let names = stdout.trim().replace(/[\s\S]*={3,}/, '').trim().split('\n')
        return names.map(name => new VirtualEnv(name))
      })
      .catch(() => {
        // should we do something with the error? can't this.addError...
        return []
      })
  }

}
