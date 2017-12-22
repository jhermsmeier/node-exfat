var ExFAT = require( './exfat' )
var debug = require( 'debug' )( 'exfat:time' )
var Time = module.exports

Time.DIFF = ExFAT.EPOCH.getTime() - new Date( 0 ).getTime()

Time.toUnix = function( date, time, centisec ) {
  
  time = time || 0
  date = date || 0

  var hours   = ( time & 0xF800 ) >>> 11
  var minutes = ( time & 0x07E0 ) >>> 5
  var seconds = (( time & 0x001F ) >>> 0 ) * 2

  var year  = (( date & 0xFE00 ) >>> 9 ) + 1980
  var month = ( date & 0x01E0 ) >>> 5
  var day   = ( date & 0x001F ) >>> 0

  return Date.UTC(
    year, month - 1, day,
    hours, minutes, seconds,
    centisec ? centisec * 10 : 0
  )
  
}

Time.toExfat = function( time ) {
  throw new Error( 'Not implemented' )
}
