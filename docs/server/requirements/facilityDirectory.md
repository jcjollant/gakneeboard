Aeronav publishes a facility directory also know as chart supplement.
For example for BLI, the API call looks like this
URL: https://adip.faa.gov/agisServices/public-api/getAirportChartSupplementData
Payload: {"locId":"BLI"}
Response: {
    "airportName": "BELLINGHAM INTL",
    "city": "BELLINGHAM",
    "locId": "BLI",
    "cycle": "22JAN2026",
    "chartName": "nw_222_22JAN2026.pdf"
}
Which means the PDF can be found at https://aeronav.faa.gov/afd/22JAN2026/nw_222_22JAN2026.pdf

Sometimes, the AFD can contain notices and/or two pages of content, for example for SEA
Response:{
    "airportName": "SEATTLE?TACOMA INTL",
    "city": "SEATTLE",
    "locId": "SEA",
    "cycle": "22JAN2026",
    "chartName": "nw_270_22JAN2026.pdf,nw_SEA_notices_22JAN2026.pdf"
}
Example of a Two pages PDF:
https://aeronav.faa.gov/afd/22JAN2026/nw_270_22JAN2026.pdf

We want users to be able to access this PDF content from the app.

## Implementation directions
1. Airport mode should be updated to include the facility directory information. Airport model version should be set to 16
2. Fetch facility directory information in the Airport object when airport data is fecthed from Adip
    getAirportChartSupplement should be called to get the facility directory information.

Create a new method in Charts to getAeronavFacilityDirectory(cycle: string, fileName: string): Promise<Buffer>
This API should fetch the PDF from aeronav and return its content as a buffer.

Create a new API endpoint to get the facility directory for a given airport code.
