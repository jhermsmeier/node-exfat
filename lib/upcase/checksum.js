/**
 * Calculate an UpCase table checksum of a buffer
 * @param {Buffer} buffer
 * @returns {Number}
 */
function checksum( buffer ) {
  
  var sum = 0
  
  for( var i = 0; i < buffer.length; i++ ) {
    // Checksum = ((Checksum&1) ? 0x80000000 : 0) + (Checksum>>1) + (UInt32)Table[Index];
    sum = ( sum & 1 ? 0x80000000 : 0 ) + ( sum >>> 1 ) + ( buffer[i] | 0 )
  }
  
  return sum
  
}

module.exports = checksum
