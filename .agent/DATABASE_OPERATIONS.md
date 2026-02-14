# Database Operations Policy

**CRITICAL RULE**: Do not execute database operations directly. Instead, create SQL scripts for review and possible manual execution.

## Policy

For any changes involving database schema modifications or data manipulation (e.g., creating tables, adding columns, updating records in bulk), you must:

1.  **Draft a SQL Script**: Create a `.sql` file containing the necessary SQL commands.
2.  **Place in `server/sql/updates/`**: Save the script in the `server/sql/updates/` directory (or appropriate migration folder). Use a descriptive name (e.g., `update_feature_name.sql`).
3.  **Review Before Execution**: Present the SQL script to the user for review. Do not execute it automatically.
4.  **Wait for User Instruction**: Only proceed with executing the script if explicitly instructed by the user, or rely on the user to execute it manually.

This ensures all database changes are auditable and safe.
