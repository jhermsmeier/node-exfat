class VBR {
  
  constructor() {
    
    /** @type {Buffer} 0x00 JMP & NOP */
    this.jump = Buffer.alloc( 3 )
    /** @type {String} 0x03 "EXFAT   " */
    this.oemName = ''
    /** @type {Number} 0x0B reserved, zeroed */
    this.reserved1 = 0x00
    /** @type {Number} 0x40 first sector */
    this.sectorStart = 0x0000000000000000n
    /** @type {Number} 0x48 sector count */
    this.sectorCount = 0x0000000000000000n
    /** @type {Number} 0x50 FAT start offset */
    this.fatSectorStart = 0x00000000
    /** @type {Number} 0x54 FAT sector count */
    this.fatSectorCount = 0x00000000
    /** @type {Number} 0x58 first cluster sector */
    this.clusterSectorStart = 0x00000000
    /** @type {Number} 0x5C total cluster count */
    this.clusterCount = 0x00000000
    /** @type {Number} 0x60 first cluster of root dir */
    this.rootDirCluster = 0x00000000
    /** @type {Number} 0x64 volume serial number */
    this.serialNumber = 0x00000000
    /** @type {Object} 0x68 FS version */
    this.version = { major: 0, minor: 0 }
    /** @type {Number} 0x6A volume state flags */
    this.volumeState = 0x0000
    /** @type {Number} 0x6C sector size as (1 << n) */
    this.sectorBits = 0x00
    /** @type {Number} 0x6D sectors per cluster as (1 << n) */
    this.spcBits = 0x00
    /** @type {Number} 0x6E FAT count (always 1) */
    this.fatCount = 0x01
    /** @type {Number} 0x6F drive number (always 0x80) */
    this.driveNumber = 0x80
    /** @type {Number} 0x70 percentage of allocated space */
    this.allocatedPercent = 0x00
    /** @type {Buffer} 0x71 reserved (391 bytes), zeroed */
    this.reserved2 = Buffer.alloc( 391 )
    /** @type {Number} 0x1FE signature (0x55AA) */
    this.signature = 0xAA55
    
  }
  
  /**
   * Sector size in bytes
   * @type {Number}
   * @readOnly
   */
  get sectorSize() {
    return 1 << this.sectorBits
  }
  
  /**
   * Number of sectors per cluster
   * @type {Number}
   * @readOnly
   */
  get sectorsPerCluster() {
    return 1 << this.spcBits
  }
  
  /**
   * Cluster size in bytes
   * @type {Number}
   * @readOnly
   */
  get clusterSize() {
    return this.sectorSize * this.sectorsPerCluster
  }
  
  /**
   * Read a Volume Boot Record from a buffer
   * @param {VBR} [vbr]
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {VBR}
   */
  read( buffer, offset ) {
    return VBR.read( this, buffer, offset )
  }
  
  /**
   * Write a Volume Boot Record to a buffer
   * @param {VBR} vbr
   * @param {Buffer} [buffer]
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  write( buffer, offset ) {
    return VBR.write( this, buffer, offset )
  }
  
  /**
   * Read a Volume Boot Record from a buffer
   * @param {VBR} [vbr]
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {VBR}
   */
  static read( instance, buffer, offset ) {
    
    if( Buffer.isBuffer( instance ) ) {
      return VBR.read( new VBR(), instance, offset )
    }
    
    instance = instance || new VBR()
    offset = offset || 0
    
    buffer.copy( instance.jump, 0, offset + 0x00, offset + 0x03 )
    
    instance.oemName = buffer.toString( 'ascii', offset + 0x03, offset + 0x0B )
    instance.reserved1 = buffer.readUInt8( offset + 0x0B )
    
    instance.sectorStart = buffer.readBigUInt64LE( offset + 0x40 )
    instance.sectorCount = buffer.readBigUInt64LE( offset + 0x48 )
    
    instance.fatSectorStart = buffer.readUInt32LE( offset + 0x50 )
    instance.fatSectorCount = buffer.readUInt32LE( offset + 0x54 )
    instance.clusterSectorStart = buffer.readUInt32LE( offset + 0x58 )
    instance.clusterCount = buffer.readUInt32LE( offset + 0x5C )
    instance.rootDirCluster = buffer.readUInt32LE( offset + 0x60 )
    instance.serialNumber = buffer.readUInt32LE( offset + 0x64 )
    
    instance.version.minor = buffer.readUInt8( offset + 0x68 )
    instance.version.major = buffer.readUInt8( offset + 0x69 )
    
    instance.volumeState = buffer.readUInt16LE( offset + 0x6A )
    
    instance.sectorBits = buffer.readUInt8( offset + 0x6C )
    instance.spcBits = buffer.readUInt8( offset + 0x6D )
    instance.fatCount = buffer.readUInt8( offset + 0x6E )
    instance.driveNumber = buffer.readUInt8( offset + 0x6F )
    instance.allocatedPercent = buffer.readUInt8( offset + 0x70 )
    
    buffer.copy( instance.reserved2, 0, offset + 0x71, offset + 0x1FE )
    
    instance.signature = buffer.readUInt16LE( offset + 0x1FE )
    
    if( instance.signature !== VBR.SIGNATURE ) {
      throw new Error( `Invalid VBR signature "0x${instance.signature.toString(16)}"` )
    }
    
    // TODO: Check oemName as well
    
    return instance
    
  }
  
  /**
   * Write a Volume Boot Record to a buffer
   * @param {VBR} instance
   * @param {Buffer} [buffer]
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  static write( instance, buffer, offset ) {
    
    offset = offset || 0
    buffer = buffer || Buffer.alloc( VBR.SIZE + offset )
    
    offset += instance.jump.copy( buffer, offset, 0x00, 0x03 )
    offset += buffer.write( instance.oemName, offset, 0x08, 'ascii' )
    
    offset = buffer.writeUInt8LE( instance.reserved1, offset )
    offset = buffer.writeBigUInt64LE( instance.sectorStart, offset )
    offset = buffer.writeBigUInt64LE( instance.sectorCount, offset )
    
    offset = buffer.writeUInt32LE( instance.fatSectorStart, offset )
    offset = buffer.writeUInt32LE( instance.fatSectorCount, offset )
    offset = buffer.writeUInt32LE( instance.clusterSectorStart, offset )
    offset = buffer.writeUInt32LE( instance.clusterCount, offset )
    offset = buffer.writeUInt32LE( instance.rootDirCluster, offset )
    offset = buffer.writeUInt32LE( instance.serialNumber, offset )
    
    offset = buffer.writeUInt8( instance.version.minor, offset )
    offset = buffer.writeUInt8( instance.version.major, offset )
    
    offset = buffer.writeUInt16LE( instance.volumeState, offset )
    
    offset = buffer.writeUInt8( instance.sectorBits, offset )
    offset = buffer.writeUInt8( instance.spcBits, offset )
    offset = buffer.writeUInt8( instance.fatCount, offset )
    offset = buffer.writeUInt8( instance.driveNumber, offset )
    offset = buffer.writeUInt8( instance.allocatedPercent, offset )
    
    offset += instance.reserved2.copy( buffer, offset, 0x00, 0x187 )
    
    offset = buffer.writeUInt16LE( instance.signature, offset )
    
    return buffer
    
  }
  
}

/**
 * Size of the Volume Boot Record structure in bytes
 * @type {Number}
 * @constant
 * @default
 */
VBR.SIZE = 512

/**
 * Volume Boot Record signature
 * @type {Number}
 * @constant
 * @default
 */
VBR.SIGNATURE = 0xAA55

/**
 * Default Volume Boot Record OEM name
 * @type {String}
 * @constant
 * @default
 */
VBR.OEM_NAME = 'EXFAT   '

module.exports = VBR
