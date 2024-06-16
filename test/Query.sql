#########################################
# Airports table
SELECT * FROM airports

# How many airports are there
SELECT COUNT(*) FROM airports

SELECT COUNT(*) FROM airports WHERE version=5

# How many airports have not been upgraded
SELECT COUNT(*) FROM airports WHERE version<5

SELECT * FROM airports WHERE version<5

SELECT * FROM airports WHERE Code='JCJ'

SELECT Data FROM Airports WHERE Code in('RNT') AND (creatorId = 1 OR creatorId IS NULL)

SELECT * FROM airports WHERE Code IN ('RNT','JFK') AND creatorId is NULL

SELECT Data FROM Airports WHERE creatorId = 1

# Duplicates
SELECT COUNT(*) as count, Code from Airports GROUP BY Code ORDER BY count DESC 

# Test airport
SELECT * FROM airports WHERE Code='KRNT'

# Test airport
SELECT * FROM airports WHERE Code='TEST'

UPDATE airports SET data='{"code":"TEST","name":"Test Airport JC","elev":1000,"freq":[{"name":"CTAF","mhz":124.7},{"name":"TWR","mhz":null},{"name":"Weather","mhz":126.95},{"name":"GND","mhz":121.6}],"rwys":[{"name":"16-34","length":5400,"width":120,"ends":[null]}],"custom":false,"version":6,"effectiveDate":""}' , version=6 WHERE id=378

#########################################
# Feedback table
SELECT * FROM feedback

DELETE FROM feedback WHERE Id in (56,57)

SELECT * FROM Airports WHERE Code='INT'

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

###
# 
INSERT INTO health_checks (data,failures) VALUES ("TEST",1)