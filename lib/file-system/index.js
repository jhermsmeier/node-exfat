/**
 * ExFAT File System
 * @constructor
 * @param {Object} options
 * @return {FileSystem}
 */
function FileSystem( options ) {
  
  if( !(this instanceof FileSystem) )
    return new FileSystem( options )
  
}

/**
 * FileSystem prototype
 * @type {Object}
 */
FileSystem.prototype = {
  
  constructor: FileSystem,
  
}

// Exports
module.exports = FileSystem
