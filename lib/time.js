var ExFAT = require( './exfat' )
var time = module.exports

time.getDate = function( date, time, cs ) {
  
  var date = new Date()
  var value = ExFAT.EPOCH
  
  throw new Error( 'ExFAT.time.getDate() not implemented' )
  
  // if( date != null ) value += date
  // if( time != null ) value += time
  // if( cs != null ) value += cs
  
  date.setTime( value )
  
  return date
  
}
