(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ExFAT = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var ExFAT = require( '../exfat' )
var fs = require( 'fs' )
var path = require( 'path' ).posix

class Fs {
  
  constructor( volume ) {
    /** @type {ExFAT.Volume} Volume */
    this.volume = volume
    /** @type {Array<Object>} Task queue */
    this.queue = []
  }
  
  // fs.access(path[, mode], callback)
  // fs.appendFile(path, data[, options], callback)
  // fs.chmod(path, mode, callback)
  // fs.chown(path, uid, gid, callback)
  // fs.close(fd, callback)
  // fs.copyFile(src, dest[, flags], callback)
  // fs.createReadStream(path[, options])
  // fs.createWriteStream(path[, options])
  // fs.fchmod(fd, mode, callback)
  // fs.fchown(fd, uid, gid, callback)
  // fs.fdatasync(fd, callback)
  // fs.fstat(fd[, options], callback)
  // fs.fsync(fd, callback)
  // fs.ftruncate(fd[, len], callback)
  // fs.futimes(fd, atime, mtime, callback)
  // fs.lchmod(path, mode, callback)
  // fs.lchown(path, uid, gid, callback)
  // fs.link(existingPath, newPath, callback)
  // fs.lstat(path[, options], callback)
  // fs.mkdir(path[, options], callback)
  // fs.mkdtemp(prefix[, options], callback)
  // fs.open(path[, flags[, mode]], callback)
  // fs.read(fd, buffer, offset, length, position, callback)
  // fs.read(fd, [options,] callback)
  // fs.readlink(path[, options], callback)
  // fs.realpath(path[, options], callback)
  // fs.rename(oldPath, newPath, callback)
  // fs.rmdir(path[, options], callback)
  // fs.stat(path[, options], callback)
  // fs.symlink(target, path[, type], callback)
  // fs.truncate(path[, len], callback)
  // fs.unlink(path, callback)
  // fs.utimes(path, atime, mtime, callback)
  // fs.unwatchFile(filename[, listener])
  // fs.watchFile(filename[, options], listener)
  // fs.write(fd, buffer[, offset[, length[, position]]], callback)
  // fs.write(fd, string[, position[, encoding]], callback)
  // fs.writeFile(file, data[, options], callback)
  // fs.writev(fd, buffers[, position], callback)
  
  /**
   * Reads the contents of a directory
   * @param {String} path
   * @param {Object} [options]
   * @param {String} [options.encoding='utf8'] - Encoding of file names
   * @param {Function} callback - callback( error, entries )
   */
  readdir( path, options, callback ) {
    
    if( typeof options == 'function' )
      return this.readdir( path, null, callback )
    
    var error = new Error( 'ExFAT.fs.readdir() not implemented' )
    callback.call( this, error )
    
  }
  
  /**
   * Asynchronously read the entire contents of a file
   * @param {String} path
   * @param {Object} [options]
   * @param {String} [options.encoding=null]
   * @param {String} [options.flag='r']
   * @param {Function} callback - callback( error, data )
   */
  readFile( path, options, callback ) {
    
    if( typeof options == 'function' )
      return this.readFile( path, null, callback )
    
    var error = new Error( 'ExFAT.fs.readFile() not implemented' )
    callback.call( this, error )
    
  }
  
}

module.exports = Fs

},{"../exfat":10,"fs":15,"path":19}],2:[function(require,module,exports){
var async = module.exports

/**
 * @internal Run a series of asynchronous tasks
 * @param {Array<Function>} tasks
 * @param {Function} callback
 * @returns {undefined}
 */
async.series = function( tasks, callback ) {

  var tasks = tasks.slice()

  var run = ( error ) => {
    var task = tasks.shift()
    error || task == null ?
      callback( error ) :
      task( run )
  }

  run()

}

/**
 * @internal Run a task while a condition holds true
 * @param {Function} condition -> Boolean
 * @param {Function} fn
 * @param {Function} callback
 * @returns {undefined}
 */
async.whilst = ( condition, fn, callback ) => {

  var run = ( error ) => {
    if( !error && condition() ) {
      fn( run )
    } else {
      callback( error )
    }
  }

  run()

}

async.forEach = ( list, fn, callback ) => {

  var items = list.slice()

  var run = ( error ) => {
    var item = items.shift()
    error || item == null ?
      callback( error ) :
      fn( item, run )
  }

  run()

}

async.forEachParallel = ( list, fn, callback ) => {

  var count = list.length
  var errors = []
  var done = ( error ) => {
    if( error ) {
      errors.push( error )
    }
    count -= 1
    if( count == 0 ) {
      callback( errors )
    }
  }

  for( var i = 0; i < list.length; i++ ) {
    fn( list[i], done )
  }

}

async.parallel = ( tasks, callback ) => {

  var count = tasks.length
  var errors = []
  var done = ( error ) => {
    if( error ) {
      errors.push( error )
    }
    count -= 1
    if( count == 0 ) {
      callback( errors )
    }
  }

  for( var i = 0; i < tasks.length; i++ ) {
    tasks[i]( done )
  }

}

},{}],3:[function(require,module,exports){
(function (Buffer){
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

}).call(this,require("buffer").Buffer)
},{"../exfat":10,"buffer":16}],4:[function(require,module,exports){
(function (Buffer){
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

}).call(this,require("buffer").Buffer)
},{"../exfat":10,"buffer":16}],5:[function(require,module,exports){
(function (Buffer){
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

}).call(this,require("buffer").Buffer)
},{"../exfat":10,"buffer":16}],6:[function(require,module,exports){
(function (Buffer){
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

}).call(this,require("buffer").Buffer)
},{"../exfat":10,"buffer":16}],7:[function(require,module,exports){
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

},{"../exfat":10}],8:[function(require,module,exports){
(function (Buffer){
var ExFAT = require( '../exfat' )

class Label extends ExFAT.DirEntry {
  
  /**
   * Create a new Label
   * @returns {Label}
   * @constructor
   */
  constructor() {
    
    super()
    
    /** @type {ExFAT.ENTRY} Entry type */
    this.type = ExFAT.ENTRY.LABEL
    /** @type {Number} Length in characters */
    this.length = 0x00
    /** @type {String} Label */
    this.value = ''
    
  }
  
  /**
   * Read a Label from a buffer
   * @param {Label} [instance]
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {Label}
   */
  static read( instance, buffer, offset ) {
    
    if( Buffer.isBuffer( instance ) )
      return Label.read( new Label(), instance, buffer )
    
    instance = instance || new Label()
    offset = offset || 0
    
    instance.type = buffer.readUInt8( offset + 0 )
    instance.length = buffer.readUInt8( offset + 1 )
    instance.value = buffer.toString( 'utf16le', offset + 2, offset + 2 + Math.min( instance.length * 2, 30 ) )

    return instance
    
  }
  
  /**
   * Write a Label to a buffer
   * @param {Label} instance
   * @param {Buffer} [buffer]
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  static write( instance, buffer, offset ) {
    
    offset = offset || 0
    buffer = buffer || Buffer.alloc( ExFAT.DirEntry.SIZE + offset )
    
    offset = buffer.writeUInt8( instance.type, offset )
    offset = buffer.writeUInt8( instance.length, offset )
    
    buffer.fill( 0, offset, offset + 30 )
    
    offset += buffer.write( instance.value, offset, 30, 'utf16le' )

    return buffer
    
  }
  
}

module.exports = Label

}).call(this,require("buffer").Buffer)
},{"../exfat":10,"buffer":16}],9:[function(require,module,exports){
(function (Buffer){
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

}).call(this,require("buffer").Buffer)
},{"../exfat":10,"buffer":16}],10:[function(require,module,exports){
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

// ????
ExFAT.ENTRY_NAME_MAX = 15
ExFAT.UPCASE_CHARS = 0x10000
ExFAT.FLAG_ALWAYS1 = 1 << 0
ExFAT.FLAG_CONTIGUOUS = 1 << 1

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
ExFAT.ENTRY.FILE_INFO = 0x00 | ExFAT.ENTRY.VALID | ExFAT.ENTRY.CONTINUED
ExFAT.ENTRY.FILE_NAME = 0x01 | ExFAT.ENTRY.VALID | ExFAT.ENTRY.CONTINUED
ExFAT.ENTRY.FILE_TAIL = 0x00 | ExFAT.ENTRY.VALID | ExFAT.ENTRY.CONTINUED | ExFAT.ENTRY.OPTIONAL

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

},{"./api":1,"./direntry":7,"./direntry/bitmap":3,"./direntry/file":6,"./direntry/file-info":4,"./direntry/file-name":5,"./direntry/label":8,"./direntry/upcase":9,"./table":11,"./vbr":12,"./volume":13}],11:[function(require,module,exports){
var ExFAT = require( './exfat' )

class AllocationTable {
  
  constructor() {
    
    /** @type {Number} Address bits */
    this.bits = 32
    /** @type {Array<Buffer>} FAT buffers */
    this.buffers = []
    /** @type {Number} Allocation pointer (last allocated cluster number) */
    this.allocPointer = ExFAT.CLUSTER.START
    
  }
  
  read( clusterNumber, tableIndex = 0 ) {
    return this.buffers[ tableIndex ].readUInt32LE( clusterNumber * 4 )
  }
  
  write( clusterNumber, value, tableIndex = 0 ) {
    return this.buffers[ tableIndex ].writeUInt32LE( value, clusterNumber * 4 )
  }
  
  getUsage( tableIndex = 0 ) {
    
    tableIndex = tableIndex || 0

    var clusterCount = ( this.buffers[ tableIndex ].length / ( this.bits / 8 ) )
    var stats = { total: clusterCount, used: 0, bad: 0, free: 0 }

    for( var i = 0; i < clusterCount; i++ ) {
      let cluster = this.read( i, tableIndex )
      switch( cluster ) {
        case ExFAT.CLUSTER.FREE: stats.free++; break
        case ExFAT.CLUSTER.BAD: stats.bad++; break
        default: stats.used++; break
      }
    }

    return stats

  }
  
  getCluster( clusterNumber, tableIndex = 0 ) {
    var cluster = this.read( clusterNumber, tableIndex )
    return { number: clusterNumber, next: cluster }
  }
  
  getClusterChain( clusterNumber, tableIndex = 0 ) {
    
    var cluster = this.read( clusterNumber, tableIndex )
    var chain = [{ number: clusterNumber, next: cluster }]
    
    while( cluster <= ExFAT.CLUSTER.END ) {
      clusterNumber = cluster
      cluster = this.read( clusterNumber, tableIndex )
      chain.push({ number: clusterNumber, next: cluster })
    }
    
    return chain
    
  }
  
  allocCluster( tailCluster ) {
    
    // Number of usable clusters (minus two to skip reserved FAT ID and EOC clusters)
    var total = ( this.tables[0].length / ( this.bits / 8 ) ) - ExFAT.CLUSTER.START
    var cluster = ExFAT.CLUSTER.EOC
    var clusterNumber = 0
    
    for( var i = 0; i < total; i++ ) {
      
      clusterNumber = this.allocPointer
      cluster = this.read( this.allocPointer )
      
      // Advance the allocation pointer, wrapping around on overflow
      this.allocPointer = ( this.allocPointer + 1 ) % total
      
      if( cluster == ExFAT.CLUSTER.FREE ) {
        // Update tailCluster from EOC -> DATA
        this.write( tailCluster, clusterNumber )
        // Update new tail cluster from FREE -> EOC
        this.write( clusterNumber, ExFAT.CLUSTER.EOC )
        // We've successfully allocated a new cluster in the FAT
        return true
      }
      
    }
    
    return false
    
  }
  
  allocClusterChain( clusterCount, tableIndex = 0 ) {
    
    var chain = []
    
    for( var i = 0; i < clusterCount; i++ ) {
      // TODO
    }
    
  }
  
  freeClusterChain( clusterNumber, tableIndex = 0 ) {}
  
}

module.exports = AllocationTable

},{"./exfat":10}],12:[function(require,module,exports){
(function (Buffer){
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

}).call(this,require("buffer").Buffer)
},{"buffer":16}],13:[function(require,module,exports){
(function (Buffer){
var Emitter = require( 'events' )
var ExFAT = require( './exfat' )
var async = require( './async' )

class Volume extends Emitter {
  
  /**
   * Create a new ExFAT Volume
   * @param {Object} options
   * @param {Boolean} [options.readOnly=true]
   * @param {Number} [options.blockSize=512]
   * @param {Object} options.device
   * @param {Function} [options.device.open]
   * @param {Function} options.device.read
   * @param {Function} options.device.write
   * @param {Function} [options.device.close]
   * @returns {Volume}
   */
  constructor( options ) {
    
    super()
    
    if( options == null ) {
      throw new TypeError( 'ExFAT.Volume: Missing required options argument' )
    } else if( options.device == null ) {
      throw new TypeError( 'ExFAT.Volume: Missing required I/O device' )
    }
    
    /** @type {Object} Storage device */
    this.device = options.device
    
    /** @type {Number} Block (or sector) size */
    this.blockSize = options.blockSize || this.device.blockSize || 512
    /** @type {Boolean} Read only */
    this.readOnly = options.readOnly != null ?
      !!options.readOnly : true
    
    /** @type {Boolean} Whether the volume is in the process of mounting the filesystem */
    this.mounting = false
    /** @type {Boolean} Whether the volume is mounted */
    this.mounted = false
    /** @type {Boolean} Whether the volume is in the process of unmounting the filesystem */
    this.unmounting = false
    
    /** @type {ExFAT.VBR} Volume Boot Record */
    this.record = null
    /** @type {ExFAT.AllocationTable} Allocation table */
    this.table = null
    /** @type {ExFAT.FileSystem} [description] */
    this.fs = null
    
  }
  
  /**
   * Create a new ExFAT file system in this volume
   * @param {Object} options
   * @param {Function} callback ( error, info? )
   */
  format( options, callback ) {
    callback.call( this, new Error( 'ExFAT.Volume#format() not implemented' ) )
  }
  
  /**
   * Mount ExFAT file system
   * @param {Object} [options]
   * @param {Boolean} [options.readOnly=true]
   * @param {Number} [options.blockSize=512]
   * @param {Function} callback ( error )
   */
  mount( options, callback ) {
    
    if( typeof options == 'function' )
      return this.mount( null, options )
    
    this.mounting = true
    this.mounted = false
    
    async.series([
      // Read the Volume Boot Record
      ( next ) => {
        this.readVBR(( error, vbr ) => {
          this.vbr = vbr
          next( error )
        })
      },
      // Read the File Allocation Table(s)
      ( next ) => {
        this.readFAT( this.vbr.fatSectorStart, ( error, buffer ) => {
          if( error == null ) {
            this.table = new ExFAT.AllocationTable()
            this.table.buffers = [ buffer ]
          }
          next( error )
        })
      },
    ], ( error ) => {
      this.mounting = false
      this.mounted = error == null
      this.fs = new ExFAT.API( this )
      callback.call( this, error )
      this.emit( 'mount' )
    })
    
  }
  
  /**
   * Unmount the currently mounted ExFAT file system
   * @param {Object} [options]
   * @param {Function} callback ( error )
   */
  unmount( options, callback ) {
    
    if( typeof options == 'function' )
      return this.unmount( null, options )
    
    var error = new Error( 'ExFAT.Volume#unmount() not implemented' )
    return void callback.call( this, error )
    
    this.unmounting = true
    
    async.series([
      // - Wait for the filesystem API task queue to clear
      // - Flush VBR, FAT(s), Bitmaps, etc.
      // - Reset internal state
      ( next ) => {
        // Clear VBR
        this.record = null
        // Clear FATs
        this.table.buffers.length = 0
        this.table = null
        // Clear fs API queue
        this.queue.length = 0
        this.mounted = false
        next()
      },
    ], ( error ) => {
      this.mounted = false
      this.unmounting = false
      callback.call( this, error )
      this.emit( 'unmount' )
    })
    
  }
  
  /**
   * Read the Volume Boot Record
   * @param {Function} callback - callback( error, vbr )
   */
  readVBR( callback ) {
    
    var offset = 0
    var length = ExFAT.VBR.SIZE
    var buffer = Buffer.alloc( length )
    var posititon = 0
    
    this.device.read( buffer, offset, length, posititon, ( error, bytesRead, buffer ) => {
      if( error == null && bytesRead != length ) {
        error = new Error( `ExFAT.readVBR: Expected ${length} bytes, read returned ${bytesRead}` )
      }
      if( error ) return void callback.call( this, error, null )
      try { callback.call( this, null, ExFAT.VBR.read( buffer ) ) }
      catch( exception ) { callback.call( this, exception, null ) }
    })
    
  }
  
  /**
   * Write the Volume Boot Record to disk
   * @param {Function} callback - callback( error, bytesWritten, buffer )
   */
  writeVBR( callback ) {
    
    var buffer = this.vbr.write()
    var length = buffer.length
    var posititon = 0
    var offset = 0
    
    this.device.write( buffer, offset, length, posititon, ( error, bytesWritten, buffer ) => {
      if( error == null && bytesWritten != length ) {
        error = new Error( `ExFAT.writeVBR: Expected ${length} bytes, write returned ${bytesWritten}` )
      }
      callback.call( this, error, bytesWritten, buffer )
    })
    
  }
  
  /**
   * Read the file allocation table
   * @param {Nummber} lba - Logical block address
   * @param {Function} callback - callback( error, buffer )
   */
  readFAT( lba, callback ) {
    
    var offset = 0
    var length = this.vbr.fatSectorCount * this.blockSize
    var buffer = Buffer.alloc( length )
    var posititon = lba * this.blockSize
    
    this.device.read( buffer, offset, length, posititon, ( error, bytesRead, buffer ) => {
      if( error == null && bytesRead != length ) {
        error = new Error( `ExFAT.readFAT: Expected ${length} bytes, read returned ${bytesRead}` )
      }
      callback.call( this, error, buffer )
    })
    
  }
  
  /**
   * Write the File Allocation Table to disk at a given LBA
   * @param {Buffer} buffer - FAT
   * @param {Number} [lba=vbr.fatSectorStart] - Logical block address
   * @param {Function} callback - callback( error, bytesWritten, buffer )
   */
  writeFAT( buffer, lba, callback ) {
    
    lba = lba || this.vbr.fatSectorStart
    
    var length = this.vbr.fatSectorCount * this.blockSize
    var posititon = lba * this.blockSize
    var offset = 0
    
    this.device.write( buffer, offset, length, posititon, ( error, bytesRead, buffer ) => {
      if( error == null && bytesRead != length ) {
        error = new Error( `ExFAT.writeFAT: Expected ${length} bytes, write returned ${bytesRead}` )
      }
      callback.call( this, error, buffer )
    })
    
  }
  
  /**
   * Read a cluster into a buffer
   * @param {Number} clusterNumber
   * @param {Function} callback - callback( error, bytesRead, buffer )
   */
  readCluster( clusterNumber, buffer, offset, callback ) {
    
    // Size of a cluster in bytes
    var clusterSize = this.vbr.sectorsPerCluster * this.vbr.sectorSize
    // Where the data region begins, and the actual directory entries and files are stored
    var dataRegionOffset = this.vbr.clusterSectorStart * this.vbr.sectorSize
    
    if( buffer && buffer.length != clusterSize ) {
      throw new TypeError( `ExFAT.readCluster: Buffer must be at least ${clusterSize} bytes` )
    }
    
    var posititon = dataRegionOffset + (( clusterNumber - ExFAT.CLUSTER.DATA ) * clusterSize )
    var length = clusterSize
    
    buffer = buffer || Buffer.alloc( length )
    offset = offset || 0
    
    this.device.read( buffer, offset, length, posititon, ( error, bytesRead, buffer ) => {
      if( error == null && bytesRead != length ) {
        error = new Error( `ExFAT.readCluster: Expected ${length} bytes, read returned ${bytesRead}` )
      }
      callback.call( this, error, bytesRead, buffer )
    })
    
  }
  
  readClusterChain( clusterNumber, onCluster, callback ) {
    
    // The cluster chain we're about to read the directory entries from
    var clusters = this.table.getClusterChain( clusterNumber )
    // Size of a cluster in bytes
    var clusterSize = this.vbr.sectorsPerCluster * this.vbr.sectorSize
    
    var readNextCluster = ( error ) => {
      
      var cluster = clusters.shift()
      if( error || cluster == null ) {
        return void ( callback && callback.call( this, error ) )
      }
      
      this.readCluster( cluster.number, null, 0, ( error, bytesRead, buffer ) => {
        onCluster.call( this, bytesRead, buffer, readNextCluster )        
      })
      
    }
    
    readNextCluster()
    
  }
  
  /**
   * Read directory entries of a cluster chain
   * @param {Number} clusterNumber
   * @param {Function} callback - callback( error, dirEntries )
   */
  readDirEntries( clusterNumber, callback ) {
    
    // The cluster chain we're about to read the directory entries from
    var clusters = this.table.getClusterChain( clusterNumber )
    // Size of a cluster in bytes
    var clusterSize = this.vbr.sectorsPerCluster * this.vbr.sectorSize
    // Create a buffer to re-use for all cluster reads
    var buffer = Buffer.alloc( clusterSize )
    var offset = 0
    // List of read directory entries
    var dirEntries = []
    
    var readNextCluster = ( error ) => {
      
      var cluster = clusters.shift()
      
      if( error || cluster == null ) {
        return void callback.call( this, error, dirEntries )
      }
      
      // Read the cluster data
      this.readCluster( cluster.number, buffer, offset, ( error, bytesRead, buffer ) => {
        
        if( error ) return readNextCluster( error )
        
        // Parse directory entries from `buffer` and push them onto `entries`
        for( var offset = 0; offset < bytesRead; offset += ExFAT.DirEntry.SIZE ) {
          if( !ExFAT.isDirEntry( buffer, offset ) ) continue
          dirEntries.push( ExFAT.DirEntry.read( buffer, offset ) )
        }
        
        readNextCluster()
        
      })
      
    }
    
    readNextCluster()
    
  }
  
  /**
   * Read the UpCase table
   * @param {Number} clusterNumber - Cluster number
   * @param {Function} callback - callback( error, upcaseTable )
   */
  readUpCaseTable( clusterNumber, callback ) {
    
    this.readDirEntries( clusterNumber, ( error, dirEntries ) => {
      
      if( error ) return void callback.call( this, error )
      
      var upcase = dirEntries.find(( entry ) => entry.type == ExFAT.ENTRY.UPCASE )
      if( upcase == null ) {
        error = new Error( `ExFAT.readUpCaseTable: No UpCase table found` )
        return void callback.call( this, error )
      }
      
      var chunks = []
      
      this.readClusterChain( upcase.cluster, ( bytesRead, buffer, next ) => {
        chunks.push( buffer ); next()
      }, ( error ) => {
        var table = Buffer.concat( chunks, Number( upcase.size ) )
        callback.call( this, error, table )
      })
      
    })
    
  }
  
  /**
   * Read the cluster bitmap
   * @param {Number} clusterNumber - Cluster number
   * @param {Function} callback - callback( error, bitmap )
   */
  readBitmap( clusterNumber, callback ) {
    
    this.readDirEntries( clusterNumber, ( error, dirEntries ) => {
      
      if( error ) return void callback.call( this, error )
      
      var bitmap = dirEntries.find(( entry ) => entry.type == ExFAT.ENTRY.BITMAP )
      if( bitmap == null ) {
        error = new Error( `ExFAT.readBitmap: No cluster bitmap found` )
        return void callback.call( this, error )
      }
      
      var chunks = []
      
      this.readClusterChain( bitmap.cluster, ( bytesRead, buffer, next ) => {
        chunks.push( buffer ); next()
      }, ( error ) => {
        var buffer = Buffer.concat( chunks, Number( bitmap.size ) )
        callback.call( this, error, buffer )
      })
      
    })
    
  }
  
}

module.exports = Volume

}).call(this,require("buffer").Buffer)
},{"./async":2,"./exfat":10,"buffer":16,"events":17}],14:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],15:[function(require,module,exports){

},{}],16:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this,require("buffer").Buffer)
},{"base64-js":14,"buffer":16,"ieee754":18}],17:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],18:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],19:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":20}],20:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[10])(10)
});
