var Int64 = require( '../int64' )

/**
 * BootRecord
 * @constructor
 * @param {Object} options
 * @return {BootRecord}
 */
function BootRecord( options ) {
  
  if( !(this instanceof BootRecord) )
    return new BootRecord( options )
  
  // 0x00 JMP & NOP
  this.jump = new Buffer( 3 )
  // 0x03 "EXFAT   "
  this.oemName = ''
  // 0x0B reserved, zeroed
  this.reserved1 = 0x00
  // 0x40 first sector
  this.sectorStart = 0x0000000000000000
  // 0x48 sector count
  this.sectorCount = 0x0000000000000000
  // 0x50 FAT start offset
  this.fatSectorStart = 0x00000000
  // 0x54 FAT sector count
  this.fatSectorCount = 0x00000000
  // 0x58 first cluster sector
  this.clusterSectorStart = 0x00000000
  // 0x5C total cluster count
  this.clusterCount = 0x00000000
  // 0x60 first cluster of root dir
  this.rootDirCluster = 0x00000000
  // 0x64 volume serial number
  this.serialNumber = 0x00000000
  // 0x68 FS version
  this.version = {
    major: 0x00,
    minor: 0x00
  }
  // 0x6A volume state flags
  this.volumeState = 0x0000
  // 0x6C sector size as (1 << n)
  this.sectorBits = 0x00
  // 0x6D sectors per cluster as (1 << n)
  this.spcBits = 0x00
  // 0x6E FAT count (always 1)
  this.fatCount = 0x01
  // 0x6F drive number (always 0x80)
  this.driveNumber = 0x80
  // 0x70 percentage of allocated space
  this.allocatedPercent = 0x00
  // 0x71 reserved (391 bytes), zeroed
  this.reserved2 = new Buffer( 391 )
  this.reserved2.fill( 0 )
  // 0x1FE signature (0xAA55)
  this.bootSignature = 0xAA55
  
}

BootRecord.create = function( options ) {
  return new BootRecord( options )
}

BootRecord.parse = function( buffer ) {
  return new BootRecord().parse( buffer )
}

/**
 * BootRecord prototype
 * @type {Object}
 */
BootRecord.prototype = {
  
  constructor: BootRecord,
  
  parse: function( buffer ) {
    
    buffer.copy( this.jump )
    
    this.oemName = buffer.toString( 'ascii', 0x03, 0x0B )
    this.reserved1 = buffer.readUInt8( 0x0B )
    
    this.sectorStart = Int64.readUInt64LE( buffer, 0x40 )
    this.sectorCount = Int64.readUInt64LE( buffer, 0x48 )
    
    this.fatSectorStart = buffer.readUInt32LE( 0x50 )
    this.fatSectorCount = buffer.readUInt32LE( 0x54 )
    this.clusterSectorStart = buffer.readUInt32LE( 0x58 )
    this.clusterCount = buffer.readUInt32LE( 0x5C )
    this.rootDirCluster = buffer.readUInt32LE( 0x60 )
    this.serialNumber = buffer.readUInt32LE( 0x64 )
    
    this.version.minor = buffer.readUInt8( 0x68 )
    this.version.major = buffer.readUInt8( 0x69 )
    
    this.volumeState = buffer.readUInt16LE( 0x6A )
    
    this.sectorBits = buffer.readUInt8( 0x6C )
    this.spcBits = buffer.readUInt8( 0x6D )
    this.fatCount = buffer.readUInt8( 0x6E )
    this.driveNumber = buffer.readUInt8( 0x6F )
    this.allocatedPercent = buffer.readUInt8( 0x70 )
    
    buffer.copy( this.reserved2, 0x71 )
    
    this.bootSignature = buffer.readUInt16LE( 0x1FE )
    
    return this
    
  },
  
  toBuffer: function() {
    
    throw new Error( 'Not implemented' )
    
    var buffer = new Buffer( 512 )
    
    buffer.fill( 0 )
    
    return buffer
    
  },
  
}

// Exports
module.exports = BootRecord
