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
