#########################################
# Airports table
SELECT * FROM airports

# How many airports are there
SELECT COUNT(*) FROM airports

SELECT COUNT(*) FROM airports WHERE version=5

# How many airports have not been upgraded
SELECT COUNT(*) FROM airports WHERE version<5

SELECT * FROM airports WHERE version<5

SELECT * FROM airports WHERE Code='RNT'

SELECT COUNT(*) as count, Code from Airports GROUP BY Code ORDER BY count DESC

# Test airport
SELECT * FROM airports WHERE Code='RNT'

# Test airport
SELECT * FROM airports WHERE Code='TEST'


#########################################
# Feedback table
SELECT * FROM feedback

DELETE FROM feedback WHERE Id in (56,57)

SELECT * FROM Airports WHERE Code='CLS'

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