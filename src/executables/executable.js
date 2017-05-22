import { execFile } from '../executive'
import { stat, realpathSync } from 'fs'
import { which } from 'shelljs'
import ExecutableCollection from './executable_collection'
import { glob } from 'glob'
import { homedir } from 'os'
import { join, normalize } from 'path'
import trueCasePathSync from 'true-case-path'

/**
 * A specific file on a computer that
 * can be run
*/
export default class Executable {

  /**
   * @param {string} path the full path to the binary
   * @param {string} command a command that executes this file
   * @param {boolean} isDefault whether the command is first in the PATH
   * @todo should prob get rid of command isDefault,
   * replace with init + .addCommand?
   */
  constructor (path, command, isDefault) {
    /**
     * Any paths that you can find this executable at (symlinked or otherwise)
     * @type {string[]} path
     */
    this.paths = path ? [ trueCasePathSync(path) || path ] : []

    /**
     * The commands for which this executable is first in line to run
     * e.g., running which returns it
     * @type {string[]}
     */
    this.defaultCommands = []

    /**
     * Any errors encountered get caught by Promises and added here
     * @type {Error[]}
     */
    this.errors = []

    /**
     * Is this executable the default for any commands?
     * @type {boolean}
     * @todo I think this only exists because of legacy,
     * should probably get rid of it and replace with examining
     * defaultCommands instead
     */
    this.isDefault = isDefault || false
    if (this.isDefault) {
      this.addCommand(command)
    }
  }

  /**
   * Take any rescued error and attach it to the object, e.g.
   * pass errors from the command line to the end user
   * @param {Error} error an error object, typically rescued from elsewhere
   */
  addError (error) {
    this.errors.push({
      error: error,
      message: error.message,
      stack: error.stack
    })
  }

  /**
   * Add a command that this executable is first in line for,
   * e.g. if you run blahblah from the shell this executes
   * @param {string} command
   */
  addCommand (command) {
    if (command && this.defaultCommands.indexOf(command) === -1) {
      this.defaultCommands.push(command)
    }
  }

  /**
   * When merging an ExecutableCollection, this is what you group
   * the executables by. Mostly exists because PipExecutable on
   * Windows has different paths but point to the same package
   * install directory, which makes them equivalent.
   * @type {string}
   * @return {string} the value that makes the executable unique
   */
  get mergeField () {
    return this.realpath
  }

  assureMergeable () {
    return Promise.resolve(true)
  }

  /**
   * Gets the version of the executable by shelling out and
   * running --version
   * @return {Promise<string>} A promise to the version
   */
  requestVersion () {
    return new Promise((resolve, reject) => {
      execFile(this.path, ['--version'], (error, stdout, stderr) => {
        if (error) {
          reject(error)
        }
        resolve(stdout || stderr)
      })
    })
  }

  /**
   * Given a version-y string, do slight cleanup and set the
   * executable's rawVersion. Typically comes from stdout/stderr.
   * @param {string} version the version string, fresh from terminal output
   */
  setRawVersion (version) {
    /**
     * The raw output from stdout/stderr of --version
     * @type {string}
    */
    this.rawVersion = version.trim()
  }

  /**
   * Clean up the rawVersion, pulling out the actual version number
   * @return {string}
   */
  cleanVersion () {
    return this.rawVersion.trim()
  }

  /**
   * Query for and set the rawVersion and version
   * @return {Promise}
   */
  setVersion () {
    return this.requestVersion()
      .then(version => { this.setRawVersion(version) })
      .then(() => {
        /**
         * The version number of the program, typically cleaned up in
         * a subclass
         * @return {string}
        */
        this.version = this.cleanVersion()
        return this
      })
      .then(() => this)
      .catch(error => {
        this.addError(error)
        return this
      })
  }

  /**
   * Query for the executable file's creation/modification/access time
   * and save it to the object
   * @return {Promise}
   */
  setStats () {
    return new Promise((resolve, reject) => {
      stat(this.path, (error, stats) => {
        // TODO
        if (error) {
          reject(error)
        } else {
          this.atime = stats.atime
          this.ctime = stats.ctime
          this.mtime = stats.mtime
        }
        resolve(this)
      })
    })
  }

  /**
   * When you're looking for a path, but don't necessarily care
   * if it's the symlinked one or the non-symlinked on?
   * @todo it says 'FIXME' but I think it should just be 'get rid of me'
   * @type {string}
   * @return {string} the best known path for the executable
   */
  get path () {
    try {
      return this.realpath
    } catch (e) {
      return this.paths[0]
    }
  }

  /**
   * The path of the executable, or the target of a symlinked executable
   * @return {string} The executable file's path
   */
  get realpath () {
    if (!this._realpath) {
      try {
        let path = realpathSync(this.paths[0])
        this._realpath = trueCasePathSync(path) || path
      } catch (err) {
        this._realpath = this.paths[0]
        this.addError(err)
      }
    }
    return this._realpath
  }

  /**
   * Set the realpath
   * @param {string} the new true path
   */
  set realpath (path) {
    this._realpath = path
  }

  /**
   * Fills in all of the details of the executable
   * @return {Promise}
   */
  populate () {
    return Promise.all([
      this.setVersion(),
      this.setStats()
    ])
    .then(() => this.setExtras())
    .then(() => this)
    .catch((error) => {
      this.addError(error)
      return this
    })
  }

  /**
   * Subclasses that need extra details (lists of packages, etc)
   * override this method
   * @abstract
   * @return {Promise}
   */
  setExtras () {
    return Promise.resolve(this)
  }

  /**
   * Adds a known path to this executable (e.g. a symlink)
   */
  addPath (path) {
    let corrected = trueCasePathSync(path) || path
    if (corrected && this.paths.indexOf(corrected) === -1) {
      this.paths.push(corrected)
    }
  }

  /**
   * Converts the executable's data to a JSON-friendly object
   * it's mostly so we can rename _realpath to realpath
   */
  toJSON () {
    return Object.keys(this).reduce((obj, key) => {
      if (key === '_realpath') {
        obj['realpath'] = this.realpath
      } else {
        obj[key] = this[key]
      }
      return obj
    }, {})
  }

  /**
   * Given a command name, creates an Executable from the executable
   * file that would have been run had you typed the command in (e.g. which)
   * @return {Promise<Executable>} the discovered executable
   * @todo what if one is not found?
   */
  static findOne (command) {
    return new Promise((resolve, reject) => {
      let path = which(command).toString()
      let executable = new (this)(path, command, true)
      resolve(executable)
    })
  }

  /**
   * Given a command name or list of commands, returns an ExecutableCollection
   * of all the executables with that name your computer might know about
   * Looks in the path as well as looking in common paths.
   * The Executables are all merged together, so you don't have different
   * symlinks pointing at the same file.
   * Each actual binary file yields one Executable
   * @param {string|string[]} command the command or a list of commands
   * @return {Promise<ExecutableCollection>} the discovered executables
   */
  static findAll (command) {
    if (Array.isArray(command)) {
      let promises = command.map(c => this.findAllWithoutMerge(c))
      return Promise.all(promises)
        .then(nested => ExecutableCollection.from([]).concat(...nested))
        .then(executables => executables.merge())
    } else {
      return this.findAllWithoutMerge(command)
        .then(executables => executables.merge())
    }
  }

  /**
   * Given a command name or list of commands, returns an ExecutableCollection
   * of all the executables with that name your computer might know about
   * Looks in the path as well as looking in common paths.
   * The Executables are not merged
   * Each path yields one Executable
   * @param {string} command the command
   * @return {Promise<ExecutableCollection>} the discovered executables
   */
  static findAllWithoutMerge (command) {
    return Promise.all([
      this.findByWhich(command),
      this.findByPaths(command)
    ]).then(exeArray => {
      return new ExecutableCollection(...exeArray[0], ...exeArray[1])
    })
  }

  /**
   * Uses which to find all of the paths for a given command
   * @param {string} command the command
   * @return {Promise<ExecutableCollection>} the found executables
   */
  static findByWhich (command) {
    return new Promise((resolve, reject) => {
      let executables = which('-a', command).map((path, index) => {
        // eslint-disable-next-line
        return new (this)(path, command, index === 0)
      })

      executables = new ExecutableCollection(...executables)
      resolve(executables)
    })
  }

  /**
   * Manually searches paths to find executables with a given name
   * @param {string} command the command
   * @return {Promise<ExecutableCollection>} the found executables
   */
  static findByPaths (command) {
    let promises = this.searchPaths.map((path) => {
      return new Promise((resolve, reject) => {
        glob(join(path, command + this.searchExtensionsGlob), (error, paths) => {
          if (error) {
            reject(error)
          } else {
            let executables = paths.map(path => new (this)(path))
            executables = new ExecutableCollection(...executables)
            resolve(executables)
          }
        })
      })
    })

    return Promise.all(promises)
      .then(nested => ExecutableCollection.from([]).concat(...nested))
  }

  /**
   * Paths to manually search in for executables
   */
  static get searchPaths () {
    return [
      '/usr/local/Cellar/python*/*/bin',
      join(homedir(), '*conda*'),
      join(homedir(), '*conda*', 'bin'),
      join(homedir(), '*conda*', 'Scripts'),
      '/usr/local/bin',
      '/usr/bin/',
      '/Library/Frameworks/Python.framework/Versions/*/bin/',
      '/System/Library/Frameworks/Python.framework/Versions/*/bin/',
      '/*conda*',
      '/*conda*/bin',
      '/*conda*/Scripts',
      '/*ython*',
      '/*ython*/Scripts',
      join(homedir(), '*ython*'),
      join(homedir(), '*ython*', 'Scripts')
    ].map(normalize)
  }

  /**
   * Allowable extensions for execuables
   */
  static get searchExtensionsGlob () {
    return '?(.exe|.bat)'
  }

}
