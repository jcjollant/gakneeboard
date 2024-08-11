#########################################
# uknowns
SELECT COUNT(*) FROM unknowns

SELECT * FROM unknowns


SELECT * FROM unknowns where code='KBFF'

#########################################
# Airports table
SELECT * FROM airports

# How many airports are there
SELECT COUNT(*) FROM airports

# Known Unknowns
SELECT * FROM airports WHERE version=-1

# Count of known unknowns
SELECT COUNT(*) FROM airports WHERE version=-1

SELECT COUNT(*) FROM airports WHERE version<6

SELECT COUNT(*) FROM airports WHERE version=6

SELECT COUNT(*) FROM airports WHERE version=7


SELECT * FROM airports WHERE version=7 AND NOT (data LIKE '%ASOS%' OR data LIKE '%AWOS%' OR data LIKE '%ATIS%' OR DATA LIKE '%"code":"?"%')

SELECT * FROM airports WHERE DATA LIKE '%"code":"?"%'

DELETE FROM airports WHERE DATA LIKE '%"code":"?"%'


SELECT COUNT(*) FROM airports where data like '%"code":"?"%'

SELECT * FROM airports WHERE Code='JC'

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

# Test airport
SELECT * FROM airports WHERE Code='KBFF'

SELECT * FROM airports WHERE Code in ('KDZJ','KRZR','KDNN')


SELECT * FROM airports WHERE Code='KCDW'

# Test airport
SELECT * FROM airports WHERE Code='12S'

SELECT * FROM airports WHERE Code='TEST' AND creatorid=1

SELECT * FROM airports WHERE Code='TEST' and (creatorid=1 or creatorid IS NULL) ORDER BY creatorid

UPDATE airports SET data='{"code":"TEST","name":"Test Airport JC","elev":1000,"freq":[{"name":"CTAF","mhz":124.7},{"name":"TWR","mhz":null},{"name":"Weather","mhz":126.95},{"name":"GND","mhz":121.6}],"rwys":[{"name":"16-34","length":5400,"width":120,"ends":[null]}],"custom":false,"version":6,"effectiveDate":""}' , version=7 WHERE id=378

#########################################
# Feedback table

# Count feedbacks
SELECT COUNT(*) FROM feedback

# Show all feedbacks
SELECT * FROM feedback

#########################################
# Unknowns TODO : TRUNCATE
SELECT * FROM Unknowns

SELECT count(*) FROM Unknowns

#########################################
# Users table
SELECT COUNT(*) FROM Users

SELECT * FROM Users

# Particular user : JC
SELECT * FROM Users WHERE sha256 = 'bfaa2eb49bf63f41c05a016e03653fe2d7f8bf196ba6fb3f3340d3dcd7016770'
# Anne-Sophie
SELECT * FROM Users WHERE sha256 = 'f731afac9fc850681158ed35a3e289d577770c104fe063c26b4cef4b1af22444'

SELECT COUNT(*) FROM custom_airports

#########################################
# Table health_checks
SELECT * FROM health_checks

INSERT INTO health_checks (data,failures) VALUES ("TEST",1)

#########################################
# Sheets Pages
SELECT * FROM sheets

# Count of JC sheets
SELECT COUNT(*) FROM sheets WHERE user_Id=1

#########################################
# Publications

SELECT * FROM publications WHERE sheetid IS NOT NULL
