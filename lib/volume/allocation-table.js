/**
 * AllocationTable
 * @return {AllocationTable}
 */
function AllocationTable( volume ) {
  
  if( !(this instanceof AllocationTable) )
    return new AllocationTable( volume )
  
  this.volume = volume
  
  this.clusterCount = 0
  this.clusters = []
  
  Object.defineProperty( this, 'clusters', {
    enumerable: false
  })
  
}

/**
 * AllocationTable prototype
 * @type {Object}
 */
AllocationTable.prototype = {
  
  constructor: AllocationTable,
  
  parse: function( buffer ) {
    
    this.clusterCount = (
      this.volume.vbr.fatSectorCount *
      this.volume.partition.device.blockSize
    ) / 32
    
    this.clusters = []
    
    var offset = 0
    
    for( var i = 0; i < this.clusterCount; i++ ) {
      this.clusters.push( buffer.readUInt32LE( offset ) )
      offset += 32
    }
    
  },
  
}

// Exports
module.exports = AllocationTable
