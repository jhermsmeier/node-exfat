var ExFAT = require( './exfat' )
var Time = module.exports

Time.DIFF = ExFAT.EPOCH.getTime() - new Date( 0 ).getTime()

Time.toUnix = function( date, time, centisec ) {
  
  var time = Time.DIFF
  
  var day = date & 0x1F
  var month = date >> 5 & 0x0F
  var year = date >> 9
  
  var hour = time >> 11
  var min = time >> 5 & 0x3F
  // 2 sec granularity
  var sec = ( time & 0x1F ) * 2
  // Convert centiseconds to ms
  var ms = centisec * 100
  
  // NOTE: exFAT stores times in local time
  // TODO: Correction to UTC needed
  // NOTE: What the fuck happens, when crossing time zones?!
  return new Date( day, month, year, hour, min, sec, ms )
  
}

Time.toExfat = function( time ) {}
