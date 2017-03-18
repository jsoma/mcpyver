import { exec } from '../executive'

export default class Environment {

  constructor () {
    this.errors = []
  }

  addError (error) {
    this.errors.push(error)
  }

  populate () {
    return this.setEnvData()
      .then(() => this)
      .catch((error) => {
        this.addError(error)
        return this
      })
  }

  setPipData () {
    return this.getCommandPath('pip')
      .then(path => new PipExecutable(path).populate())
      .then(pip => {
        this.pip = pip
        return this
      })
  }

  setPythonData () {
    return this.getCommandPath('python')
      .then(path => new PythonExecutable(path).populate())
      .then(python => {
        this.python = python
        return this
      })
  }

  getCommandPath (command) {
    return Promise.resolve(this)
  }

  getEnvData () {
    return Promise.resolve({})
  }

  static findAndPopulate () {
    return this.find()
      .then((envs) => {
        return Promise.all(envs.map(env => env.populate()))
      })
  }

  static find () {
    return Promise.all([])
  }

  static isInstalled () {
    return new Promise((resolve, reject) => {
      exec(`${this.command} --version`, (error, stdout, stderr) => {
        // TODO
        if (error) {
          reject(error)
        }
        resolve(stderr.indexOf('command not found') === -1)
      })
    })
  }

}
