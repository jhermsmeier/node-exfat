var Entry = require( './index' )

/**
 * Label
 * @return {Label}
 */
function Label() {
  
  if( !(this instanceof Label) )
    return new Label()
  
  this.type = Entry.LABEL
  this.length = 0x00
  this.name = ''
  
}

/**
 * Label prototype
 * @type {Object}
 */
Label.prototype = {
  
  constructor: Label,
  
  parse: function( buffer ) {
    
    this.type = buffer[ 0 ]
    this.length = buffer[ 1 ]
    this.name = buffer.toString( 'utf16le', 0x02 )
      .replace( /^\u0000+|\u0000+$/, '' )
    
    return this
    
  },
  
  toBuffer: function() {
    throw new Error( 'Not implemented' )
  }
  
}

// Exports
module.exports = Label
