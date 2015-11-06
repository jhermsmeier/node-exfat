var Entry = require( './index' )
var Int64 = require( '../int64' )

/**
 * UpCase
 * @return {UpCase}
 */
function UpCase() {
  
  if( !(this instanceof UpCase) )
    return new UpCase()
  
  this.type = Entry.UPCASE
  this.unknown1 = new Buffer( 3 )
  this.unknown1.fill( 0 )
  this.checksum = 0x00000000
  this.unknown2 = new Buffer( 12 )
  this.unknown2.fill( 0 )
  this.startCluster = 0x00000000
  this.size = 0x0000000000000000
  
}

/**
 * UpCase prototype
 * @type {Object}
 */
UpCase.prototype = {
  
  constructor: UpCase,
  
  parse: function( buffer ) {
    
    this.type = buffer[ 0 ]
    buffer.copy( this.unknown1, 0x01 )
    this.checksum = buffer.readUInt32LE( 0x04 )
    buffer.copy( this.unknown2, 0x08 )
    this.startCluster = buffer.readUInt32LE( 0x14 )
    this.size = Int64.readUInt64LE( buffer, 0x18 )
    
    return this
    
  },
  
  toBuffer: function() {
    
  }
  
}

// Exports
module.exports = UpCase
