var ExFAT = require( './exfat' )

/**
 * Node
 * @return {Node}
 */
function Node( options ) {
  
  if( !(this instanceof Node) )
    return new Node( options )
  
  options = options || {}
  
  this.parent = options.parent
  this.child = options.child
  this.next = options.next
  this.prev = options.prev
  
  // NOTE: Internal use for ref counting by exfat.c (?)
  this.references = 0
  
  this.fptrIndex = 0x00000000
  this.fptrCluser = 0x00000000
  this.entryCluster = 0x00000000
  this.entryOffset = 0x0000000000000000
  
  this.flags = 0x00000000 // int (bits?)
  
  this.size = 0x0000000000000000
  this.mtime = 0x00000000
  this.atime = 0x00000000
  
  this.name = Buffer.alloc( ExFAT.NAME_MAX + 1 )
  
}

/**
 * Node prototype
 * @type {Object}
 */
Node.prototype = {
  
  constructor: Node,
  
}

// Exports
module.exports = Node
