import * as path from 'path'
import * as sinon from 'sinon'
import { assert, should } from 'chai'

should()

import PythonExecutable from '../../../src/executables/python'

describe('Python', () => {
  let sandbox = sinon.sandbox.create()

  beforeEach(() => sandbox.restore())

  describe('#cleanVersion', () => {
    it('gets the text after Python', () => {
      let python = new PythonExecutable()

      sandbox.stub(python, 'requestVersion', () => {
        return Promise.resolve('Python 2.7.13')
      })

      return python.setVersion()
        .then(() => {
          python.version.should.equal('2.7.13')
        })
    })

    it('ignores the Anaconda versioning', () => {
      let python = new PythonExecutable()

      sandbox.stub(python, 'requestVersion', () => {
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
      sandbox.stub(python, 'isActivePython', () => {
        return Promise.resolve(false)
      })
      sandbox.stub(python, 'isXyPython', () => {
        return Promise.resolve(false)
      })
      sandbox.stub(python, 'isWinPython', () => {
        return Promise.resolve(false)
      })
    })

    it('does not know by default', () => {
      python.detectInstaller()
        .then(() => {
          assert.isUndefined(python.installer, 'does not have an installer')
        })
    })

    it('detects Anaconda 3 (All platforms)', () => {
      python.rawVersion = 'Python 3.6.0 :: Anaconda 4.3.0 (x86_64)'
      python.detectInstaller()
        .then(() => {
          python.installer.should.equal('anaconda')
        })
    })

    it('detects Anaconda 3 (Alternate, all platforms)', () => {
      python.rawVersion = 'Python 3.6.0 :: Continuum Analytics, Inc.'
      python.detectInstaller()
        .then(() => {
          python.installer.should.equal('anaconda')
        })
    })

    it('detects Miniconda 3 (All platforms)', () => {
      python.realpath = '/Users/jonathansoma/miniconda3/bin/python'
      python.rawVersion = 'Python 3.6.0 :: Continuum Analytics, Inc.'
      python.detectInstaller()
        .then(() => {
          python.installer.should.equal('miniconda')
        })
    })

    it('detects Enthought Canopy (OS X)', () => {
      python.realpath = '/Users/username/Library/Enthought/Canopy_64bit/User/bin/python'
      python.detectInstaller()
        .then(() => {
          python.installer.should.equal('canopy')
        })
    })

    it('detects Homebrew (OS X)', () => {
      python.realpath = '/usr/local/Cellar/python/2.7.9/bin/python'
      python.detectInstaller()
        .then(() => {
          python.installer.should.equal('homebrew')
        })
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

    it('detects Python.org installer (Windows, Python 3)', () => {
      python.realpath = 'C:\\Users\\username\\AppData\\Local\\Programs\\Python\\Python35'
      python.detectInstaller()
        .then(() => {
          python.installer.should.equal('pythonorg')
        })
    })

    it('detects ActivePython (OS X)', () => {
      python.isActivePython.restore()
      sandbox.stub(python, 'isActivePython', () => {
        return Promise.resolve(true)
      })

      python.realpath = '/usr/blah/blah/blah'
      python.detectInstaller()
        .then(() => {
          python.installer.should.equal('activepython')
        })
    })

    it('detects Python(x,y) (Win)', () => {
      python.isXyPython.restore()
      sandbox.stub(python, 'isXyPython', () => {
        return Promise.resolve(true)
      })

      python.realpath = 'C:\\PYTHON27\\PYTHON.EXE'
      python.detectInstaller()
        .then(() => {
          python.installer.should.equal('xy')
        })
    })

    it('detects WinPython (Win)', () => {
      python.isWinPython.restore()
      sandbox.stub(python, 'isWinPython', () => {
        return Promise.resolve(true)
      })

      python.realpath = 'C:\\PYTHON27\\PYTHON.EXE'
      python.detectInstaller()
        .then(() => {
          python.installer.should.equal('winpython')
        })
    })

    it('detects lack of an installer', () => {
      python.realpath = '/usr/blah/blah/blah'
      python.detectInstaller()
        .then(() => {
          assert.isUndefined(python.installer, 'does not have an installer')
        })
    })

  })
})