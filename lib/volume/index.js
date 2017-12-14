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
  
  if( !(this instanceof Volume) )
    return new Volume( partition )
  
  this.partition = partition
  
  this.vbr = new Volume.BootRecord()
  this.allocTable = new Volume.AllocationTable( this )
  this.root = new ExFAT.Node()
  
  // Node compatible fs API
  // this.fs = new ExFAT.FileSystem( this )
  
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
  
  get clusterSize() {
    return this.sectorSize << this.vbr.spcBits
  },
  
  readVBR: function( lba, callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    debug( 'read_vbr' )
    
    this.partition.readBlocks( lba, lba + 1, null,
      function( error, buffer, bytesRead ) {
        if( error != null ) { return done( error ) }
        try { self.vbr.parse( buffer ) }
        catch( err ) { error = err }
        done( error )
      }
    )
    
  },
  
  readAllocTable: function( callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    var from = this.vbr.fatSectorStart
    var to = from + this.vbr.fatSectorCount
    
    debug( 'read_alloc_table', from, to )
    
    this.partition.readBlocks( from, to, function( error, buffer, bytesRead ) {
      if( error ) return done( error )
      var expected = ( self.vbr.fatSectorCount * self.partition.device.blockSize )
      if( bytesRead !== expected ) {
        debug( 'read_alloc_table', `read ${bytesRead}, expected ${expected}` )
        return done( new FSError( FSError.EIO, `Bytes read mismatch (read ${bytesRead}, expected ${expected})` ) )
      }
      self.allocTable.parse( buffer )
      debug( 'read_alloc_table', self.allocTable )
      done()
    })
    
  },
  
  readCluster: function( cluster, callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    // TODO: Cluster -> Sector number translation (necessary?)
    var from = this.vbr.clusterSectorStart + cluster
    var to = from + ( this.clusterSize / this.sectorSize )
    
    debug( 'read_cluster', from, to )
    
    this.partition.readBlocks( from, to, function( error, buffer, bytesRead ) {
      if( error ) return done( error )
      done( error, buffer )
    })
    
  },
  
  readRootDir: function( callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    this.root.startCluster = this.vbr.rootDirCluster
    this.root.fptrCluster = this.root.startCluster
    this.root.name = '\0'
    this.root.size = 0
    
    var clusters = 0
    var maxClusters = this.vbr.clusterCount
    var rootCluster = this.vbr.rootDirCluster
    
    debug( 'read_root_dir', rootCluster )
    
    this.readdir( this.vbr.clusterSectorStart, function( error, buffer ) {
      if( error ) return done( error )
      // hex( buffer.slice( 0, 512 ) )
      done()
    })
    
    // if( this.root.size === 0 ) {
    //   return done( new FSError( FSError.EIO, 'Invalid root directory size' ) )
    // }
    
    // TODO
    // done()
    
  },
  
  readdir: function( cluster, callback ) {
    
    debug( 'readdir', cluster )
    
    this.readCluster( this.vbr.clusterSectorStart + cluster, function( error, buffer ) {
      
      if( error ) {
        return callback( error )
      }
      
      // var cluster = this.vbr.clusterSectorStart
      var offset = 0
      var contiguous = false // ?!
      var continuations = 0
      
      var chunk, entry
      var entries = []
      
      while( offset < this.clusterSize ) {
        
        entry = null
        chunk = buffer.slice( offset, offset += 32 )
        try { entry = ExFAT.Entry.parse( chunk ) }
        catch( e ) { console.log( e.message ) }
        entry && entries.push( entry )
        
      }
      
      this.root.entries = entries
      
      callback( error, entries )
      
    })
    
  },
  
  mount: function( callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    // TODO: Callback hell avoidance maneuver
    this.readVBR( 0, function( error ) {
      if( error ) return done( error )
      this.readAllocTable( function( error ) {
        if( error ) return done( error )
        this.readRootDir( function( error ) {
          if( error ) return done( error )
          // this.readdir( 12345678, function( error ) {
          //   if( error ) return done( error )
          //   done()
          // })
          done()
        })
      })
    })
    
  },
  
}

// Exports
module.exports = Volume
