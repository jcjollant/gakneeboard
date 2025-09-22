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
# Templates (sheets)
SELECT * FROM sheets

# Sheets from actual users
SELECT * FROM sheets WHERE user_id > 2

SELECT * FROM sheets WHERE id = 275


SELECT data,name,description FROM sheets WHERE id=0 AND user_id=1

# Count of JC templates
SELECT COUNT(*) FROM sheets WHERE user_Id=1

# Templates per user
SELECT COUNT(*) as count, user_id FROM sheets GROUP BY user_id ORDER BY count DESC

# Who are Sheet creators
SELECT COUNT(*) as count, user_id FROM sheets GROUP BY user_id ORDER BY count DESC

# Who are the biggest users
SELECT COUNT(*) as count, user_id FROM sheets WHERE user_id IS NOT NULL GROUP BY user_id ORDER BY count DESC

# Who are Sheet creators
SELECT COUNT(*) as count, user_id FROM sheets WHERE user_id IS NOT NULL AND user_id != 1 GROUP

# All sheets for JC with publication status
SELECT s.id,s.name,s.description,p.active,p.code as code FROM sheets AS s LEFT JOIN publications AS p ON s.id = p.sheetid WHERE user_id=1

# Which templates are saved the most
SELECT version, id, user_id FROM sheets ORDER BY version DESC

#########################################
# Publications
# Publications with user IDs
SELECT p.*, s.user_id FROM publications AS p LEFT JOIN sheets AS s ON p.sheetid = s.id where s.user_id IS NOT NULL

# Active Published templates
SELECT p.code, s.name, s.description FROM publications AS p LEFT JOIN sheets AS s on p.sheetid = s.id WHERE p.active AND s.user_id IS NOT NULL

# Publication count by user
SELECT COUNT(p.*), s.user_id FROM publications as p LEFT JOIN sheets as s ON p.sheetid = s.id  GROUP BY s.user_id ORDER BY count DESC

UPDATE publications SET active = TRUE WHERE sheetid = 275

SELECT * FROM publications WHERE sheetid = 275

#########
# Usage

# Biggest print users in the past 30 days
SELECT user_id, count(*) AS print_count FROM usage WHERE usage_type = 'print' and create_time > current_date - 30 GROUP BY user_id ORDER BY print_count DESC

# Most recent session for each user
SELECT user_id, MAX(create_time) FROM usage WHERE user_id NOTNULL AND usage_type = 'session' GROUP BY user_id ORDER BY "max" desc LIMIT 100 

# Most recent session for each user in the last 30 day
SELECT user_id, MAX(create_time) FROM usage WHERE user_id NOTNULL AND usage_type = 'session' AND create_time > current_date - 30 GROUP BY user_id ORDER BY "max" desc LIMIT 100 

# Active users in the last 30 days
SELECT user_id FROM usage WHERE user_id NOTNULL AND usage_type = 'session' AND create_time > current_date - 30 GROUP BY user_id 

# Most Active sim users in the last 90 days
SELECT user_id, count(*) AS c 
  FROM usage left join users ON usage.user_id = users.id 
  WHERE user_id NOTNULL AND usage.create_time > current_date - 90 AND users.account_type = 'sim' AND user_id <> 8 
  GROUP BY user_id 
  ORDER BY c desc

# Usage for a particular user in the past 90 days
SELECT user_id, usage_type, count(*) 
    FROM usage 
    WHERE user_id IN(189,46,187,192,21) AND create_time > current_date - 90 
    -- WHERE user_id IN(193,116,113,73,181) AND create_time > current_date - 90 
    GROUP BY user_id, usage_type 
    ORDER BY user_id

# Detailed information from that group
SELECT * 
    FROM users
    WHERE id IN(189,46,187,192,21)
    ORDER BY id

# Sheets for that user group
SELECT * 
    FROM sheets 
    WHERE user_id IN(190,116,113,73,181) 
    ORDER BY user_id

# Prints in the last 30 days
SELECT count(*) FROM usage WHERE usage_type = 'print' and create_time > current_date - 30 

SELECT users.id, COUNT(sheets.*) FROM users LEFT JOIN sheets ON sheets.user_id = users.id GROUP BY users.id ORDER BY COUNT DESC 
