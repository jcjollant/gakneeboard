#########################################
# uknowns
SELECT COUNT(*) FROM unknowns

SELECT * FROM unknowns


#########################################
# Airports table
SELECT * FROM airports

# How many airports are there
SELECT COUNT(*) FROM airports

SELECT COUNT(*) FROM airports WHERE version=6

SELECT COUNT(*) FROM airports WHERE version=7


# How many airports have not been upgraded
SELECT COUNT(*) FROM airports WHERE version<6

SELECT * FROM airports WHERE version=7

SELECT * FROM airports WHERE Code='JCJ'

SELECT * FROM airports WHERE Code='PAE'

SELECT * FROM airports WHERE Id=52

SELECT Data FROM Airports WHERE Code in('RNT') AND (creatorId = 1 OR creatorId IS NULL)

SELECT * FROM airports WHERE Code IN ('RNT','JFK') AND creatorId is NULL

# Custom airports fir JC
SELECT Data FROM Airports WHERE creatorId = 1

# Custom airports from anyone
SELECT 'code',creatorId FROM Airports WHERE creatorId IS NOT NULL

# Duplicates
SELECT COUNT(*) as count, Code from Airports WHERE creatorid IS NULL GROUP BY Code HAVING COUNT(*) > 1 ORDER BY count DESC 

# Test airport
SELECT * FROM airports WHERE Code='KRNT'

SELECT * FROM airports WHERE Code='KBFI'

# Test airport
SELECT * FROM airports WHERE Code='12S'

UPDATE airports SET data='{"code":"TEST","name":"Test Airport JC","elev":1000,"freq":[{"name":"CTAF","mhz":124.7},{"name":"TWR","mhz":null},{"name":"Weather","mhz":126.95},{"name":"GND","mhz":121.6}],"rwys":[{"name":"16-34","length":5400,"width":120,"ends":[null]}],"custom":false,"version":6,"effectiveDate":""}' , version=6 WHERE id=378

#########################################
# Feedback table
SELECT * FROM feedback

DELETE FROM feedback WHERE Id in (56,57)

SELECT * FROM Airports WHERE Code='INT'

#########################################
# Unknowns
SELECT * FROM Unknowns

SELECT * FROM Unknowns WHERE code='KJCJ'

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