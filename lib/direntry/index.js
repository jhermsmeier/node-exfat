var ExFAT = require( '../exfat' )

class DirEntry {
  
  constructor() {
    /** @type {ExFAT.ENTRY} Entry type */
    this.type = ExFAT.ENTRY.VALID
  }
  
  get isValid() {
    return ( this.type & ExFAT.ENTRY.VALID ) == ExFAT.ENTRY.VALID
  }
  
  get isContinued() {
    return ( this.type & ExFAT.ENTRY.CONTINUED ) == ExFAT.ENTRY.CONTINUED
  }
  
  get isOptional() {
    return ( this.type & ExFAT.ENTRY.OPTIONAL ) == ExFAT.ENTRY.OPTIONAL
  }
  
  /**
   * Read the directory entry from a buffer
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {DirEntry}
   */
  read( buffer, offset ) {
    return this.constructor.read( this, buffer, offset )
  }
  
  /**
   * Write the directory entry to a buffer
   * @param {Buffer} [buffer]
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  write( buffer, offset ) {
    return this.constructor.write( this, buffer, offset )
  }
  
  /**
   * Read a directory entry from a buffer
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {DirEntry}
   */
  static read( buffer, offset ) {
    
    offset = offset || 0
    
    var type = buffer.readUInt8( offset )
    
    switch( type ) {
      case ExFAT.ENTRY.BITMAP: return DirEntry.Bitmap.read( buffer, offset )
      case ExFAT.ENTRY.UPCASE: return DirEntry.UpCase.read( buffer, offset )
      case ExFAT.ENTRY.LABEL: return DirEntry.Label.read( buffer, offset )
      case ExFAT.ENTRY.FILE: return DirEntry.File.read( buffer, offset )
      case ExFAT.ENTRY.FILE_INFO: return DirEntry.FileInfo.read( buffer, offset )
      case ExFAT.ENTRY.FILE_NAME: return DirEntry.FileName.read( buffer, offset )
      // TODO: ExFAT.ENTRY.FILE_TAIL ?
      default: throw new Error( `Unknown or invalid directory entry type "0x${type.toString(16)}"` )
    }
    
  }

  /**
   * Write a directory entry to a buffer
   * @param {DirEntry} instance
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {DirEntry}
   */
  static write( instance, buffer, offset ) {
    
    offset = offset || 0
    
    switch( instance.type ) {
      case ExFAT.ENTRY.BITMAP: return DirEntry.Bitmap.write( instance, buffer, offset )
      case ExFAT.ENTRY.UPCASE: return DirEntry.UpCase.write( instance, buffer, offset )
      case ExFAT.ENTRY.LABEL: return DirEntry.Label.write( instance, buffer, offset )
      case ExFAT.ENTRY.FILE: return DirEntry.File.write( instance, buffer, offset )
      case ExFAT.ENTRY.FILE_INFO: return DirEntry.FileInfo.write( instance, buffer, offset )
      case ExFAT.ENTRY.FILE_NAME: return DirEntry.FileName.write( instance, buffer, offset )
      // TODO: ExFAT.ENTRY.FILE_TAIL ?
      default: throw new Error( `Unknown or invalid directory entry type "0x${type.toString(16)}"` )
    }
    
  }

}

module.exports = DirEntry

/**
 * Size of a directory entry in bytes
 * @type {Number}
 * @constant
 * @default
 */
DirEntry.SIZE = 32
