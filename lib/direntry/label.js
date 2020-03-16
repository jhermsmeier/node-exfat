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
