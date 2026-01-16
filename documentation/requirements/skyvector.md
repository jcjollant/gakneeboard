# SkyVector as a data source
## Problem Statement
We are currently limited to US airports due to our unique datasource. User around the world are not able to use the app

## Skyvector as a Datasource
Skyvector is a popular website which shows structured airport information. We will use this information to extend our reach. 

## Requirements
When we are resolving an airport with an ICAO code that is not available in ADIP, we should invoke a service named SkyvectorService to fetch its data.
This data is available in HTML format at an URL we can resolve with a search query as described in the example below.
Once this HTML page is fetched, we should parse its content and record the airport data in the 'airports' table with a 'skyvector' source
If this airport search is not known by skyvector (see unsuccessful search below), we should mark this airport as unknonw in the database

## Implementation directions
SkyVector service should implement AirportDataSource. Airport Service should identify SkyVector as the service when Adip is not a good fit but the code is 4 characters long.

## Examples
### Successful skyvector search output
The example below shows the initial search query for airport code SUDU and the resulting 301 which contains the HTML location of interest
Note the returned Location shows 'airport/SUDU'

% wget -S  https://skyvector.com/api/airportSearch\?query=SUDU

--2025-12-19 12:12:49--  https://skyvector.com/api/airportSearch?query=SUDU
Resolving skyvector.com (skyvector.com)... 64.246.161.213
Connecting to skyvector.com (skyvector.com)|64.246.161.213|:443... connected.
HTTP request sent, awaiting response... 
  HTTP/1.1 301 Moved Permanently
  Date: Fri, 19 Dec 2025 20:12:50 GMT
  Content-Length: 0
  Connection: keep-alive
  Server: Apache
  Vary: Accept-Encoding
  Location: /airport/SUDU/Durazno-Santa-Bernardina-International-Airport
  Strict-Transport-Security: max-age=15552000
Location: /airport/SUDU/Durazno-Santa-Bernardina-International-Airport [following]
--2025-12-19 12:12:50--  https://skyvector.com/airport/SUDU/Durazno-Santa-Bernardina-International-Airport
Reusing existing connection to skyvector.com:443.
HTTP request sent, awaiting response... 
  HTTP/1.1 200 OK
  Date: Fri, 19 Dec 2025 20:12:50 GMT
  Content-Type: text/html; charset=utf-8
  Transfer-Encoding: chunked
  Connection: keep-alive
  Server: Apache
  Content-Language: en
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Link: </airport/SUDU/Durazno-Santa-Bernardina-International-Airport>; rel="canonical",</node/54047>; rel="shortlink"
  Cache-Control: public, max-age=600
  Expires: Sun, 19 Nov 1978 05:00:00 GMT
  Etag: "1766175170-0"
  Last-Modified: Fri, 19 Dec 2025 20:12:50 GMT
  Vary: Cookie,Accept-Encoding
  Strict-Transport-Security: max-age=15552000
  X-Frame-Options: SAMEORIGIN
Length: unspecified [text/html]

### Unsuccessful search for airport FXXX
Note the returned Location shows 'search/site'

% wget -S  https://skyvector.com/api/airportSearch\?query=FXXX

--2025-12-19 15:40:20--  https://skyvector.com/api/airportSearch?query=FXXX
Resolving skyvector.com (skyvector.com)... 64.246.161.213
Connecting to skyvector.com (skyvector.com)|64.246.161.213|:443... connected.
HTTP request sent, awaiting response... 
  HTTP/1.1 301 Moved Permanently
  Date: Fri, 19 Dec 2025 23:40:21 GMT
  Content-Length: 0
  Connection: keep-alive
  Server: Apache
  Vary: Accept-Encoding
  Location: /search/site/FXXX
  Strict-Transport-Security: max-age=15552000
Location: /search/site/FXXX [following]
--2025-12-19 15:40:21--  https://skyvector.com/search/site/FXXX
Reusing existing connection to skyvector.com:443.
HTTP request sent, awaiting response... 
  HTTP/1.1 200 OK
  Date: Fri, 19 Dec 2025 23:40:21 GMT
  Content-Type: text/html; charset=utf-8
  Transfer-Encoding: chunked
  Connection: keep-alive
  Server: Apache
  Content-Language: en
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=600
  Expires: Sun, 19 Nov 1978 05:00:00 GMT
  Etag: "1766187621-0"
  Last-Modified: Fri, 19 Dec 2025 23:40:21 GMT
  Vary: Cookie,Accept-Encoding
  Strict-Transport-Security: max-age=15552000
  X-Frame-Options: SAMEORIGIN
Length: unspecified [text/html]