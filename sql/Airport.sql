#########################################
# Airports table

#--------------------------------------------------------
# All Airports
SELECT * FROM airports

# How many airports are there
SELECT COUNT(*) FROM airports

#--------------------------------------------------------
# Known Unknowns
SELECT * FROM airports WHERE version=-1

# Count of known unknowns
SELECT COUNT(*) FROM airports WHERE version=-1

SELECT COUNT(*) FROM airports WHERE data ISNULL

#--------------------------------------------------------
# Obsolete data 
# Count outdated by model?
SELECT COUNT(*) FROM airports WHERE version<9

# Show version distribution
SELECT version, COUNT(*) FROM airports GROUP BY version ORDER BY version DESC

# How many are current?
SELECT COUNT(*) FROM airports WHERE version=9

# Select one airport obsolete by model
SELECT * FROM airports WHERE version<9 AND data NOTNULL ORDER BY RANDOM() LIMIT 1

SELECT * FROM airports WHERE version=7 AND NOT (data LIKE '%ASOS%' OR data LIKE '%AWOS%' OR data LIKE '%ATIS%' OR DATA LIKE '%"code":"?"%')

SELECT * FROM airports WHERE DATA LIKE '%"code":"?"%'

DELETE FROM airports WHERE DATA LIKE '%"code":"?"%'


SELECT COUNT(*) FROM airports where data like '%"code":"?"%'

SELECT * FROM airports WHERE Code ='KXX'

SELECT * FROM airports WHERE Code = ANY (ARRAY['JC','PAE','JCJ'])

SELECT * FROM airports WHERE Id=52

SELECT Data FROM Airports WHERE Code in('RNT') AND (creatorId = 1 OR creatorId IS NULL)

SELECT * FROM airports WHERE Code IN ('RNT','JFK') AND creatorId is NULL

DELETE FROM airports WHERE Code IN ('RNT','JFK') AND creatorId is NULL AND id > 200

# Custom airports fir JC
SELECT Data FROM Airports WHERE creatorId = 1

# Custom airports from anyone
SELECT 'code',creatorId FROM Airports WHERE creatorId IS NOT NULL

# Duplicates
SELECT COUNT(*) as count, Code from Airports WHERE creatorid IS NULL GROUP BY Code HAVING COUNT(*) > 1 ORDER BY count DESC 

SELECT * FROM airports where code = 'TEST'