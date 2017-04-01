import { exec as cpExec, execSync as cpExecSync, execFile as cpExecFile } from 'child_process'

let CACHE = {}

export function clear () {
  CACHE = {}
}

export function execSync (command) {
  return cpExecSync(command)
}

export function execFile (command, params, callback) {
  let signature = [ command, ...params ].join(' ')

  /* Keep things in the cache for 5 seconds */
  if (signature in CACHE && Date.now() - CACHE[signature].timestamp < 5000) {
    callback(
      CACHE[signature].error,
      CACHE[signature].stdout,
      CACHE[signature].stderr
    )
  } else {
    cpExecFile(command, params, (error, stdout, stderr) => {
      CACHE[signature] = {
        error: error,
        stdout: stdout,
        stderr: stderr,
        timestamp: Date.now()
      }
      callback(error, stdout, stderr)
    })
  }
}

export function exec (command, callback, options = {}) {
  /* Keep things in the cache for 5 seconds */
  if (command in CACHE && Date.now() - CACHE[command].timestamp < 5000) {
    callback(
      CACHE[command].error,
      CACHE[command].stdout,
      CACHE[command].stderr
    )
  } else {
    cpExec(command, (error, stdout, stderr) => {
      CACHE[command] = {
        error: error,
        stdout: stdout,
        stderr: stderr,
        timestamp: Date.now()
      }
      callback(error, stdout, stderr)
    })
  }
}
