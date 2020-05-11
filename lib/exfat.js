var ExFAT = module.exports

/**
 * ExFAT epoch (1st January 1980, 00:00 UTC)
 * in seconds since the UNIX epoch
 * @type {Number}
 * @constant
 */
ExFAT.EPOCH = 315532800

/**
 * Master Boot Record partition types
 * @type {Array<Number>}
 * @constant
 */
ExFAT.TYPES = [ 0x07 ]

/**
 * GUID Partition Table UUIDs
 * @type {Array<String>}
 * @constant
 */
ExFAT.GUIDS = [
  'EBD0A0A2-B9E5-4433-87C0-68B6B72699C7'
]

/**
 * Cluster markers
 * @enum {Number}
 */
ExFAT.CLUSTER = {
  /** @type {Number} Unallocated cluster */
  FREE: 0x00000000,
  /** @type {Number} Internal use cluster */
  INTERNAL: 0x00000001,
  /** @type {Number} First data cluster */
  DATA: 0x00000002,
  /** @type {Number} Reserved data cluster (not sure if this applies under ExFAT) */
  RESERVED: 0xFFFFFFF0,
  /** @type {Number} Last data cluster */
  END: 0xFFFFFFF6,
  /** @type {Number} Bad data cluster */
  BAD: 0xFFFFFFF7,
  /** @type {Number} End-of-chain of file or directory */
  EOC: 0xFFFFFFFF,
}

/**
 * Attributes
 * @enum {Number}
 */
ExFAT.ATTR = {
  READONLY: 0x01,
  HIDDEN: 0x02,
  SYSTEM: 0x04,
  VOLUME: 0x08,
  DIRECTORY: 0x10,
  ARCHIVE: 0x20,
}

/**
 * Directory entry types
 * @enum {Number}
 */
ExFAT.ENTRY = {
  OPTIONAL: 0x20,
  CONTINUED: 0x40,
  VALID: 0x80,
}

ExFAT.ENTRY.BITMAP = 0x01 | ExFAT.ENTRY.VALID
ExFAT.ENTRY.UPCASE = 0x02 | ExFAT.ENTRY.VALID
ExFAT.ENTRY.LABEL = 0x03 | ExFAT.ENTRY.VALID
ExFAT.ENTRY.FILE = 0x05 | ExFAT.ENTRY.VALID
ExFAT.ENTRY.FILE_INFO = 0x00 | ExFAT.ENTRY.CONTINUED | ExFAT.ENTRY.VALID
ExFAT.ENTRY.FILE_NAME = 0x01 | ExFAT.ENTRY.CONTINUED | ExFAT.ENTRY.VALID
ExFAT.ENTRY.FILE_TAIL = 0x00 | ExFAT.ENTRY.CONTINUED | ExFAT.ENTRY.OPTIONAL | ExFAT.ENTRY.VALID

/**
 * Check if we have a (potentially) valid directory entry at a given offset
 * @param {Buffer} buffer
 * @param {Number} offset
 * @returns {Boolean}
 */
ExFAT.isDirEntry = function( buffer, offset ) {
  return buffer[ offset ] == ExFAT.ENTRY.BITMAP ||
    buffer[ offset ] == ExFAT.ENTRY.UPCASE ||
    buffer[ offset ] == ExFAT.ENTRY.LABEL ||
    buffer[ offset ] == ExFAT.ENTRY.FILE ||
    buffer[ offset ] == ExFAT.ENTRY.FILE_INFO ||
    buffer[ offset ] == ExFAT.ENTRY.FILE_NAME
}

ExFAT.getClusterType = function( value ) {

  if( value === 0x00000000 ) {
    return ExFAT.CLUSTER.FREE
  } else if( value === 0x00000001 ) {
    return ExFAT.CLUSTER.INTERNAL
  } else if( value >= 0x00000002 && value <= 0xFFFFFFEF ) {
    return ExFAT.CLUSTER.DATA
  } else if( value >= 0xFFFFFFF0 && value <= 0xFFFFFFF5 ) {
    return ExFAT.CLUSTER.RESERVED
  } else if( value === 0xFFFFFFF6 ) {
    return ExFAT.CLUSTER.END
  } else if( value === 0xFFFFFFF7 ) {
    return ExFAT.CLUSTER.BAD
  } else if( value >= 0xFFFFFFF8 && value <= 0xFFFFFFFF ) {
    return ExFAT.CLUSTER.EOC
  }

  return ExFAT.CLUSTER.UNKNOWN

}

ExFAT.VBR = require( './vbr' )

ExFAT.UpCase = require( './upcase' )

ExFAT.DirEntry = require( './direntry' )
ExFAT.DirEntry.Bitmap = require( './direntry/bitmap' )
ExFAT.DirEntry.UpCase = require( './direntry/upcase' )
ExFAT.DirEntry.Label = require( './direntry/label' )
ExFAT.DirEntry.File = require( './direntry/file' )
ExFAT.DirEntry.FileInfo = require( './direntry/file-info' )
ExFAT.DirEntry.FileName = require( './direntry/file-name' )

ExFAT.AllocationTable = require( './table' )
ExFAT.Volume = require( './volume' )
ExFAT.API = require( './api' )
