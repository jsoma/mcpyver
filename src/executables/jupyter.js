import { exec } from '../executive'
import { realpath } from 'fs'
import Executable from './executable'

export default class JupyterExecutable extends Executable {

  setExtras () {
    return Promise.all([
      this.getKernels()
    ])
  }

  setKernelRealpaths () {
    let promises = this.kernels.map(kernel => {
      return new Promise((resolve, reject) => {
        realpath(kernel.spec.argv[0], (error, path) => {
          // TODO
          if (error) {
            reject(error)
          }
          kernel.realpath = path
          resolve(this)
        })
      })
    })
    return Promise.all(promises)
  }

  getKernels () {
    return new Promise((resolve, reject) => {
      exec(`${this.path} kernelspec list --json`, (error, stdout, stderr) => {
        // TODO
        if (error) {
          reject(error)
        }

        try {
          /* Older Jupyer maybe doesn't support this? */
          let kernelspecs = JSON.parse(stdout).kernelspecs
          this.kernels = Object.keys(kernelspecs).map(function (key) {
            return kernelspecs[key]
          })
        } catch (err) {
          this.addError(err)
          this.kernels = []
        }

        resolve(this.setKernelRealpaths())
      })
    })
  }

}
