# DB-4.5 — Sample Data Testing

## Goal
Insert and verify realistic study session data into the `sessions` table.

## Complete SQL Script

```sql
-- 1. Ensure required users exist using INSERT IGNORE
INSERT IGNORE INTO users (id, username, email, password, role, created_at) VALUES 
(1, 'alice_smith', 'alice@example.com', 'hashed_pwd_1', 'ROLE_USER', NOW()),
(2, 'bob_jones', 'bob@example.com', 'hashed_pwd_2', 'ROLE_USER', NOW()),
(3, 'charlie_brown', 'charlie@example.com', 'hashed_pwd_3', 'ROLE_USER', NOW());

-- Ensure required study_groups exist using INSERT IGNORE
INSERT IGNORE INTO study_groups (id, name, description, created_by, created_at) VALUES 
(1, 'Calculus 101 Study Group', 'Preparing for the final exam in Calculus 101', 1, NOW()),
(2, 'Java Programming Beginners', 'Learning Core Java concepts together', 2, NOW()),
(3, 'Database Systems Discussion', 'Discussing SQL and NoSQL databases', 3, NOW());

-- 2. & 3. Insert at least 10 realistic sessions
-- Provides different titles properly assigned to relevant valid group_ids and created_by.
-- Uses different dates (past and future).
INSERT INTO sessions (group_id, title, description, session_date, created_by, created_at) VALUES
-- Past sessions
(1, 'Math Revision', 'Reviewing limits and derivatives for midterms', DATE_SUB(NOW(), INTERVAL 5 DAY), 1, NOW()),
(2, 'Java Practice', 'Solving basic arrays and string problems in Java', DATE_SUB(NOW(), INTERVAL 3 DAY), 2, NOW()),
(3, 'DB Discussion', 'Discussing Normalization forms 1NF to 3NF', DATE_SUB(NOW(), INTERVAL 2 DAY), 3, NOW()),
(1, 'Calculus Midterm Prep', 'Solving previous year midterm question papers', DATE_SUB(NOW(), INTERVAL 1 DAY), 2, NOW()),

-- Future sessions
(1, 'Integration Techniques', 'Practicing Integration by parts and substitution', DATE_ADD(NOW(), INTERVAL 2 DAY), 1, NOW()),
(2, 'OOP Concepts in Java', 'Understanding Inheritance, Polymorphism, and Encapsulation', DATE_ADD(NOW(), INTERVAL 4 DAY), 2, NOW()),
(3, 'SQL Joins and Subqueries', 'Deep dive into complex SQL queries', DATE_ADD(NOW(), INTERVAL 5 DAY), 3, NOW()),
(1, 'Exam Prep', 'Comprehensive revision of entire Calculus syllabus', DATE_ADD(NOW(), INTERVAL 7 DAY), 1, NOW()),
(2, 'Java Collections Framework', 'Learning Lists, Sets, and Maps in Java', DATE_ADD(NOW(), INTERVAL 8 DAY), 3, NOW()),
(3, 'NoSQL vs REST APIs', 'Discussing MongoDB and how to integrate with REST APIs', DATE_ADD(NOW(), INTERVAL 10 DAY), 1, NOW());

-- 4. Verification queries

-- Query 1: Select all sessions
SELECT * FROM sessions;

-- Query 2: Future sessions ordered by date
SELECT * FROM sessions
WHERE session_date >= NOW()
ORDER BY session_date;

-- Query 3: Select all sessions for group_id 1
SELECT * FROM sessions
WHERE group_id = 1;
```

## Instructions to execute in MySQL Workbench

1. **Open MySQL Workbench** and connect to your local MySQL instance (e.g., `localhost:3306`).
2. **Select your database**: In the top toolbar, ensure your Study Group schema is selected (or run `USE study_group_db;` or whatever your database name is).
3. **Open a new SQL Tab**: Click on the `Create a new SQL tab for executing queries` icon (the small SQL file icon with a plus sign) located below the standard toolbar.
4. **Copy and Paste the Script**:
   * Copy the entire SQL script provided above starting from `-- 1. Ensure required users exist` down to the final query.
   * Paste it into the new query tab.
5. **Execute the Script**: 
   * To execute the whole script at once without stopping at errors (if any), click the **Lightning Bolt** icon (Execute). 
   * Alternatively, select individual parts of the script to run specifically the insertions first, then highlight and run the verification queries one by one.
6. **Verify Results**: The Verification queries (Queries 1, 2, and 3) will output their results at the bottom in the "Result Grid" tabs. Review the data to confirm it meets the requirements (past/future dates, proper titles, appropriate constraints). Because of `INSERT IGNORE`, missing parent keys in users or study_groups will securely bypass foreign-key violations while providing clean sample data execution.
