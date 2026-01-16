Airports data is stored in 'airports' tables
Airport version indicate the data model version number.
When an airport is requested and its version is outdated, data is sanitized to the latest version.
Codes that are already unknown use the special version number -1, thereby creating a list of know unknowns
