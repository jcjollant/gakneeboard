SELECT COUNT(*) FROM airports

SELECT COUNT(*) FROM airports WHERE version=4

# How many airports have not been upgraded
SELECT COUNT(*) FROM airports WHERE version<4

SELECT * FROM airports WHERE version<4


SELECT COUNT(*) as count, Code from Airports GROUP BY Code ORDER BY count DESC

SELECT * FROM feedback

SELECT * FROM Airports WHERE Code='KCYS'

SELECT * FROM Unknowns