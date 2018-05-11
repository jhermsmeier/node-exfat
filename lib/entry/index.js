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
  this.data = Buffer.alloc( 31 )
  this.data.fill( 0 )
  
}

Entry.IN_USE    = 0x80
Entry.CONTINUED = 0x40
Entry.OPTIONAL  = 0x20

Entry.BITMAP    = ( 0x01 | Entry.IN_USE )
Entry.UPCASE    = ( 0x02 | Entry.IN_USE )
Entry.LABEL     = ( 0x03 | Entry.IN_USE )
Entry.FILE      = ( 0x05 | Entry.IN_USE )
Entry.FILE_INFO = ( 0x00 | Entry.IN_USE | Entry.CONTINUED )
Entry.FILE_NAME = ( 0x01 | Entry.IN_USE | Entry.CONTINUED )

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
  
  var type = buffer[0]
  var deleted = false
  var optional = false
  var entry = null
  
  if( !(type & Entry.IN_USE) ) {
    deleted = true
    // NOTE: This makes deleted files visible again! MAGIC!
    // Cannot help but wonder what'd happen, if the records
    // would be written back to disk with this bit inverted...
    // It needs to be tried at some point!
    type = type ^ Entry.IN_USE
  }
  
  // TODO: Check where this came from; doesn't seem to be in use?
  if( type & Entry.OPTIONAL ) {
    optional = true
  }
  
  if( type === Entry.FILE ) {
    entry = new Entry.File().parse( buffer )
  } else if( type === Entry.FILE_INFO ) {
    entry = new Entry.FileInfo().parse( buffer )
  } else if( type === Entry.FILE_NAME ) {
    entry = new Entry.FileName().parse( buffer )
  } else if( type === Entry.LABEL ) {
    entry = new Entry.Label().parse( buffer )
  } else if( type === Entry.BITMAP ) {
    entry = new Entry.Bitmap().parse( buffer )
  } else if( type === Entry.UPCASE ) {
    entry = new Entry.UpCase().parse( buffer )
  }
  
  // TODO: Benchmark which one is faster, the if/else, or the switch.
  // The latter is certainly more readable.
  // switch( type ) {
  //   case Entry.FILE:      entry = new Entry.File().parse( buffer ); break
  //   case Entry.FILE_INFO: entry = new Entry.FileInfo().parse( buffer ); break
  //   case Entry.FILE_NAME: entry = new Entry.FileName().parse( buffer ); break
  //   case Entry.LABEL:     entry = new Entry.Label().parse( buffer ); break
  //   case Entry.BITMAP:    entry = new Entry.Bitmap().parse( buffer ); break
  //   case Entry.UPCASE:    entry = new Entry.UpCase().parse( buffer ); break
  // }
  
  if( entry && deleted ) {
    entry.deleted = true
  }
  
  if( entry && optional ) {
    entry.optional = true
  }
  
  return entry
  
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
    var buffer = Buffer.alloc( 32 )
    buffer.writeUInt8( this.type, 0 )
    this.data.copy( buffer, 1 )
    return buffer
  }
  
}

// Exports
module.exports = Entry
