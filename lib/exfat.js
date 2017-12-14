var FSError = require( './error' )
var ExFAT = module.exports

ExFAT.EPOCH = new Date( '1980-01-01T00:00:00.000Z' )

ExFAT.FIRST_DATA_CLUSTER = 2
ExFAT.LAST_DATA_CLUSTER = 0xFFFFFFF6

ExFAT.CLUSTER_FREE = 0x00000000 // free cluster
ExFAT.CLUSTER_BAD = 0xFFFFFFF7 // cluster contains bad sector
ExFAT.CLUSTER_END = 0xFFFFFFFF // final cluster of file or directory

ExFAT.STATE_MOUNTED = 2

ExFAT.ENAME_MAX = 15

ExFAT.ATTR_RO = 0x01
ExFAT.ATTR_HIDDEN = 0x02
ExFAT.ATTR_SYSTEM = 0x04
ExFAT.ATTR_VOLUME = 0x08
ExFAT.ATTR_DIR = 0x10
ExFAT.ATTR_ARCH = 0x20

ExFAT.FLAG_ALWAYS     = ( 1 << 0 )
ExFAT.FLAG_CONTIGUOUS = ( 1 << 1 )

ExFAT.Entry = require( './entry' )
ExFAT.Node = require( './node' )
ExFAT.Volume = require( './volume' )

/**
 * Determine whether a boot sector
 * indicates an ExFAT formatted volume
 * @param {Buffer} block
 * @returns {Boolean}
 */
ExFAT.test = function( block ) {
  
  var vbr = new ExFAT.Volume.BootRecord
  
  try {
    vbr.parse( block )
  } catch( err ) {
    return new FSError(
      FSError.EIO,
      'Failed to parse boot sector'
    )
  }
    
  if( vbr.oemName !== 'EXFAT   ' )
    return new FSError(
      FSError.EIO,
      'No exFAT file system found'
    )
  
  if( vbr.sectorBits < 9 )
    return new FSError(
      FSError.EIO,
      'Sector size too small: 2^' + vbr.sectorBits + ' bits'
    )
  
  if( vbr.sectorBits + vbr.spcBits > 25 )
    return new FSError(
      FSError.EIO,
      'Cluster size too big: 2^' + ( vbr.sectorBits + vbr.spcBits ) + ' bits'
    )
  
  if( vbr.version.major !== 1 || vbr.version.minor !== 0 )
    return new FSError(
      FSError.EIO,
      'Unsupported exFAT version: ' + vbr.version.major + '.' + vbr.version.minor
    )
  
  if( vbr.fatCount !== 1 )
    return new FSError(
      FSError.EIO,
      'Unsupported FAT count: ' + vbr.fatCount
    )
  
  // TODO: in volume.mount()
  // - Verify checksum
  // - FS larger than underlying device (?)
  // - Upcase table not found
  // - Cluster bitmap not found
  
}
