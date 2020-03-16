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
    this.vbr = null
    /** @type {ExFAT.AllocationTable} Allocation table */
    this.fat = null
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
            this.fat = new ExFAT.AllocationTable()
            this.fat.buffers = [ buffer ]
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
    
    this.unmounting = true
    
    async.series([
      // - TODO: Wait for the filesystem API task queue to clear
      // - TODO: Flush VBR, FAT(s), Bitmaps, etc.
      // Reset internal state
      ( next ) => {
        // Clear VBR
        this.vbr = null
        // Clear FATs
        this.fat.buffers.length = 0
        this.fat = null
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
    var clusters = this.fat.getClusterChain( clusterNumber )
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
    var clusters = this.fat.getClusterChain( clusterNumber )
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
