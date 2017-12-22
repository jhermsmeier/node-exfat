var FSError = require( '../error' )
var ExFAT = require( '../exfat' )
var debug = require( 'debug' )( 'exfat:volume' )

/**
 * ExFAT Volume
 * @constructor
 * @param {Object} partition
 * @return {Volume}
 */
function Volume( partition ) {
  
  if( !(this instanceof Volume) ) {
    return new Volume( partition )
  }
  
  this.partition = partition
  
  this.vbr = new Volume.BootRecord()
  this.allocTable = new Volume.AllocationTable()
  this.root = new ExFAT.Node()
  
  // Node compatible fs API
  this.fs = new ExFAT.FileSystem( this )
  
}

/**
 * Volume Boot Record (VBR)
 * @type {Function}
 */
Volume.BootRecord = require( './boot-record' )

Volume.AllocationTable = require( './allocation-table' )

/**
 * Volume prototype
 * @type {Object}
 */
Volume.prototype = {
  
  constructor: Volume,
  
  get sectorSize() {
    return 1 << this.vbr.sectorBits
  },
  
  get sectorsPerCluster() {
    return 1 << this.vbr.spcBits
  },
  
  get clusterSize() {
    return this.sectorSize * this.sectorsPerCluster
  },
  
  readVBR( lba, callback ) {
    
    debug( 'read_vbr' )
    
    this.partition.readBlocks( lba, lba + 1, null, ( error, buffer, bytesRead ) => {
      
      if( error != null ) {
        return callback.call( this, error )
      }
      
      try {
        this.vbr.parse( buffer )
      } catch( err ) {
        error = err
      }
      
      callback.call( this, error )
      
    })
    
  },
  
  readAllocTable( callback ) {
    
    var done = callback.bind( this )
    
    var from = this.vbr.fatSectorStart
    var to = from + this.vbr.fatSectorCount
    
    debug( 'read_alloc_table', from, to )
    
    this.partition.readBlocks( from, to, ( error, buffer, bytesRead ) => {
      if( error ) return callback.call( this, error )
      var expected = ( this.vbr.fatSectorCount * this.partition.device.blockSize )
      if( bytesRead !== expected ) {
        debug( 'read_alloc_table', `read ${bytesRead}, expected ${expected}` )
        return callback.call( this, new FSError( FSError.EIO, `Bytes read mismatch (read ${bytesRead}, expected ${expected})` ) )
      }
      this.allocTable.tables.push( buffer )
      debug( 'read_alloc_table' )
      callback.call( this )
    })
    
  },
  
  readCluster( cluster, callback ) {
    
    debug( 'read_cluster', cluster )
    
    var fatCluster = this.allocTable.getCluster( cluster )
    
    debug( 'read_cluster', fatCluster )
    
    // TODO: Substraction of 2 from the cluster number because of
    // the Endianess Marker and EOC Marker should transparently happen elsewhere
    var from = this.vbr.clusterSectorStart + ( (cluster - 2) * this.sectorsPerCluster )
    var to = from + this.sectorsPerCluster
    
    debug( 'read_cluster', from, to )
    
    this.partition.readBlocks( from, to, ( error, buffer, bytesRead ) => {
      callback.call( this, error, buffer )
    })
    
  },
  
  readRootDir( callback ) {
    
    // TODO: Get rid of these inode concept objects
    this.root.startCluster = this.vbr.rootDirCluster
    this.root.fptrCluster = this.root.startCluster
    this.root.name = '\0'
    this.root.size = 0
    
    debug( 'read_root_dir', this.vbr.rootDirCluster )
    
    this.readdir( this.vbr.rootDirCluster, ( error, entries ) => {
      if( error ) return callback.call( this, error )
      this.root.entries = entries
      callback.call( this )
    })
    
  },
  
  readdir( cluster, callback ) {
    
    debug( 'readdir', cluster )
    
    this.readCluster( cluster, function( error, buffer ) {
      
      if( error ) {
        return callback.call( this, error )
      }
      
      var offset = 0
      var contiguous = false // ?!
      var continuations = 0
      
      var chunk, entry
      var entries = []
      
      while( offset < buffer.length ) {
        
        entry = null
        chunk = buffer.slice( offset, offset += 32 )
        
        try {
          entry = ExFAT.Entry.parse( chunk )
        } catch( e ) {
          error = e
          break
        }
        
        entry && entries.push( entry )
        
      }
      
      callback.call( this, error, entries )
      
    })
    
  },
  
  mount( callback ) {
    
    var tasks = [
      ( next ) => this.readVBR( 0, next ),
      ( next ) => this.readAllocTable( next ),
      ( next ) => this.readRootDir( next )
    ]
    
    var run = ( error ) => {
      var task = tasks.shift()
      if( error || task == null ) {
        return callback.call( this, error )
      }
      task( run )
    }
    
    run()
    
  },
  
}

// Exports
module.exports = Volume
