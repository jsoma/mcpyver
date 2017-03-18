# mcpyver

[![Travis](https://travis-ci.org/jsoma/mcpyver.svg?branch=master)](https://travis-ci.org/jsoma/mcpyver) [![Coverage Status](https://coveralls.io/repos/github/jsoma/mcpyver/badge.svg?branch=master)](https://coveralls.io/github/jsoma/mcpyver?branch=master)

A node library for detecting all of the Python installations on your machine (and pips, virtual environments, and more!). It will rescue you when your Python is throwing errors and spitting fire.

**Note:** I didn't call it `macpyver` because then you'd think it only works on macs. But that isn't true! It totally works on Windows, too!

## Installation

    npm install mcpyver

## Usage

### Finding Python versions

Are you super curious about your Python installations? mcpyver can help.

```node
let mcpyver = require('mcpyver')

mcpyver.getPythonList().then((pythons) => {
  console.log(`You have ${pythons.length} Pythons installed`)
  for(let python of pythons) {
    console.log(`${python.version} at ${python.realpath}`)
  }
})
```

    You have 7 Pythons installed
    3.6.0 at /Users/jonathansoma/anaconda/bin/python3.6
    2.7.13 at /usr/local/Cellar/python/2.7.13/Frameworks/Python.framework/Versions/2.7/bin/python2.7
    2.7.10 at /usr/bin/python
    3.5.2 at /usr/local/Cellar/python3/3.5.2_2/Frameworks/Python.framework/Versions/3.5/bin/python3.5
    2.6.9 at /System/Library/Frameworks/Python.framework/Versions/2.6/bin/python2.6
    2.7.10 at /System/Library/Frameworks/Python.framework/Versions/2.7/bin/python2.7

mcpyver also tries to guess how you installed the Pythons, follows symlinks, and other fun stuff.

### Finding `pip` installations

But what about `pip` and its delightful packages?

```node
let mcpyver = require('mcpyver')

mcpyver.getPipList().then((pips) => {
  console.log(`You have ${pips.length} pips installed`)
  for(let pip of pips) {
    console.log(`pip ${pip.version} has ${pip.packages.length} packages in ${pip.packageDir}`)
  }
})
```

    You have 3 pips installed
    pip 9.0.1 has 145 packages in /Users/username/anaconda/lib/python3.6/site-packages
    pip 9.0.1 has 48 packages in /usr/local/lib/python2.7/site-packages
    pip 8.1.2 has 76 packages in /usr/local/lib/python3.5/site-packages

You could loop through the packages, too, if you really wanted to.

### Finding other things

* `getPythonList()`
* `getPipList()`
* `getJupyterList()`
* `getJupyter()`
* `getVirtualEnv()`
* `getConda()`

Lots of other things in there, maybe one day there will also be appropriate documentation!

## Testing

My tests are so bad help

## Contributing

Speaking of helping: please read [CONTRIBUTING.md](CONTRIBUTING.md), good friends.

## License

[MIT](LICENSE.md)

## Acknowledgements

Everyone who has ever tried to install Python on their machine without a PhD and extensive postdoc work in Python Installation Methodologies. Some of these people were my students.