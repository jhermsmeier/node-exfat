/**
 * AllocationTable
 * @constructor
 * @memberOf FAT32.Volume
 * @returns {AllocationTable}
 */
function AllocationTable() {

  if( !(this instanceof AllocationTable) ) {
    return new AllocationTable()
  }

  /** @type {Number} FAT bits */
  this.bits = 32
  /** @type {Array<Buffer>} FAT buffers */
  this.tables = []
  // TODO: Parse endianness marker (first cluster in FAT),
  // and act accordingly

}

function Cluster( value ) {
  var shift = 28 // 32 - 4
  this.type = Cluster.getType( value )
  this.flags = value >>> shift
  this.next = value & (( 1 << shift ) - 1 )
}

Cluster.getType = function( value ) {

  value = value & 0x0FFFFFFF

  if( value === 0x00000000 ) {
    return 'FREE'
  } else if( value === 0x00000001 ) {
    return 'INTERNAL'
  } else if( value >= 0x00000002 && value <= 0x0FFFFFEF ) {
    return 'DATA'
  } else if( value >= 0x0FFFFFF0 && value <= 0x0FFFFFF5 ) {
    return 'RESERVED_CONTEXT'
  } else if( value === 0x0FFFFFF6 ) {
    return 'RESERVED'
  } else if( value === 0x0FFFFFF7 ) {
    return 'BAD'
  } else if( value >= 0x0FFFFFF8 && value <= 0x0FFFFFFF ) {
    return 'EOC'
  } else {
    return 'UNKNOWN'
  }

}

/**
 * AllocationTable prototype
 * @ignore
 */
AllocationTable.prototype = {

  constructor: AllocationTable,

  get fatIds() {
    return this.tables.map(( fat, i ) => {
      return this.read( 0, i )
    })
  },

  get eocs() {
    return this.tables.map(( fat, i ) => {
      return this.read( 1, i )
    })
  },

  /**
   * Get a FAT.Cluster for a given cluster number
   * @param {Number} clusterNumber
   * @param {Number} tableIndex
   * @return {FAT.Cluster} cluster
   */
  getCluster( clusterNumber, tableIndex ) {
    var value = this.read( clusterNumber, tableIndex )
    return new Cluster( value )
  },

  /**
   * Get a cluster chain from a given cluster
   * @param {Number} clusterNumber
   * @param {Number} tableIndex
   * @returns {Array<FAT.Chain>} clusterChain
   */
  getClusterChain( clusterNumber, tableIndex ) {

    var cluster = this.getCluster( clusterNumber, tableIndex )
    var chain = [ cluster ]

    while( cluster.type === 'DATA' ) {
      cluster = this.getCluster( cluster.next, tableIndex )
      chain.push( cluster )
    }

    return chain

  },

  /**
   * Read a cluster value from a table
   * @param {Number} position - Cluster number to read
   * @param {Number} tableIndex - Table to read from
   * @returns {Number} value
   */
  read( position, tableIndex ) {

    tableIndex = tableIndex || 0

    var offset = position * this.bits / 8
    var value = this.tables[tableIndex].readUIntLE( offset, this.bits / 8 )

    return value

  },

  /**
   * Write a cluster value to a table
   * @param {Number} value - Cluster value
   * @param {Number} position - Cluster number to read
   * @param {Number} tableIndex - Table to read from
   * @returns {Number} value
   */
  write( value, position, tableIndex ) {

    tableIndex = tableIndex || 0

    throw new Error( 'Not implemented' )

  }

}

// Exports
module.exports = AllocationTable
