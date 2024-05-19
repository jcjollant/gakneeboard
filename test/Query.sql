SELECT COUNT(*) FROM airports

SELECT COUNT(*) FROM airports WHERE version=5

# How many airports have not been upgraded
SELECT COUNT(*) FROM airports WHERE version<4

SELECT * FROM airports WHERE version<5


SELECT COUNT(*) as count, Code from Airports GROUP BY Code ORDER BY count DESC

SELECT * FROM feedback

DELETE FROM feedback WHERE Id in (33,38,40,41)

SELECT * FROM Airports WHERE Code='CLS'

SELECT * FROM Unknowns

SELECT count(*) FROM Unknowns

