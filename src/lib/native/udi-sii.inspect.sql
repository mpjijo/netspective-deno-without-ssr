/*markdown
This file is most useful when opened as SQL Notebook (`cmoog.sqlnotebook` VS Code extension) for SQLite databases such as `udi-sii/udi-sii-prime.sqlite.db`. It is designed for inspecting and exploring structures and trying out SQL before integrating into code.
*/

-- list all tables
SELECT name 
  FROM sqlite_schema 
 WHERE type ='table' AND name NOT LIKE 'sqlite_%';

-- list columns in table
PRAGMA table_info("financial_paypal_activity_sales_monthly");