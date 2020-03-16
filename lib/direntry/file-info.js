var ExFAT = require( '../exfat' )

class FileInfo extends ExFAT.DirEntry {
  
  /**
   * Create a new FileInfo
   * @returns {FileInfo}
   * @constructor
   */
  constructor() {
    
    super()
    
    /** @type {ExFAT.ENTRY} Entry type */
    this.type = ExFAT.ENTRY.FILE_INFO
    /** @type {Number} Flags */
    this.flags = 0x00
    /** @type {Number} Reserved1 */
    this.reserved1 = 0x00
    /** @type {Number} Length of the file name in bytes */
    this.nameLength = 0x00
    /** @type {Number} File name checksum */
    this.nameHash = 0x0000
    /** @type {Number} Reserved2 */
    this.reserved2 = 0x0000
    /** @type {Number} Valid size */
    this.validSize = 0x0000000000000000n
    /** @type {Number} Reserved3 */
    this.reserved3 = 0x00000000
    /** @type {Number} Start cluster */
    this.cluster = 0x00000000
    /** @type {Number} Size */
    this.size = 0x0000000000000000n
    
  }
  
  /**
   * Read a FileInfo from a buffer
   * @param {FileInfo} [instance]
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {FileInfo}
   */
  static read( instance, buffer, offset ) {
    
    if( Buffer.isBuffer( instance ) )
      return FileInfo.read( new FileInfo(), instance, buffer )
    
    instance = instance || new FileInfo()
    offset = offset || 0
    
    instance.type = buffer.readUInt8( offset + 0 )
    instance.flags = buffer.readUInt8( offset + 1 )
    instance.reserved1 = buffer.readUInt8( offset + 2 )
    instance.nameLength = buffer.readUInt8( offset + 3 )
    instance.nameHash = buffer.readUInt16LE( offset + 4 )
    instance.reserved2 = buffer.readUInt16LE( offset + 6 )
    instance.validSize = buffer.readBigUInt64LE( offset + 8 )
    instance.reserved3 = buffer.readUInt32LE( offset + 16 )
    instance.cluster = buffer.readUInt32LE( offset + 20 )
    instance.size = buffer.readBigUInt64LE( offset + 24 )
    
    return instance
    
  }
  
  /**
   * Write a FileInfo to a buffer
   * @param {FileInfo} instance
   * @param {Buffer} [buffer]
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  static write( instance, buffer, offset ) {
    
    offset = offset || 0
    buffer = buffer || Buffer.alloc( ExFAT.DirEntry.SIZE + offset )
    
    offset = buffer.writeUInt8( instance.type, offset )
    offset = buffer.writeUInt8( instance.flags, offset )
    offset = buffer.writeUInt8( instance.reserved1, offset )
    offset = buffer.writeUInt8( instance.nameLength, offset )
    offset = buffer.writeUInt16LE( instance.nameHash, offset )
    offset = buffer.writeUInt16LE( instance.reserved2, offset )
    offset = buffer.writeBigUInt64LE( instance.validSize, offset )
    offset = buffer.writeUInt32LE( instance.reserved3, offset )
    offset = buffer.writeUInt32LE( instance.cluster, offset )
    offset = buffer.writeBigUInt64LE( instance.size, offset )
    
    return buffer
    
  }
  
}

module.exports = FileInfo
