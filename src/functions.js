import { CondaExecutable, PipExecutable, PythonExecutable, JupyterExecutable, VirtualEnvExecutable } from './executables'

function getVirtualEnv () {
  return VirtualEnvExecutable.findOne('virtualenv')
    .then(v => v.populate())
    .catch(err => null) // eslint-disable-line
}

function getConda () {
  return CondaExecutable.findOne('conda')
    .then(c => c.populate())
    .catch(err => null) // eslint-disable-line
}

function getJupyter () {
  return JupyterExecutable.findOne('jupyer')
    .then(j => j.populate())
    .catch(err => null) // eslint-disable-line
}

function getJupyterList () {
  return JupyterExecutable.findAll('jupyter')
    .then(j => j.populate())
}

function getPythonList () {
  return PythonExecutable.findAll(makeCommands('python'))
    .then(e => e.populate())
}

function makeCommands (base) {
  const python2Commands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => base + '2.' + i)
  const python3Commands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => base + '3.' + i)
  return [base, base + '2', base + '3', ...python2Commands, ...python3Commands]
}

function getPipList () {
  return PipExecutable.findAll(makeCommands('pip'))
    .then(e => e.populate())
}

export {
  getConda,
  getVirtualEnv,
  getJupyter,
  getJupyterList,
  getPipList,
  getPythonList
}
