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

  detectInstaller () {
    if (this.rawVersion && this.rawVersion.indexOf('Anaconda') !== -1) {
      this.installer = 'Anaconda'
    }

    /* NB: The Miniconda one also says Continuum, but Anaconda is probably more popular */
    if (this.rawVersion && this.rawVersion.indexOf('Continuum') !== -1) {
      this.installer = 'Anaconda'
    }

    if (this.realpath) {
      if (this.realpath.indexOf('anaconda') !== -1) { this.installer = 'Anaconda' }
      if (this.realpath.indexOf('miniconda') !== -1) { this.installer = 'Miniconda' }

      /* OS X */
      if (this.realpath.indexOf('Cellar') !== -1) { this.installer = 'Homebrew' }
      if (this.realpath.indexOf('/System/Library/Frameworks/Python.framework') === 0) { this.installer = 'Default-OSX' }
      if (this.realpath.indexOf('/Library/Frameworks/Python.framework') === 0) { this.installer = 'Python.org' }

      /* Windows */
      if (this.realpath.toUpperCase().indexOf(':\\PYTHON27\\PYTHON') !== -1) { this.installer = 'Python.org' }
      if (this.realpath.toUpperCase().indexOf('APPDATA\\LOCAL\\PROGRAMS\\PYTHON') !== -1) { this.installer = 'Python.org' }
    }

    if (this.installer) {
      this.installerSlug = this.installer.toLowerCase().replace(/[^A-Za-z]/, '')
    }
  }

}
