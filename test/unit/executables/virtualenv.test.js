import * as path from 'path'
import * as sinon from 'sinon'
import { assert, should } from 'chai'

should()

import VirtualEnvExecutable from '../../../src/executables/virtualenv'

describe('VirtualEnvExecutable', () => {
  describe('#cleanVersion', () => {
    it('saves the right version', () => {
      let venv = new VirtualEnvExecutable()

      sinon.stub(venv, 'requestVersion', () => {
        return Promise.resolve('15.0.3')
      })

      return venv.setVersion()
        .then(() => {
          venv.version.should.equal('15.0.3')
          venv.rawVersion.should.equal('15.0.3')
        })
    })
  })  
})
