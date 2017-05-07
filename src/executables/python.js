import { execFile } from '../executive'
import Executable from './executable'

export default class PythonExecutable extends Executable {

  setExtras () {
    return Promise.all([
      this.detectInstaller(),
      this.setSysPath()
    ])
    .catch(error => {
      this.addError(error)
      return this
    })
  }

  cleanVersion () {
    return this.rawVersion.trim().match(/python ([\d.\-a-zA-Z]+)/i)[1]
  }

  setSysPath () {
    return new Promise((resolve, reject) => {
      let exportCmd = "import sys; print(':::'.join([path for path in sys.path if path]))"
      let params = ['-c', exportCmd]
      execFile(this.path, params, (error, stdout, stderr) => {
        if (error) {
          this.addError(error)
        } else {
          this.sysPath = stdout.trim().split(':::')
        }
        resolve(this)
      })
    })
  }

  pathContains (str) {
    return this.realpath.toLowerCase().indexOf(str.toLowerCase()) !== -1
  }

  isActivePython () {
    return new Promise((resolve, reject) => {
      let params = ['-c', '"import activestate"']
      execFile(this.path, params, (error, stdout) => {
        resolve(!error)
      })
    })
  }

  detectInstaller () {
    return new Promise((resolve, reject) => {
      if (this.rawVersion && this.rawVersion.indexOf('Anaconda') !== -1) {
        this.installer = 'anaconda'
      }

      /* NB: The Miniconda one also says Continuum, but Anaconda is probably more popular */
      if (this.rawVersion && this.rawVersion.indexOf('Continuum') !== -1) {
        this.installer = 'anaconda'
      }
      if (this.rawVersion && this.rawVersion.indexOf('xy') !== -1) {
        this.installer = 'xy'
      }

      if (this.realpath) {
        /* Custom Distributions */
        if (this.pathContains('Enthought')) { this.installer = 'canopy' }
        if (this.pathContains('Canopy')) { this.installer = 'canopy' }
        if (this.pathContains('anaconda')) { this.installer = 'anaconda' }
        if (this.pathContains('miniconda')) { this.installer = 'miniconda' }

        /* OS X */
        if (this.pathContains('Cellar')) { this.installer = 'homebrew' }
        /* Note the order on these! */
        /* Honestly though I guess we don't know, anything can install here */
        // if (this.pathContains('/Library/Frameworks/Python.framework')) { this.installer = 'Python.org' }
        // if (this.pathContains('/System/Library/Frameworks/Python.framework')) { this.installer = 'Default-OSX' }

        /* Windows */
        if (this.pathContains(':\\PYTHON27\\PYTHON')) { this.installer = 'pythonorg' }
        if (this.pathContains('APPDATA\\LOCAL\\PROGRAMS\\PYTHON')) { this.installer = 'pythonorg' }

        /* if nothing else, test for ActivePython/ActiveState since it isn't in --version */
        if (!this.installer && this.isActivePython()) {
          this.isActivePython()
            .then(answer => {
              if (answer) {
                this.installer = 'activepython'
              }
              resolve(this)
            })
        } else {
          resolve(this)
        }
      }
    })
  }

  assureMergeable () {
    /* Need to set the version */
    return this.setVersion()
      .then(() => this.setSysPath())
      .catch(err => this.addError(err))
  }

  get mergeField () {
    // previously just .realpath
    return JSON.stringify({
      rawVersion: this.rawVersion,
      sysPath: this.sysPath
    })
  }

}
