var { context, test } = require( '@jhermsmeier/control' )
var assert = require( 'assert' )
var UpCaseTable = require( '../lib/upcase' )

context( 'ExFAT.UpCase', function() {

  // See https://docs.microsoft.com/en-gb/windows/win32/fileio/exfat-specification#7251-recommended-up-case-table
  test( 'checksum', function() {
    var actual = UpCaseTable.checksum( UpCaseTable.DATA )
    var expected = 0xE619D30D
    assert.strictEqual( actual, expected )
  })

})
