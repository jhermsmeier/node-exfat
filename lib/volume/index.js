var FSError = require( '../error' )
var ExFAT = require( '../exfat' )

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
  
  readVBR: function( lba, callback ) {
    
    var self = this
    var done = callback.bind( this )
    
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
    
    this.partition.readBlocks( from, to, function( error, buffer, bytesRead ) {
      if( error ) return done( error )
      if( bytesRead !== ( self.vbr.fatSectorCount * self.partition.device.blockSize ) )
        return done( new FSError( FSError.EIO ), 'Bytes read mismatch' )
      self.allocTable.parse( buffer )
      done()
    })
    
  },
  
  readCluster: function( cluster, callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    // TODO: Cluster -> Sector number translation (necessary?)
    var from = this.vbr.fatSectorStart + cluster
    var to = from + 1
    
    this.partition.readBlocks( from, to, function( error, buffer, bytesRead ) {
      if( error ) return done( error )
      done( null, buffer )
    })
    
  },
  
  mount: function( callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    this.readVBR( 0, function( error ) {
      if( error ) return done( error )
      this.readAllocTable( function( error ) {
        if( error ) return done( error )
        done()
      })
    })
    
  },
  
}

// Exports
module.exports = Volume
