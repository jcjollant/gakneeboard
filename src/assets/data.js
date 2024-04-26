export let airports = {
    '21w' :{'airportCode':'21W',  'airportName':'Ranger Creek',    'elev':2650,'tpa':3700, 'weather':{'freq':'-.-','type':'n/a'},          'traffic':{'freq':'122.900','type':'CTAF'},'rwy':[{'name':'15-33',  'length':2875,'surface':{'type':'ASPH','condition':'FAIR'},'15':{'orientation':145,'pattern':'left'},'33':{'orientation':325,'pattern':'left'}}]},
    'kawo':{'airportCode':'KAWO', 'airportName':'Arlington Muni',  'elev':142, 'tpa':1100, 'weather':{'freq':'135.625','type':'AWOS-3PT'}, 'traffic':{'freq':'122.725','type':'CTAF'},'rwy':[{'name':'11-29',  'length':3498,'surface':{'type':'ASPH','condition':'EXCELLENT'},'11':{'orientation':110,'pattern':'right'},'29':{'orientation':290,'pattern':'left'}},{'name':'16-34',  'length':5332,'surface':{'type':'ASPH','condition':'EXCELLENT'},'16':{'orientation':162,'pattern':'right'},'34':{'orientation':343,'pattern':'left'}}]},
    'kbfi':{'airportCode':'KBFI', 'airportName':'Boeing Fld',      'elev':22,  'tpa':1000, 'weather':{'freq':'127.750','type':'ATIS'},     'traffic':{'freq':'118.300','type':'TWR'}, 'rwy':[{'name':'14L-32R','length':3709,'surface':{'type':'ASPH','condition':'FAIR'},'freq':'118.300','14L':{'orientation':135,'pattern':'left'},'32R':{'orientation':315,'pattern':'right'}},{'name':'14R-32L','length':10007,'surface':{'type':'ASPH','condition':'GOOD'},'freq':'120.6','14R':{'orientation':135,'pattern':'right'},'32L':{'orientation':315,'pattern':'left'}}]},
    'kbvs':{'airportCode':'KBVS', 'airportName':'Skagit Rgnl',     'elev':145, 'tpa':1100, 'weather':{'freq':'121.125','type':'AWOS-3'},   'traffic':{'freq':'123.075','type':'CTAF'},'rwy':[{'name':'11-29',  'length':5480,'surface':{'type':'ASPH','condition':'EXCELLENT'},'11':{'orientation':110,'pattern':'left'},'29':{'orientation':290,'pattern':'left'}},{'name':'04-22','length':3000,'surface':{'type':'ASPH','condition':'POOR'},'04':{'orientation':40,'pattern':'left'},'22':{'orientation':220,'pattern':'left'}}]},
    'keln':{'airportCode':'KELN', 'airportName':'Bowers Fld',      'elev':1763,'tpa':2800, 'weather':{'freq':'118.375','type':'ASOS'},     'traffic':{'freq':'123.000','type':'CTAF'},'rwy':[{'name':'11-29',  'length':4300,'surface':{'type':'CONC','condition':'GOOD'},'11':{'orientation':117,'pattern':'left'},'29':{'orientation':297,'pattern':'left'}}]},
    'kesw':{'airportCode':'KESW', 'airportName':'Easton State',    'elev':2226,'tpa':3200, 'weather':{'freq':'135.275','type':'ASOS'},     'traffic':{'freq':'122.900','type':'CTAF'},'rwy':[{'name':'09-27',  'length':2640,'surface':{'type':'TURF','condition':'GOOD'},'09':{'orientation':98,'pattern':'left'},'27':{'orientation':278,'pattern':'left'}}]},
    'kpae':{'airportCode':'KPAE', 'airportName':'Paine Fld Intl',  'elev':607, 'tpa':1600, 'weather':{'freq':'128.650','type':'ATIS'},     'traffic':{'freq':'120.200','type':'TWR'}, 'rwy':[{'name':'16L-34R','length':3004,'surface':{'type':'ASPH','condition':'GOOD'},'16L':{'orientation':164,'pattern':'left'},'34R':{'orientation':344,'pattern':'right'}},{'name':'16R-34L','length':9010, 'surface':{'type':'ASPH','condition':'GOOD'},'freq':'132.195','16R':{'orientation':163,'pattern':'right'},'34L':{'orientation':343,'pattern':'left'}}]},
    'kplu':{'airportCode':'KPLU', 'airportName':'Pierce Country',  'elev':537, 'tpa':1500, 'weather':{'freq':'128.575','type':'AWOS-3'},   'traffic':{'freq':'122.700','type':'CTAF'},'rwy':[{'name':'17-35',  'length':3651,'surface':{'type':'ASPH','condition':'GOOD'},'17':{'orientation':165,'pattern':'left'},'35':{'orientation':345,'pattern':'left'}}]},
    'krnt':{'airportCode':'KRNT', 'airportName':'Renton Muni',     'elev':32,  'tpa':1000, 'weather':{'freq':'126.950','type':'ATIS'},     'traffic':{'freq':'124.700','type':'TWR'}, 'rwy':[{'name':'16-34',  'length':5382,'surface':{'type':'ASPH','condition':'GOOD'},'16':{'orientation':159,'pattern':'left'},'34':{'orientation':339,'pattern':'right'}}]},
    's36' :{'airportCode':'S36',  'airportName':'Norman Grier Fld','elev':472, 'tpa':1500, 'weather':{'freq':'-.-','type':'n/a'},          'traffic':{'freq':'123.000','type':'CTAF'},'rwy':[{'name':'15-33',  'length':3288,'surface':{'type':'ASPH','condition':'GOOD'},'15':{'orientation':150,'pattern':'left'},'33':{'orientation':330,'pattern':'left'}}]},
    's43' :{'airportCode':'S43',  'airportName':'Harvey Fld',      'elev':23,  'tpa':1000, 'weather':{'freq':'-.-','type':'n/a'},          'traffic':{'freq':'123.000','type':'CTAF'},'rwy':[{'name':'15L-33R','length':2672,'surface':{'type':'ASPH','condition':'EXCELLENT'},'15L':{'orientation':150,'pattern':'right'},'33R':{'orientation':330,'pattern':'left'}},{'name':'15R-33L','length':2430,'surface':{'type':'TURF','condition':'EXCELLENT'},'15R':{'orientation':150,'pattern':'right'},'33L':{'orientation':330,'pattern':'left'}}]},
    's50' :{'airportCode':'S50',  'airportName':'Auburn Muni',     'elev':63,  'tpa':1100, 'weather':{'freq':'128.000','type':'PTT3'},     'traffic':{'freq':'122.975','type':'CTAF'},'rwy':[{'name':'16-34',  'length':3842,'surface':{'type':'ASPH','condition':'GOOD'},'16':{'orientation':160,'pattern':'right'},'34':{'orientation':340,'pattern':'left'}}]},
  }

  var testCount = 0;
function testKeyInSource(key, source, code) {
  testCount++;
  if( !(key in source)) console.log( key +' missing from ' + JSON.stringify[source] + ' at ' + code);

}
function testRunway(rwy, rwys, code) {
  testKeyInSource(rwy, rwys, code);
  // test this runway has an orientation and pattern
  testKeyInSource('orientation', rwys[rwy], code);
  testKeyInSource('pattern', rwys[rwy], code);
  const pattern = rwys[rwy]['pattern'];
  if( pattern != 'left' && pattern != 'right') console.log('pattern value ' + pattern + ' is invalid for runway ' + rwy + ' at ' + code)
}
export function validate() {
  testCount = 0;
  Object.keys(airports).forEach((code)=>{
    // console.log('validating ' + code);
    // we want all the essential fields
    testKeyInSource('airportCode', airports[code], code);
    testKeyInSource('airportName', airports[code], code);
    testKeyInSource('elev', airports[code], code);
    testKeyInSource('tpa', airports[code], code);
    testKeyInSource('weather', airports[code], code);
    testKeyInSource('traffic', airports[code], code);
    testKeyInSource('rwy', airports[code], code);
    // traffic pattern consistency
    if( airports[code].tpa - airports[code].elev > 1100) console.log('traffic pattern is too high at ' + code);
    if( airports[code].tpa - airports[code].elev < 900) console.log('traffic pattern is too low at ' + code);
    // test weather has a frequency and a type
    testKeyInSource('freq', airports[code].weather, code);
    testKeyInSource('type', airports[code].weather, code);
    // test trafic has a frequency and a type
    testKeyInSource('freq', airports[code].traffic, code);
    testKeyInSource('type', airports[code].traffic, code);
    // test runways are all showing up
    airports[code].rwy.forEach((rwys)=>{
      testKeyInSource('name', rwys, code);
      testKeyInSource('length', rwys, code);
      testKeyInSource('surface', rwys, code);
      testKeyInSource('type', rwys['surface'], code);
      testKeyInSource('condition', rwys['surface'], code);
      var [rwyA,rwyB] = rwys.name.split('-');
      // test each runway has an entry
      testRunway(rwyA, rwys, code);
      testRunway(rwyB, rwys, code);
    })
  })
  console.log('Airport data validation complete ' + testCount)
}

