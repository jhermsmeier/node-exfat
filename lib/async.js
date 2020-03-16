var async = module.exports

/**
 * @internal Run a series of asynchronous tasks
 * @param {Array<Function>} tasks
 * @param {Function} callback
 * @returns {undefined}
 */
async.series = function( tasks, callback ) {

  var tasks = tasks.slice()

  var run = ( error ) => {
    var task = tasks.shift()
    error || task == null ?
      callback( error ) :
      task( run )
  }

  run()

}

/**
 * @internal Run a task while a condition holds true
 * @param {Function} condition -> Boolean
 * @param {Function} fn
 * @param {Function} callback
 * @returns {undefined}
 */
async.whilst = ( condition, fn, callback ) => {

  var run = ( error ) => {
    if( !error && condition() ) {
      fn( run )
    } else {
      callback( error )
    }
  }

  run()

}

async.forEach = ( list, fn, callback ) => {

  var items = list.slice()

  var run = ( error ) => {
    var item = items.shift()
    error || item == null ?
      callback( error ) :
      fn( item, run )
  }

  run()

}

async.forEachParallel = ( list, fn, callback ) => {

  var count = list.length
  var errors = []
  var done = ( error ) => {
    if( error ) {
      errors.push( error )
    }
    count -= 1
    if( count == 0 ) {
      callback( errors )
    }
  }

  for( var i = 0; i < list.length; i++ ) {
    fn( list[i], done )
  }

}

async.parallel = ( tasks, callback ) => {

  var count = tasks.length
  var errors = []
  var done = ( error ) => {
    if( error ) {
      errors.push( error )
    }
    count -= 1
    if( count == 0 ) {
      callback( errors )
    }
  }

  for( var i = 0; i < tasks.length; i++ ) {
    tasks[i]( done )
  }

}
