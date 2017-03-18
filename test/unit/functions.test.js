import * as path from 'path'
import * as sinon from 'sinon'
import { assert, should } from 'chai'

should()

import * as funcs from '../../src/functions'

describe('functions', () => {

  let properties = [
    'realpath', 'version', 'rawVersion', 'defaultCommands', 'paths'
  ]

  function isFullExport(obj) {
    if(obj.errors && obj.errors.length > 0) {
      return
    }
    for (let prop of properties) {
      assert(obj.hasOwnProperty(prop), `has ${prop}`)
    }
  }

  function isArrayOfExports(list) {
    assert(Array.isArray(list), 'result is an array')
    for (let obj of list) {
      isFullExport(obj)
    }
  }

  describe('#getVirtualEnv', () => {
    it('calls the things its supposed to call', () => {
    })

    it('returns what i want in case of an error', () => {

    })

    it('formats the response in the right way', () => {

    })
  })

  describe('#getPipList', () => {
    it('calls the things its supposed to call', () => {
      // funcs.getPipList().then((pips) => {
      //   console.log(`You have ${pips.length} pips installed`)
      //   for(let pip of pips) {
      //     console.log(`pip ${pip.version} has ${pip.packages.length} packages in ${pip.packageDir}`)
      //   }
      // })
    }).timeout(10000)

    it('returns what i want in case of an error', () => {

    })

    it('formats the response in the right way', () => {

    })
  })

  describe('#getPythonList', () => {
    it('calls the things its supposed to call', () => {
      // funcs.getPythonList().then((pythons) => {
      //   console.log(`You have ${pythons.length} Pythons installed`)
      //   for(let python of pythons) {
      //     console.log(`${python.version} at ${python.realpath}`)
      //   }
      // })
    }).timeout(10000)

    it('returns what i want in case of an error', () => {

    })

    it('formats the response in the right way', () => {

    })
  })

  describe('#getVirtualEnv', () => {
    it('calls the things its supposed to call', () => {
      // return funcs.getVirtualEnv()
      //   .then(result => {
      //     let processed = JSON.parse(JSON.stringify(result))
      //     // console.log(JSON.stringify(processed, null, 4))
      //     // console.log(JSON.stringify(result))
      //   })
    }).timeout(10000)

    it('returns what i want in case of an error', () => {

    })

    it('formats the response in the right way', () => {

    })
  })

  describe('#getCondaEnv', () => {
    it('calls the things its supposed to call', () => {
      // return funcs.getConda()
      //   .then(result => {
      //     let processed = JSON.parse(JSON.stringify(result))
      //     // console.log(JSON.stringify(processed, null, 4))
      //     // console.log(JSON.stringify(result))
      //   })
    }).timeout(10000)

    it('returns what i want in case of an error', () => {

    })

    it('formats the response in the right way', () => {

    })
  })

  describe('#getJupyterList', () => {
    it('calls the things its supposed to call', () => {
      // return funcs.getJupyterList()
      //   .then(result => {
      //     let processed = JSON.parse(JSON.stringify(result))
      //     console.log(JSON.stringify(processed, null, 4))
      //     // console.log(JSON.stringify(result))
      //   })
    }).timeout(10000)

    it('returns what i want in case of an error', () => {

    })

    it('formats the response in the right way', () => {

    })
  })

})