import * as path from 'path'
import * as sinon from 'sinon'
import { assert, should } from 'chai'

should()

import Executable from '../../../src/executables/executable'
import PipExecutable from '../../../src/executables/pip'
import ExecutableCollection from '../../../src/executables/executable_collection'

describe('ExecutableCollection', () => {
  let sandbox = sinon.sandbox.create()

  beforeEach(() => sandbox.restore())

  describe('#merge', () => {
    it('clusters executables by .realpath', () => {
      let ex1 = new Executable('/a/path/1')
      ex1.realpath = '/realpath-combine'
      let ex2 = new Executable('/a/path/2')
      ex2.realpath = '/realpath-unique'
      let ex3 = new Executable('/a/path/3')
      ex3.realpath = '/realpath-combine'

      let inputs = new ExecutableCollection(...[ex1, ex2, ex3])
      inputs.merge()
        .then((merged) => {
          merged.length.should.equal(inputs.length - 1)

          merged[0].realpath.should.equal('/realpath-combine')
          merged[1].realpath.should.equal('/realpath-unique')
        })

    })

    it('clusters pips by packageDir', () => {
      let ex1 = new PipExecutable('/a/path/1')
      ex1.realpath = '/realpath-combine'
      ex1.packageDir = '/path/1'
      let ex2 = new PipExecutable('/a/path/2')
      ex2.realpath = '/realpath-unique'
      ex2.packageDir = '/path/1'
      let ex3 = new PipExecutable('/a/path/3')
      ex3.realpath = '/realpath-combine'
      ex3.packageDir = '/path/1'

      let inputs = new ExecutableCollection(...[ex1, ex2, ex3])
      inputs.merge()
        .then((merged) => {
          merged.length.should.equal(1)
        })

    })
  })

  describe('#populate', () => {
    it('calls populate on each executable', () => {

      let spies = []
      let inputs = [1, 2, 3].map((i) => {
        let executable = new Executable(`/a/path/${i}`)
        let spy = sandbox.stub(executable, 'populate', () => {
          return Promise.resolve(i)
        })
        spies.push(spy)
        return executable
      })

      inputs = new ExecutableCollection(...inputs)

      inputs.populate()
        .then(values => {
          for (let spy of spies) {
            sinon.assert.calledOnce(spy)
          }
        })
    })
  })
})
