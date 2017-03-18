import { exec } from '../executive'
import { ls } from 'shelljs'
import { access, constants } from 'fs'
import Executable from './executable'

export default class PipExecutable extends Executable {

  setExtras () {
    this.setPackageDirectory()
    return Promise.all([
      this.setPackageDirectoryDetails(),
      this.setPackages(),
      this.setPythonVersion()
    ])
  }

  setPythonVersion () {
    this.pythonVersion = this.rawVersion.trim().match(/python ([\d.]+)/i)[1]
  }

  cleanVersion () {
    return this.rawVersion.trim().match(/pip ([\d.]+)/i)[1]
  }

  setPackageDirectory () {
    this.packageDir = this.rawVersion.trim().match(/pip [\d.]+ from (.*) \(python/)[1]
  }

  setPackageDirectoryDetails () {
    this.packageDirDetails = ls('-dl', this.packageDir)[0]
    return new Promise((resolve, reject) => {
      access(this.packageDir, constants.R_OK | constants.W_OK, (err) => {
        this.access = !err
        resolve(this)
      })
    })
  }

  get mergeField () {
    return this.packageDir
  }

  assureMergeable () {
    /* Need to set the version */
    return this.setVersion()
      .then(() => this.setPackageDirectory())
      .catch(err => this.addError(err))
  }

  getPackageListing () {
    return new Promise((resolve, reject) => {
      let listCommand = `${this.path} list`

      exec(listCommand, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        }
        resolve(stdout)
      })
    })
  }

  setPackages (legacy = true) {
    return this.getPackageListing()
      .then((listing) => {
        this.packages = PipExecutable.parsePackageList(listing)
        return this
      })
  }

  static parsePackageList (list) {
    if (!list) {
      return []
    }
    // This replace gets rid of the headers
    let lines = list.replace(/[\s\S]*-{5,}/gm, '').trim().split('\n')

    // Convert them to objects, remove any blanks
    return lines.map(PipExecutable.parsePackageLine).filter(p => p)
  }

  static parsePackageLine (line) {
    if (line.indexOf('(') !== -1) {
      return PipExecutable.parseLegacyPackageLine(line)
    } else {
      return PipExecutable.parseColumnPackageLine(line)
    }
  }

  static parseLegacyPackageLine (line) {
    let cleaned = line.trim()
    let matches = cleaned.match(/(.*) \((\d.+)\)/)
    if (!matches) {
      return
    }
    return { raw: cleaned, name: matches[1], version: matches[2] }
  }

  static parseColumnPackageLine (line) {
    let cleaned = line.trim().replace(/\s+/, ' ')
    let matches = cleaned.match(/(.*)\s+(\d.+)/)
    if (!matches) {
      return
    }
    return { raw: cleaned, name: matches[1], version: matches[2] }
  }

}
