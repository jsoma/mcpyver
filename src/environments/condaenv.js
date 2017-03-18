import { exec } from '../executive'
import { basename, join } from 'path'
import Environment from './environment'

export default class CondaEnv extends Environment {

  constructor (basepath) {
    super()
    this.basepath = basepath
    this.name = basename(this.basepath)
  }

  getCommandPath (command) {
    return new Promise((resolve, reject) => {
      let activatePath = join(this.basepath, 'bin', 'activate')
      exec(`source ${activatePath} && which ${command}`, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        }
        resolve(stdout.trim())
      })
    })
  }

  getPackages () {
    return new Promise((resolve, reject) => {
      exec(`conda list --prefix ${this.basepath} --json`, (error, stdout, stderr) => {
        if (error) {
          return reject(error)
        }
        resolve(JSON.parse(stdout))
      })
    })
  }

  setEnvData () {
    return this.setPipData()
      .then(() => this.setPythonData())
      .then(() => this.getPackages())
      .then((data) => {
        this.packages = data
        return this
      })
      .catch((error) => {
        this.addError(error)
        return this
      })
  }

  static lsenvs () {
    return new Promise((resolve, reject) => {
      exec(`conda info --envs --json`, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve(JSON.parse(stdout)['envs'])
        }
      })
    })
  }

  static find () {
    return this.lsenvs()
      .then(paths => {
        return paths.map(path => new CondaEnv(path))
      })
  }

  static get command () {
    return 'conda'
  }

}
