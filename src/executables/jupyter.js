import { execFile } from '../executive'
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
          if (error) {
            this.addError(error)
          } else {
            kernel.realpath = path
          }
          resolve(this)
        })
      })
    })
    return Promise.all(promises)
  }

  getKernels () {
    return new Promise((resolve, reject) => {
      let params = ['kernelspec', 'list', '--json']
      execFile(this.path, params, (error, stdout, stderr) => {
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
