var ExFAT = require( '../exfat' )

class Bitmap extends ExFAT.DirEntry {
  
  /**
   * Create a new Bitmap
   * @returns {Bitmap}
   * @constructor
   */
  constructor() {
    
    super()
    
    /** @type {ExFAT.ENTRY} Entry type */
    this.type = ExFAT.ENTRY.BITMAP
    /** @type {Buffer} Unknown */
    this.unknown1 = Buffer.alloc( 19 )
    /** @type {Number} Start cluster */
    this.cluster = 0x00000000
    /** @type {BigInt} Size */
    this.size = 0x0000000000000000n
    
  }
  
  /**
   * Read a Bitmap from a buffer
   * @param {Bitmap} [instance]
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {Bitmap}
   */
  static read( instance, buffer, offset ) {
    
    if( Buffer.isBuffer( instance ) )
      return Bitmap.read( new Bitmap(), instance, buffer )
    
    instance = instance || new Bitmap()
    offset = offset || 0
    
    instance.type = buffer.readUInt8( offset + 0 )
    buffer.copy( instance.unknown1, 0, offset + 1, offset + 20 )
    instance.cluster = buffer.readUInt32LE( offset + 20 )
    instance.size = buffer.readBigUInt64LE( offset + 24 )
    
    return instance
    
  }
  
  /**
   * Write a Bitmap to a buffer
   * @param {Bitmap} instance
   * @param {Buffer} [buffer]
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  static write( instance, buffer, offset ) {
    
    offset = offset || 0
    buffer = buffer || Buffer.alloc( ExFAT.DirEntry.SIZE + offset )
    
    offset = buffer.writeUInt8( instance.type, offset )
    offset += instance.unknown1.copy( buffer, offset, 0, 19 )
    offset = buffer.writeUInt32LE( instance.cluster, offset )
    offset = buffer.writeBigUInt64LE( instance.size, offset )
    
    return buffer
    
  }
  
}

module.exports = Bitmap
