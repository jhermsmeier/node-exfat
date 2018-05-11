var Entry = require( './index' )
var uint64 = require( '../uint64' )

/**
 * FileInfo
 * @return {FileInfo}
 */
function FileInfo() {
  
  if( !(this instanceof FileInfo) )
    return new FileInfo()
  
  this.type = Entry.FILE_INFO
  this.flags = 0x00
  this.reserved1 = 0x00
  this.nameLength = 0x00
  this.nameHash = 0x0000
  this.reserved2 = 0x0000
  this.validSize = 0x0000000000000000
  this.reserved3 = Buffer.alloc( 4 )
  this.reserved3.fill( 0 )
  this.startCluster = 0x00000000
  this.size = 0x0000000000000000
  
}

/**
 * FileInfo prototype
 * @type {Object}
 */
FileInfo.prototype = {
  
  constructor: FileInfo,
  
  parse: function( buffer ) {
    
    this.type = buffer[ 0 ]
    this.flags = buffer[ 1 ]
    this.reserved1 = buffer[ 2 ]
    this.nameLength = buffer[ 3 ]
    this.nameHash = buffer.readUInt16LE( 0x04 )
    this.reserved2 = buffer.readUInt16LE( 0x06 )
    this.validSize = uint64.readLE( buffer, 0x08 )
    buffer.copy( this.reserved3, 0x10 )
    this.startCluster = buffer.readUInt32LE( 0x14 )
    this.size = uint64.readLE( buffer, 0x18 )
    
    return this
    
  },
  
  toBuffer: function() {
    throw new Error( 'Not implemented' )
  }
  
}

// Exports
module.exports = FileInfo
