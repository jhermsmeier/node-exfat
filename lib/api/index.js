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
