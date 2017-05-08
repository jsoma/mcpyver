import * as path from 'path'
import * as sinon from 'sinon'
import { assert, should } from 'chai'

should()

import Executable from '../../../src/executables/executable'

describe('Executable', () => {
  let sandbox

  beforeEach(() => sandbox = sinon.sandbox.create())
  beforeEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('orders params correctly', () => {
      let executable = new Executable('path', 'name', false)
      assert(executable.paths, [ 'path' ])
      assert(executable.errors, [])
    })

    it('doesnt set commands if not default', () => {
      let executable = new Executable('path', 'name', false)
      assert(executable.defaultCommands, [])
    })

    it('can set commands if default', () => {
      let executable = new Executable('path', 'name', true)
      assert(executable.defaultCommands, [ 'name' ])
    })
  })

  describe('#addPath', () => {
    it('starts with no assumed paths', () => {
      let executable = new Executable()
      executable.paths.length.should.equal(0)
    })

    it('can start with one path', () => {
      let executable = new Executable('/path/to/common')
      executable.paths.length.should.equal(1)
    })

    it('can add a new path', () => {
      let executable = new Executable('/path/to/common')
      executable.paths.length.should.equal(1)
      executable.addPath('/another/path')
      executable.paths.length.should.equal(2)
    })

    it('will not duplicate paths', () => {
      let executable = new Executable('/path/to/common')
      executable.paths.length.should.equal(1)
      executable.addPath('/path/to/common')
      executable.paths.length.should.equal(1)
    })
  })

  describe('#addCommand', () => {
    it('starts with no assumed commands', () => {
      let executable = new Executable('/a/path')
      executable.defaultCommands.length.should.equal(0)
    })

    it('can start with one command', () => {
      let executable = new Executable('/a/path', 'cmdname', true)
      executable.defaultCommands.length.should.equal(1)
    })

    it('can add a new command', () => {
      let executable = new Executable('/a/path', 'cmdname', true)
      executable.defaultCommands.length.should.equal(1)
      executable.addCommand('cmdname2')
      executable.defaultCommands.length.should.equal(2)
    })

    it('will not duplicate commands', () => {
      let executable = new Executable('/a/path', 'cmdname', true)
      executable.defaultCommands.length.should.equal(1)
      executable.addCommand('cmdname')
      executable.defaultCommands.length.should.equal(1)
    })
  })

  describe('#setVersion', () => {
    it('sets the version', () => {      
      let executable = new Executable('/a/path')

      sandbox.stub(executable, 'requestVersion', () => {
        return Promise.resolve('   1.2.3-rc4 ')
      })

      return executable.setVersion()
        .then(() => {
          executable.rawVersion.should.equal('1.2.3-rc4')
        })
    })

    it('cleans the version', () => {      
      let executable = new Executable('/a/path')

      sandbox.stub(executable, 'requestVersion', () => {
        return Promise.resolve('   1.2.3-rc4 ')
      })

      return executable.setVersion()
        .then(() => {
          executable.version.should.equal("1.2.3-rc4")
        })
    })
  })

  describe('#path', () => {
    it('returns a path', () => {      
      let executable = new Executable('/a/path')
      executable.path.should.equal('/a/path')
    })

    it('returns the first path', () => {      
      let executable = new Executable('/a/path')
      executable.addPath('/another/path')
      executable.path.should.equal('/a/path')
    })
  })
  
  // TODO
  describe('#findOne', () => {
    Executable.findOne('python')
      .then(e => {
        return
      })
  })

  // TODO
  describe('#findAllWithoutMerge', () => {
    Executable.findAllWithoutMerge('python')
      .then(e => {
        return
      })
  })

  // TODO
  describe('#findAll', () => {
    Executable.findAll('python')
      .then(e => {
        return
      })
  })

})