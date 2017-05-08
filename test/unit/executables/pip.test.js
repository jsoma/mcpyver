import * as path from 'path'
import * as sinon from 'sinon'
import { assert, should } from 'chai'

should()

import PipExecutable from '../../../src/executables/pip'

describe('Pip', () => {
  let sandbox

  beforeEach(() => sandbox = sinon.sandbox.create())
  beforeEach(() => sandbox.restore())

  describe('#cleanVersion', () => {
    it('saves the raw version', () => {
      let pip = new PipExecutable()

      sandbox.stub(pip, 'requestVersion', () => {
        return Promise.resolve('pip 8.1.2 from /usr/local/lib/python3.5/site-packages (python 3.5)')
      })

      return pip.setVersion()
        .then(() => {
          pip.rawVersion.should.equal('pip 8.1.2 from /usr/local/lib/python3.5/site-packages (python 3.5)')
        })
    })

    it('gets the version number after pip', () => {
      let pip = new PipExecutable()

      sandbox.stub(pip, 'requestVersion', () => {
        return Promise.resolve('pip 8.1.2 from /usr/local/lib/python3.5/site-packages (python 3.5)')
      })

      return pip.setVersion()
        .then(() => {
          pip.version.should.equal('8.1.2')
        })
    })
  })

  describe('#assureMergeable', () => {
    it('sets the package directory', () => {
      let pip = new PipExecutable()

      sandbox.stub(pip, 'requestVersion', () => {
        return Promise.resolve('pip 8.1.2 from /usr/local/lib/python3.5/site-packages (python 3.5)')
      })

      return pip.assureMergeable()
        .then(() => {
          pip.packageDir.should.equal('/usr/local/lib/python3.5/site-packages')
        })
    })
  })

  describe('#pythonVersion', () => {
    it('extracts the Python version from the raw string', () => {
      let pip = new PipExecutable()

      sandbox.stub(pip, 'requestVersion', () => {
        return Promise.resolve('pip 8.1.2 from /usr/local/lib/python3.5/site-packages (python 3.5)')
      })

      return pip.setVersion()
        .then(() => {
          pip.setPythonVersion()
          pip.pythonVersion.should.equal('3.5')
        })
    })
  })

  describe('#setPackageDirectory', () => {
    it('gets the package directory', () => {
      let pip = new PipExecutable()

      sandbox.stub(pip, 'requestVersion', () => {
        return Promise.resolve('pip 8.1.2 from /usr/local/lib/python3.5/site-packages (python 3.5)')
      })

      return pip.setVersion()
        .then(() => {
          pip.setPackageDirectory()
          pip.packageDir.should.equal('/usr/local/lib/python3.5/site-packages')
        })
    })
  })

  describe('#parsePackageLine', () => {
    it('will not parse a bad line', () => {
      let result = PipExecutable.parsePackageLine('here is a line')
      assert.isUndefined(result, 'does not parse a bad line')
    })

    it('will parse a good column line', () => {
      let result = PipExecutable.parsePackageLine('rope-py3k                          0.9.4.post1')

      result.raw.should.equal('rope-py3k 0.9.4.post1')
      result.name.should.equal('rope-py3k')
      result.version.should.equal('0.9.4.post1')
    })

    it('will parse a good legacy line', () => {
      let result = PipExecutable.parsePackageLine('xlwt (1.2.0)')

      result.raw.should.equal('xlwt (1.2.0)')
      result.name.should.equal('xlwt')
      result.version.should.equal('1.2.0')
    })
  })

  describe('#setPackages', () => {
    it('processes packages in column format', () => {
      let pip = new PipExecutable()

      let packageList = `
        Package                            Version    
        ---------------------------------- -----------
        alabaster                          0.7.9      
        anaconda-client                    1.6.0      
        anaconda-navigator                 1.4.3`

      sandbox.stub(pip, 'getPackageListing', () => {
        return Promise.resolve(packageList)
      })

      return pip.setPackages()
        .then(() => {
          pip.packages.length.should.equal(3)
          pip.packages[0].name.should.equal('alabaster')
          pip.packages[0].version.should.equal('0.7.9')
        })
    })

    it('processes packages in legacy format', () => {
      let pip = new PipExecutable()

      let packageList = `
        DEPRECATION: The default format will switch to columns in the future. You can use --format=(legacy|columns) (or define a format=(legacy|columns) in your pip.conf under the [list] section) to disable this warning.
        alabaster (0.7.9)
        anaconda-client (1.6.0)
        anaconda-navigator (1.4.3)
        appnope (0.1.0)
        `

      sandbox.stub(pip, 'getPackageListing', () => {
        return Promise.resolve(packageList)
      })

      return pip.setPackages()
        .then(() => {
          pip.packages.length.should.equal(4)
          pip.packages[0].name.should.equal('alabaster')
          pip.packages[0].version.should.equal('0.7.9')
        })
    })
  })

})