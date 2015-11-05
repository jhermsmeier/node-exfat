/**
 * Entry
 * @return {Entry}
 */
function Entry() {
  
  if( !(this instanceof Entry) )
    return new Entry()
  
  this.type = 0x00
  this.data = new Buffer( 31 )
  this.data.fill( 0 )
  
}

Entry.VALID     = 0x80
Entry.CONTINUED = 0x40
Entry.OPTIONAL  = 0x20

Entry.BITMAP    = ( 0x01 | Entry.VALID )
Entry.UPCASE    = ( 0x02 | Entry.VALID )
Entry.LABEL     = ( 0x03 | Entry.VALID )
Entry.FILE      = ( 0x05 | Entry.VALID )
Entry.FILE_INFO = ( 0x00 | Entry.VALID | Entry.CONTINUED )
Entry.FILE_NAME = ( 0x01 | Entry.VALID | Entry.CONTINUED )

Entry.Bitmap = require( './bitmap' )
Entry.UpCase = require( './upcase' )
Entry.Label = require( './label' )
Entry.File = require( './file' )
Entry.FileInfo = require( './file-info' )
Entry.FileName = require( './file-name' )

/**
 * Entry prototype
 * @type {Object}
 */
Entry.prototype = {
  
  constructor: Entry,
  
  parse: function( buffer ) {
    
    this.type = buffer[ 0 ]
    buffer.copy( this.data, 0x01 )
    
    return this
    
  },
  
  toBuffer: function() {
    
  }
  
}

// Exports
module.exports = Entry
