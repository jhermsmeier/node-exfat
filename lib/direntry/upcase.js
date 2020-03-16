var ExFAT = require( '../exfat' )

class UpCase extends ExFAT.DirEntry {

  /**
   * Create a new UpCase
   * @returns {UpCase}
   * @constructor
   */
  constructor() {

    super()
    
    /** @type {ExFAT.ENTRY} Entry type */
    this.type = ExFAT.ENTRY.UPCASE
    /** @type {Buffer} Reserved1 */
    this.reserved1 = Buffer.alloc( 3 )
    /** @type {Number} Checksum */
    this.checksum = 0x00000000
    /** @type {Buffer} Reserved2 */
    this.reserved2 = Buffer.alloc( 12 )
    /** @type {Number} Start cluster */
    this.cluster = 0x00000000
    /** @type {BigInt} Size */
    this.size = 0x0000000000000000n
    
  }

  /**
   * Read a UpCase from a buffer
   * @param {UpCase} [instance]
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {UpCase}
   */
  static read( instance, buffer, offset ) {

    if( Buffer.isBuffer( instance ) )
      return UpCase.read( new UpCase(), instance, buffer )

    instance = instance || new UpCase()
    offset = offset || 0

    instance.type = buffer.readUInt8( offset + 0 )
    buffer.copy( instance.reserved1, 0, offset + 1, offset + 4 )
    instance.checksum = buffer.readUInt32LE( offset + 4 )
    buffer.copy( instance.reserved2, 0, offset + 8, offset + 20 )
    instance.cluster = buffer.readUInt32LE( offset + 20 )
    instance.size = buffer.readBigUInt64LE( offset + 24 )

    return instance

  }

  /**
   * Write a UpCase to a buffer
   * @param {UpCase} instance
   * @param {Buffer} [buffer]
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  static write( instance, buffer, offset ) {

    offset = offset || 0
    buffer = buffer || Buffer.alloc( ExFAT.DirEntry.SIZE + offset )

    offset = buffer.writeUInt8( instance.type, offset )
    offset += instance.reserved1.copy( buffer, offset, 0, 3 )
    offset = buffer.writeUInt32LE( instance.checksum, offset )
    offset += instance.reserved2.copy( buffer, offset, 0, 12 )
    offset = buffer.writeUInt32LE( instance.cluster, offset )
    offset = buffer.writeBigUInt64LE( instance.size, offset )

    return buffer

  }

}

module.exports = UpCase
