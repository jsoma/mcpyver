import { exec } from '../executive'
import { PipExecutable, PythonExecutable } from '../executables'
import Environment from './environment'
import { homedir, platform } from 'os'
import { join } from 'path'

const WORKON_HOME = join(homedir(), '.virtualenvs')

export default class VirtualEnv extends Environment {

  constructor (name) {
    super()
    this.name = name
    this.basepath = join(WORKON_HOME, this.name)
  }

  get pythonPath () {
    return join(this.basepath, '/bin/python')
  }

  get pipPath () {
    return join(this.basepath, '/bin/pip')
  }

  setPipData () {
    return new PipExecutable(this.pipPath).populate()
      .then(results => {
        this.pip = results
        return this
      })
  }

  setPythonData () {
    return new PythonExecutable(this.pythonPath).populate()
      .then(results => {
        this.python = results
        return this
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
      if (platform() !== 'win32') {
        cmd = `source ~/.bash_profile && ${cmd}`
      }

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        }
        resolve(stdout)
      })
    })
  }

  static find () {
    return this.lsvirtualenv()
      .then((stdout) => {
        let names = stdout.trim().split('\n')
        return names.map(name => new VirtualEnv(name))
      })
      .catch(error => {
        this.addError(error)
        return this
      })
  }

}
