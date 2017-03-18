import { CondaExecutable, PipExecutable, PythonExecutable, JupyterExecutable, VirtualEnvExecutable } from './executables'

function getVirtualEnv () {
  return VirtualEnvExecutable.findOne('virtualenv')
    .then(v => v.populate())
}

function getConda () {
  return CondaExecutable.findOne('conda')
    .then(c => c.populate())
}

function getJupyter () {
  return JupyterExecutable.findOne('jupyer')
    .then(j => j.populate())
}

function getJupyterList () {
  return JupyterExecutable.findAll('jupyter')
    .then(j => j.populate())
}

function pythonCommands () {
  const python2Commands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => 'python2.' + i)
  const python3Commands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => 'python3.' + i)
  return ['python', 'python2', 'python3', ...python2Commands, ...python3Commands]
}

function getPythonList () {
  return PythonExecutable.findAll(pythonCommands())
    .then(e => e.populate())
}

function getPipList () {
  return PipExecutable.findAll(['pip', 'pip3'])
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
