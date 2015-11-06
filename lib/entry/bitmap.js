var Entry = require( './index' )
var Int64 = require( '../int64' )

/**
 * Bitmap
 * @return {Bitmap}
 */
function Bitmap() {
  
  if( !(this instanceof Bitmap) )
    return new Bitmap()
  
  this.type = Entry.BITMAP
  this.unknown1 = new Buffer( 19 )
  this.unknown1.fill( 0 )
  this.startCluster = 0x00000000
  this.size = 0x0000000000000000
  
}

/**
 * Bitmap prototype
 * @type {Object}
 */
Bitmap.prototype = {
  
  constructor: Bitmap,
  
  parse: function( buffer ) {
    
    this.type = buffer[ 0 ]
    buffer.copy( this.unknown1, 0x01 )
    this.startCluster = buffer.readUInt32LE( 0x14 )
    this.size = Int64.readUInt64LE( buffer, 0x18 )
    
    return this
    
  },
  
  toBuffer: function() {
    
  }
  
}

// Exports
module.exports = Bitmap
