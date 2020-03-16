var ExFAT = require( '../exfat' )

class File extends ExFAT.DirEntry {

  /**
   * Create a new File
   * @returns {File}
   * @constructor
   */
  constructor() {

    super()
    
    /** @type {ExFAT.ENTRY} Entry type */
    this.type = ExFAT.ENTRY.FILE
    /** @type {Number} Continuations */
    this.continuations = 0x00
    /** @type {Number} Checksum */
    this.checksum = 0x0000
    /** @type {Number} Attributes */
    this.attr = 0x0000
    /** @type {Number} Unknown1 */
    this.unknown1 = 0x0000
    /** @type {Number} Creation time */
    this.crtime = 0x0000
    /** @type {Number} Creation date */
    this.crdate = 0x0000
    /** @type {Number} Modification time */
    this.mtime = 0x0000
    /** @type {Number} Modification date */
    this.mdate = 0x0000
    /** @type {Number} Access time */
    this.atime = 0x0000
    /** @type {Number} Access date */
    this.adate = 0x0000
    /** @type {Number} Creation time centiseconds */
    this.crtimeCs = 0x00
    /** @type {Number} Modification time centiseconds */
    this.mtimeCs = 0x00
    /** @type {Number} Unknown2 */
    this.unknown2 = Buffer.alloc( 10 )
    
  }

  /**
   * Read a File from a buffer
   * @param {File} [instance]
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {File}
   */
  static read( instance, buffer, offset ) {

    if( Buffer.isBuffer( instance ) )
      return File.read( new File(), instance, buffer )

    instance = instance || new File()
    offset = offset || 0

    instance.type = buffer.readUInt8( offset + 0 )
    instance.continuations = buffer.readUInt8( offset + 1 )
    instance.checksum = buffer.readUInt16LE( offset + 2 )
    instance.attr = buffer.readUInt16LE( offset + 4 )
    instance.unknown1 = buffer.readUInt16LE( offset + 6 )
    instance.crtime = buffer.readUInt16LE( offset + 8 )
    instance.crdate = buffer.readUInt16LE( offset + 10 )
    instance.mtime = buffer.readUInt16LE( offset + 12 )
    instance.mdate = buffer.readUInt16LE( offset + 14 )
    instance.atime = buffer.readUInt16LE( offset + 16 )
    instance.adate = buffer.readUInt16LE( offset + 18 )
    instance.crtimeCs = buffer.readUInt8( offset + 20 )
    instance.mtimeCs = buffer.readUInt8( offset + 21 )
    
    buffer.copy( instance.unknown2, 0, offset + 22, offset + 32 )

    return instance

  }

  /**
   * Write a File to a buffer
   * @param {File} instance
   * @param {Buffer} [buffer]
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  static write( instance, buffer, offset ) {

    offset = offset || 0
    buffer = buffer || Buffer.alloc( ExFAT.DirEntry.SIZE + offset )

    offset = buffer.writeUInt8( instance.type, offset )
    offset = buffer.writeUInt8( instance.continuations, offset )
    offset = buffer.writeUInt16( instance.checksum, offset )
    offset = buffer.writeUInt16LE( instance.attr, offset )
    offset = buffer.writeUInt16LE( instance.unknown1, offset )
    offset = buffer.writeUInt16LE( instance.crtime, offset )
    offset = buffer.writeUInt16LE( instance.crdate, offset )
    offset = buffer.writeUInt16LE( instance.mtime, offset )
    offset = buffer.writeUInt16LE( instance.mdate, offset )
    offset = buffer.writeUInt16LE( instance.atime, offset )
    offset = buffer.writeUInt16LE( instance.adate, offset )
    offset = buffer.writeUInt8( instance.crtimeCs, offset )
    offset = buffer.writeUInt8( instance.mtimeCs, offset )
    
    offset += instance.unknown2.copy( buffer, offset, 0, 32 )

    return buffer

  }

}

module.exports = File
