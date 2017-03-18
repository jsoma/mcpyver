import Executable from './executable'
import { VirtualEnv } from '../environments'

export default class VirtualEnvExecutable extends Executable {

  /**
   * Collects the details about the virtualenv executable and
   * any environments that it might be holding
   * @abstract
   * @return {Promise}
   */
  setExtras () {
    return this.setEnvironments()
      .then(() => this.populateEnvironments())
      .then(() => this)
  }

  setEnvironments () {
    return VirtualEnv.find()
      .then((envs) => {
        this.environments = envs
        return this
      })
  }

  populateEnvironments () {
    let promises = this.environments.map((env) => env.populate())
    return Promise.all(promises)
  }

}
