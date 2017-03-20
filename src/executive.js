import { exec as cpExec, execSync as cpExecSync } from 'child_process'

let CACHE = {}

export function clear () {
  CACHE = {}
}

export function execSync (command) {
  return cpExecSync(command)
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
