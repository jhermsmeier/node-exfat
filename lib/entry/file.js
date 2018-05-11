var Entry = require( './index' )
var Time = require( '../time' )

/**
 * File
 * @return {File}
 */
function File() {
  
  if( !(this instanceof File) )
    return new File()
  
  this.type = Entry.FILE
  this.continuations = 0x00
  this.checksum = 0x00
  this.attr = 0x0000
  this.unknown1 = 0x0000
  this.crtime = 0x0000
  this.crdate = 0x0000
  this.mtime = 0x0000
  this.mdate = 0x0000
  this.atime = 0x0000
  this.adate = 0x0000
  this.crtimeCs = 0x00
  this.mtimeCs = 0x00
  this.unknown2 = Buffer.alloc( 10 )
  this.unknown2.fill( 0 )
  this.times = null
  
}

/**
 * File prototype
 * @type {Object}
 */
File.prototype = {
  
  constructor: File,
  
  parse: function( buffer ) {
    
    this.type = buffer[ 0 ]
    this.continuations = buffer[ 1 ]
    this.checksum = buffer.readUInt16LE( 0x02 )
    this.attr = buffer.readUInt16LE( 0x04 )
    this.unknown1 = buffer.readUInt16LE( 0x06 )
    this.crtime = buffer.readUInt16LE( 0x08 )
    this.crdate = buffer.readUInt16LE( 0x0A )
    this.mtime = buffer.readUInt16LE( 0x0C )
    this.mdate = buffer.readUInt16LE( 0x0E )
    this.atime = buffer.readUInt16LE( 0x10 )
    this.adate = buffer.readUInt16LE( 0x12 )
    this.crtimeCs = buffer[ 0x14 ]
    this.mtimeCs = buffer[ 0x15 ]
    buffer.copy( this.unknown2, 0x16 )
    
    // NOTE: Missing `this.atimeCs`? (prob. not defined in struct)
    this.times = {
      created: new Date( Time.toUnix( this.crdate, this.crtime, this.crtimeCs ) ),
      modified: new Date( Time.toUnix( this.mdate, this.mtime, this.mtimeCs ) ),
      accessed: new Date( Time.toUnix( this.adate, this.atime, this.atimeCs || 0 ) ),
    }
    
    return this
    
  },
  
  toBuffer: function() {
    throw new Error( 'Not implemented' )
  }
  
}

// Exports
module.exports = File
