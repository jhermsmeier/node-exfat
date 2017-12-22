/**
 * FileSystem
 * @constructor
 * @param {ExFAT.Volume} volume
 * @param {Object} [options]
 * @returns {FileSystem}
 */
function FileSystem( volume, options ) {
  
  if( !(this instanceof FileSystem) ) {
    return new FileSystem( volume, options )
  }
  
}

/**
 * FileSystem prototype
 * @ignore
 */
FileSystem.prototype = {
  
  constructor: FileSystem,
  
}

// Exports
module.exports = FileSystem
