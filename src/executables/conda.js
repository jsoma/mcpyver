import { execFile } from '../executive'
import Executable from './executable'
import { CondaEnv } from '../environments'

export default class CondaExecutable extends Executable {

  /**
   * Collects the details about the conda executable and
   * any environments that it might be holding
   * @abstract
   * @return {Promise}
   */
  setExtras () {
    return this.setDetails()
      .then(() => this.setEnvironments())
      .then(() => this.populateEnvironments())
      .then(() => this)
  }

  setEnvironments () {
    return new Promise((resolve, reject) => {
      this.environments = this.details.envs.map((path) => new CondaEnv(path))
      resolve()
    })
  }

  populateEnvironments () {
    let promises = this.environments.map((env) => env.populate())
    return Promise.all(promises)
  }

  getDetails () {
    return new Promise((resolve, reject) => {
      let params = ['info', '--envs', '--json']
      execFile(this.path, params, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve(JSON.parse(stdout))
        }
      })
    })
  }

  setDetails () {
    return this.getDetails()
      .then(details => {
        this.details = details
        return this
      })
  }

  cleanVersion () {
    return this.rawVersion.trim().match(/conda ([\d.]+)/i)[1]
  }

}
