import { exec, execFile } from '../executive'
import { basename } from 'path'
import Environment from './environment'

export default class CondaEnv extends Environment {

  constructor (basepath) {
    super()
    this.basepath = basepath
    this.name = basename(this.basepath)
  }

  getCommandPath (command) {
    return new Promise((resolve, reject) => {
      exec(`source activate ${this.basepath} && which ${command}`, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        }
        resolve(stdout.trim())
      })
    })
  }

  getPackages () {
    return new Promise((resolve, reject) => {
      let params = ['list', '--prefix', this.basepath, '--json']
      execFile('conda', params, (error, stdout, stderr) => {
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
      let params = ['info', '--envs', '--json']
      execFile('conda', params, (error, stdout, stderr) => {
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
