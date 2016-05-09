var debug = require( 'debug' )( 'exfat:entry' )

/**
 * Entry
 * @constructor
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
 * Parse an entry from a buffer
 * @param  {Buffer} buffer
 * @return {Entry}
 */
Entry.parse = function( buffer ) {
  
  if( !buffer || buffer.length !== 32 )
    throw new Error( 'Invalid buffer or buffer length' )
  
  switch( buffer[ 0 ] ) {
    case Entry.FILE:
      return new Entry.File().parse( buffer );
      break
    case Entry.FILE_INFO:
      return new Entry.FileInfo().parse( buffer );
      break
    case Entry.FILE_NAME:
      return new Entry.FileName().parse( buffer );
      break
    case Entry.LABEL:
      return new Entry.Label().parse( buffer );
      break
    case Entry.BITMAP:
      return new Entry.Bitmap().parse( buffer );
      break
    case Entry.UPCASE:
      return new Entry.UpCase().parse( buffer );
      break
    default:
      if( !( buffer[0] & Entry.VALID ) ) {
        // deleted entry
        // debug( 'invalid ', buffer[0], '(deleted)' )
        break
      }
      if( !( buffer[0] & Entry.OPTIONAL ) ) {
        // throw new Error( 'Unknown entry 0x' + buffer[0].toString( 16 ).toUpperCase() )
        // debug( 'optional', buffer[0] )
        // break
      }
      // return new Entry().parse( buffer )
      break
  }
  
}

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
    throw new Error( 'Not implemented' )
    var buffer = new Buffer( 32 )
    buffer.writeUInt8( this.type, 0 )
    this.data.copy( buffer, 1 )
    return buffer
  }
  
}

// Exports
module.exports = Entry
