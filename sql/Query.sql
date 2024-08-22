#########################################
# uknowns
SELECT COUNT(*) FROM unknowns

SELECT * FROM unknowns


SELECT * FROM unknowns where code='KBFF'

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

# Sheets from actual users
SELECT * FROM sheets WHERE user_id > 2

SELECT * FROM sheets WHERE id = 45

# Count of JC sheets
SELECT COUNT(*) FROM sheets WHERE user_Id=1

# Who are Sheet creators
SELECT COUNT(*) as count, user_id FROM sheets GROUP BY user_id ORDER BY count DESC

# Who are Sheet creators
SELECT COUNT(*) as count, user_id FROM sheets WHERE user_id IS NOT NULL GROUP BY user_id ORDER BY count DESC

# Who are Sheet creators
SELECT COUNT(*) as count, user_id FROM sheets WHERE user_id IS NOT NULL AND user_id != 1 GROUP

#########################################
# Publications

SELECT * FROM publications WHERE sheetid IS NOT NULL

# Who else than JC has published
SELECT COUNT(p.*), s.user_id FROM publications as p LEFT JOIN sheets as s ON p.sheetid = s.id  GROUP BY s.user_id ORDER BY count DESC

