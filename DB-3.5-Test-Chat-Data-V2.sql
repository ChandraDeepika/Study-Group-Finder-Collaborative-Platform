-- =====================================================================================
-- DB-3.5 — Test Chat Data (V2)
-- Description: Safely populates the `chat_messages` table and fulfills all constraints
-- Tables: `users`, `courses`, `study_groups`, `chat_messages`
-- =====================================================================================

USE study_group_db;

-- -------------------------------------------------------------------------------------
-- 1. Check and Insert Users
-- (INSERT IGNORE safely adds them if ID doesn't exist, avoiding duplicates)
-- -------------------------------------------------------------------------------------
INSERT IGNORE INTO users (id, email, name, password) VALUES 
(1, 'alice@example.com', 'Alice', 'pass123'),
(2, 'bob@example.com', 'Bob', 'pass123'),
(3, 'charlie@example.com', 'Charlie', 'pass123');

-- -------------------------------------------------------------------------------------
-- 2. Ensure Required Foreign Keys for Study Group
-- A study group requires a course (`course_id`) and a creator (`created_by`)
-- -------------------------------------------------------------------------------------
INSERT IGNORE INTO courses (id, course_code, course_name, description) VALUES
(1, 'DB101', 'Database Systems', 'Intro to Databases');

-- -------------------------------------------------------------------------------------
-- 3. Check and Insert Study Group
-- -------------------------------------------------------------------------------------
INSERT IGNORE INTO study_groups (id, name, description, privacy, course_id, created_by, created_at) VALUES 
(1, 'Database Study Group', 'Study group for Database Systems', 'PUBLIC', 1, 1, CURRENT_TIMESTAMP);

-- -------------------------------------------------------------------------------------
-- 4. Clean up any existing test chat messages for this group to prevent duplicates
-- -------------------------------------------------------------------------------------
DELETE FROM chat_messages WHERE group_id = 1;

-- -------------------------------------------------------------------------------------
-- 5. Insert Chat Messages
-- (At least 10 sample messages simulating a real conversation)
-- -------------------------------------------------------------------------------------
INSERT INTO chat_messages (group_id, sender_id, message_text, created_at) VALUES 
(1, 1, 'Hey everyone! Are we meeting up for the database assignment tonight?', '2026-03-11 10:00:00.000'),
(1, 2, 'Hey Alice! Yes, I was planning on starting around 7 PM. Does that work?', '2026-03-11 10:05:15.000'),
(1, 1, '7 PM is perfect. Are we using the Zoom link from last week?', '2026-03-11 10:08:22.000'),
(1, 3, 'Hey guys! Mind if I join you? I am struggling with the query section.', '2026-03-11 10:15:45.000'),
(1, 2, 'Of course Charlie. We can go over the SQL queries first if you want.', '2026-03-11 10:18:10.000'),
(1, 3, 'That would be awesome. I tried making a LEFT JOIN but it returns a lot of nulls.', '2026-03-11 10:20:05.000'),
(1, 1, 'I found a really good tutorial on that. I will share my screen tonight.', '2026-03-11 10:25:30.000'),
(1, 2, 'Great! Did anyone figure out the indexing part for performance?', '2026-03-11 11:00:12.000'),
(1, 1, 'Yes, I added composite indexes, I can show you how.', '2026-03-11 11:05:40.000'),
(1, 3, 'Can you push your code to the feature branch so I can take a look?', '2026-03-11 11:10:22.000'),
(1, 1, 'Already pushed! Check `feature/database-indexes`.', '2026-03-11 11:12:05.000'),
(1, 2, 'Awesome, checking it out now.', '2026-03-11 11:15:30.000'),
(1, 3, 'Thanks Alice, your queries are really clean!', '2026-03-11 11:30:15.000'),
(1, 1, 'No problem! See you both at 7 PM!', '2026-03-11 11:35:00.000'),
(1, 2, 'See you later!', '2026-03-11 11:40:20.000');

-- -------------------------------------------------------------------------------------
-- 6. Verification Queries
-- -------------------------------------------------------------------------------------

-- Query A: Check if messages were inserted successfully
SELECT * FROM chat_messages;

-- Query B: Retrieve messages for a specific group, ordered by newest first
SELECT message_id, sender_id, message_text
FROM chat_messages
WHERE group_id = 1
ORDER BY created_at DESC;
