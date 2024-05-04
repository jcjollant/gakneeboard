const gapi = require( '../datasource/gapi')

test('Airport codes from Id',() =>{
    let [c1,i1] = gapi.getAirportCodes(null)
    expect(c1).toBe(null)
    expect(i1).toBe(null)

    let [c2,i2] = gapi.getAirportCodes('rnt')
    expect(c2).toBe('RNT')
    expect(i2).toBe('KRNT')

    // case should not be sensitive
    let [c4,i4] = gapi.getAirportCodes('RNT')
    expect(c4).toBe('RNT')
    expect(i4).toBe('KRNT')

    let [c3,i3] = gapi.getAirportCodes('Krnt')
    expect(c3).toBe('RNT')
    expect(i3).toBe('KRNT')
})
