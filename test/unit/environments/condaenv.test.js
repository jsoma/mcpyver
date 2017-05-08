import * as path from 'path'
import * as sinon from 'sinon'
import { assert, should } from 'chai'
import { homedir, platform } from 'os'
import { join } from 'path'

should()

import { CondaEnv } from '../../../src/environments'

describe('CondaEnv', () => {
  let sandbox

  beforeEach(() => sandbox = sinon.sandbox.create())
  beforeEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('starts off without errors', () => {
      let env = new CondaEnv('/path/here')
      env.errors.length.should.equal(0)
    })

    it('populates name and basepath from path', () => {
      let env = new CondaEnv('/path/here')
      env.name.should.equal('here')
      env.basepath.should.equal('/path/here')
    })
  })

  describe('#find', () => {
    it('creates CondaEnvs', () => {
      sandbox.stub(CondaEnv, 'lsenvs', () => {
        return Promise.resolve(['/path/1', '/path/2', '/path/3'])
      })

      CondaEnv.find()
        .then((results) => {
          results.length.should.equal(3)
          results[0].basepath.should.equal('/path/1')
        })
    })
  })

  // doesn't work like this anymore!
  // needs to populate pip and python...
  //
  // describe('#setEnvData', () => {
  //   it('populates pip', () => {
  //     let env = new CondaEnv('/path/here')

  //     sandbox.stub(env, 'getPackages', () => {
  //       return Promise.resolve([1, 2, 3])
  //     })

  //     env.setEnvData()
  //       .then((results) => {
  //         results.pip.packages.length.should.equal(3)
  //         results.pip.packages[0].should.equal(1)
  //       })
  //   })
  // })
})