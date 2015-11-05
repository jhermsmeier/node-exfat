var Entry = require( './index' )
var Int64 = require( '../int64' )

/**
 * FileInfo
 * @return {FileInfo}
 */
function FileInfo() {
  
  if( !(this instanceof FileInfo) )
    return new FileInfo()
  
  this.type = Entry.FILE_INFO
  this.flags = 0x00
  this.unknown1 = 0x00
  this.nameLength = 0x00
  this.nameHash = 0x0000
  this.unknown2 = 0x0000
  this.validSize = 0x0000000000000000
  this.unknown3 = new Buffer( 4 )
  this.unknown3.fill( 0 )
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
    this.unknown1 = buffer[ 2 ]
    this.nameLength = buffer[ 3 ]
    this.nameHash = buffer.readUInt16LE( 0x04 )
    this.unknown2 = buffer.readUInt16LE( 0x06 )
    this.validSize = Int64.readUInt64LE( buffer, 0x08 )
    buffer.copy( this.unknown3, 0x10 )
    this.startCluster = buffer.readUInt32LE( 0x14 )
    this.size = Int64.readUInt64LE( buffer, 0x18 )
    
  },
  
  toBuffer: function() {
    
  }
  
}

// Exports
module.exports = FileInfo
