export default class ExecutableCollection extends Array {

  populate () {
    let promises = this.map(p => p.populate())
    return Promise.all(promises)
      .then(executables => new ExecutableCollection(...this))
  }

  executeMerge () {
    let tmp = {}

    /* Go through every executable... */
    for (let e of this) {
      let mergeField = e.mergeField
      if (!mergeField) {
        mergeField = 'error'
      }

      /* Haven't seen the realpath before? Add as new! */
      if (!tmp[mergeField]) {
        tmp[mergeField] = e
        continue
      }

      /* Seen it already? Add the path as another 'known' path */
      tmp[mergeField].addPath(e.path)
      if (e.isDefault && e.defaultCommands.length > 0) {
        tmp[mergeField].addCommand(e.defaultCommands[0])
      }
    }

    /* Grab each unique key. Object.values doesn't work */
    let uniques = Object.keys(tmp).map(function (key) {
      return tmp[key]
    })

    return new ExecutableCollection(...uniques)
  }

  merge () {
    return new Promise((resolve, reject) => {
      let promises = this.map(e => e.assureMergeable())
      Promise.all(promises)
        .then(() => {
          let merged = this.executeMerge()
          resolve(merged)
        })
        .catch()
    })
  }

}
