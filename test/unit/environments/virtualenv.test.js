import * as path from 'path'
import * as sinon from 'sinon'
import { assert, should } from 'chai'
import { homedir, platform } from 'os'
import { join } from 'path'

should()

import { VirtualEnv } from '../../../src/environments'

describe('VirtualEnv', () => {
  let sandbox = sinon.sandbox.create()

  beforeEach(() => sandbox.restore())

  describe('#commandPath', () => {
    it('gets the python path', () => {
      let venv = new VirtualEnv('default')
      let pythonPath = join(homedir(), '.virtualenvs', 'default', 'bin', 'python')
      venv.getCommandPath('python')
        .then((path) => path.should.equal(pythonPath))
    })

    it('gets the pip path', () => {
      let venv = new VirtualEnv('default')
      let pipPath = join(homedir(), '.virtualenvs', 'default', 'bin', 'pip')
      venv.getCommandPath('pip')
        .then((path) => path.should.equal(pipPath))
    })
  })

  describe('#constructor', () => {
    it('starts off without errors', () => {
      let venv = new VirtualEnv('default')
      venv.errors.length.should.equal(0)
    })

    it('populates the name', () => {
      let venv = new VirtualEnv('default')
      venv.name.should.equal('default')
    })

    it('populates the basepath', () => {
      let venv = new VirtualEnv('default')
      let basepath = join(homedir(), '.virtualenvs', 'default')
      venv.basepath.should.equal(basepath)
    })
  })

  describe('#find', () => {
    it('creates VirtualEnvs', () => {
      sandbox.stub(VirtualEnv, 'lsvirtualenv', () => {
        return Promise.resolve(['test1', 'test2', 'test3'].join('\n'))
      })

      VirtualEnv.find()
        .then((results) => {
          results.length.should.equal(3)
          results[0].name.should.equal('test1')
        })
    })

    it('copes with ==== header in Windows', () => {
      sandbox.stub(VirtualEnv, 'lsvirtualenv', () => {
        let badMultiline = "here /is /stuff" +
                            "==================" +
                            "schools"
        return Promise.resolve(badMultiline)
      })

      VirtualEnv.find()
        .then((results) => {
          results.length.should.equal(1)
          results[0].name.should.equal('schools')
        })
    })
  })

  describe('#findAndPopulate', () => {
    it('populates every VirtualEnv it finds', () => {
      let envs = ['test1', 'test2', 'test3'].map(name => new VirtualEnv(name))

      sandbox.stub(VirtualEnv, 'find', () => {
        return Promise.resolve(envs)
      })

      let stubs = envs.map((env) => {
        return sandbox.stub(env, 'populate', () => {
          return Promise.resolve(env)
        })
      })

      VirtualEnv.findAndPopulate()
        .then((results) => {
          results.length.should.equal(3)
          results[0].name.should.equal('test1')
          
          for(let populate of stubs) {
            sinon.assert.calledOnce(populate);
          }
        })
    })
  })

})