var ExFAT = require( '../exfat' )

class FileName extends ExFAT.DirEntry {
  
  /**
   * Create a new FileName
   * @returns {FileName}
   * @constructor
   */
  constructor() {
    
    super()
    
    /** @type {ExFAT.ENTRY} Entry type */
    this.type = ExFAT.ENTRY.FILE_NAME
    /** @type {Number} Unknown1 */
    this.unknown1 = 0x00
    /** @type {String} File name */
    this.value = ''
    
  }
  
  /**
   * Read a FileName from a buffer
   * @param {FileName} [instance]
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {FileName}
   */
  static read( instance, buffer, offset ) {
    
    if( Buffer.isBuffer( instance ) )
      return FileName.read( new FileName(), instance, buffer )
    
    instance = instance || new FileName()
    offset = offset || 0
    
    instance.type = buffer.readUInt8( offset + 0 )
    instance.unknown1 = buffer.readUInt8( offset + 1 )
    instance.value = buffer.toString( 'utf16le', offset + 2, offset + 32 )
    
    return instance
    
  }
  
  /**
   * Write a FileName to a buffer
   * @param {FileName} instance
   * @param {Buffer} [buffer]
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  static write( instance, buffer, offset ) {
    
    offset = offset || 0
    buffer = buffer || Buffer.alloc( ExFAT.DirEntry.SIZE + offset )
    
    offset = buffer.writeUInt8( instance.type, offset )
    offset = buffer.writeUInt8( instance.unknown1, offset )
    
    buffer.fill( 0, offset, offset + 30 )
    
    offset += buffer.write( instance.value, offset, 30, 'utf16le' )
    
    return buffer
    
  }
  
}

module.exports = FileName
