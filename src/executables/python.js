import { exec } from '../executive'
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
      let exportCmd = "import sys; print(':::'.join(path for path in sys.path if path))"
      let cmd = `${this.path} -c "${exportCmd}"`
      exec(cmd, (error, stdout, stderr) => {
        // TODO
        if (error) {
          reject(error)
        }
        this.sysPath = stdout.trim().split(':::')
        resolve(this)
      })
    })
  }

  pathContains (str) {
    return this.realpath.toLowerCase().indexOf(str.toLowerCase()) !== -1
  }

  detectInstaller () {
    if (this.rawVersion && this.rawVersion.indexOf('Anaconda') !== -1) {
      this.installer = 'Anaconda'
    }

    /* NB: The Miniconda one also says Continuum, but Anaconda is probably more popular */
    if (this.rawVersion && this.rawVersion.indexOf('Continuum') !== -1) {
      this.installer = 'Anaconda'
    }

    if (this.realpath) {
      /* Custom Distributions */
      if (this.pathContains('Enthought')) { this.installer = 'Canopy' }
      if (this.pathContains('Canopy')) { this.installer = 'Canopy' }
      if (this.pathContains('anaconda')) { this.installer = 'Anaconda' }
      if (this.pathContains('miniconda')) { this.installer = 'Miniconda' }

      /* OS X */
      if (this.pathContains('Cellar')) { this.installer = 'Homebrew' }
      /* Note the order on these! */
      /* Honestly though I guess we don't know, anything can install here */
      // if (this.pathContains('/Library/Frameworks/Python.framework')) { this.installer = 'Python.org' }
      // if (this.pathContains('/System/Library/Frameworks/Python.framework')) { this.installer = 'Default-OSX' }

      /* Windows */
      if (this.pathContains(':\\PYTHON27\\PYTHON')) { this.installer = 'Python.org' }
      if (this.pathContains('APPDATA\\LOCAL\\PROGRAMS\\PYTHON')) { this.installer = 'Python.org' }
    }

    if (this.installer) {
      this.installerSlug = this.installer.toLowerCase().replace(/[^A-Za-z]/, '')
    }
  }

}
