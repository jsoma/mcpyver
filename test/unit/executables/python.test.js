import * as path from 'path'
import * as sinon from 'sinon'
import { assert, should } from 'chai'

should()

import PythonExecutable from '../../../src/executables/python'

describe('Python', () => {
  describe('#cleanVersion', () => {
    it('gets the text after Python', () => {
      let python = new PythonExecutable()

      sinon.stub(python, 'requestVersion', () => {
        return Promise.resolve('Python 2.7.13')
      })

      return python.setVersion()
        .then(() => {
          python.version.should.equal('2.7.13')
        })
    })

    it('ignores the Anaconda versioning', () => {
      let python = new PythonExecutable()

      sinon.stub(python, 'requestVersion', () => {
        return Promise.resolve('Python 3.6.0 :: Anaconda 4.3.0 (x86_64)')
      })

      return python.setVersion()
        .then(() => {
          python.version.should.equal('3.6.0')
        })

    })
  })
  
  describe('#detectInstaller', () => {
    let python = null

    beforeEach(() => {
      python = new PythonExecutable('/a/path', 'python')
      python.realpath = '/somewhere/random/'
    })

    it('does not know by default', () => {
      python.detectInstaller()
      assert.isUndefined(python.installer, 'does not have an installer')
    })

    it('detects Anaconda 3 (All platforms)', () => {
      python.rawVersion = 'Python 3.6.0 :: Anaconda 4.3.0 (x86_64)'
      python.detectInstaller()
      python.installer.should.equal('Anaconda')
    })

    it('detects Anaconda 3 (Alternate, all platforms)', () => {
      python.rawVersion = 'Python 3.6.0 :: Continuum Analytics, Inc.'
      python.detectInstaller()
      python.installer.should.equal('Anaconda')
    })

    it('detects Miniconda 3 (All platforms)', () => {
      python.realpath = '/Users/jonathansoma/miniconda3/bin/python'
      python.rawVersion = 'Python 3.6.0 :: Continuum Analytics, Inc.'
      python.detectInstaller()
      python.installer.should.equal('Miniconda')
    })

    it('detects Enthought Canopy (OS X)', () => {
      python.realpath = '/Users/username/Library/Enthought/Canopy_64bit/User/bin/python'
      python.detectInstaller()
      python.installer.should.equal('Canopy')
    })

    it('detects Homebrew (OS X)', () => {
      python.realpath = '/usr/local/Cellar/python/2.7.9/bin/python'
      python.detectInstaller()
      python.installer.should.equal('Homebrew')
    })

    // it('detects default installation (OS X)', () => {
    //   python.realpath = '/System/Library/Frameworks/Python.framework/Versions/2.7/bin/python'
    //   python.detectInstaller()
    //   python.installer.should.equal('Default-OSX')
    // })

    // it('detects Python.org installer (OS X)', () => {
    //   python.realpath = '/Library/Frameworks/Python.framework/Versions/2.7/bin/python'
    //   python.detectInstaller()
    //   python.installer.should.equal('Python.org')
    // })

    it('detects Python.org installer (Windows, Python 2)', () => {
      python.realpath = 'C:\\Python27\\Python.exe'
      python.detectInstaller()
      python.installer.should.equal('Python.org')
    })

    it('detects Python.org installer (Windows, Python 3)', () => {
      python.realpath = 'C:\\Users\\username\\AppData\\Local\\Programs\\Python\\Python35'
      python.detectInstaller()
      python.installer.should.equal('Python.org')
    })

    it('detects ActivePython (OS X)', () => {
      sinon.stub(python, 'isActivePython', () => {
        return true
      })

      python.realpath = '/usr/blah/blah/blah'
      python.detectInstaller()
      python.installer.should.equal('ActivePython')
    })

  })
})