-- DB-3.5 Test Chat Data
-- Goal: Insert sample chat messages and verify that chat history queries work correctly.
-- Database: MySQL

-- =========================================================================================
-- Step 1: (Optional) Insert Sample Users and a Group if they don't already exist
-- =========================================================================================
-- Assuming table names are `User` and `Group` as per DB designs.
-- You may skip this step if your database is already populated with valid users and groups.
-- Note: Replace with actual table names and columns if hibernate generated different names.

INSERT IGNORE INTO `User` (user_id, email, first_name, last_name, password) VALUES 
(1, 'alice@example.com', 'Alice', 'Smith', 'pass123'),
(2, 'bob@example.com', 'Bob', 'Jones', 'pass123'),
(3, 'charlie@example.com', 'Charlie', 'Brown', 'pass123');

INSERT IGNORE INTO `Group` (group_id, group_name, description, tags) VALUES 
(1, 'CS101 Web Development', 'Study group for Intro to Web Dev', 'Frontend, Node.js');


-- =========================================================================================
-- Step 2: Insert 10-15 Sample Messages for the Group
-- =========================================================================================
-- Using User IDs and Group ID created above. (Alice=1, Bob=2, Charlie=3 and Group=1)
-- IMPORTANT: If you skipped Step 1, please adjust `group_id` and `sender_id` below
-- to match existing records in your database to comply with foreign key constraints.

INSERT INTO `chat_messages` (group_id, sender_id, message_text, created_at) VALUES 
(1, 1, 'Hey everyone! Are we meeting up for the frontend assignment tonight?', '2026-03-11 10:00:00.000'),
(1, 2, 'Hey Alice! Yes, I was planning on starting around 7 PM. Does that work?', '2026-03-11 10:05:15.000'),
(1, 1, '7 PM is perfect. Are we using the Zoom link from last week?', '2026-03-11 10:08:22.000'),
(1, 3, 'Hey guys! Mind if I join you? I am struggling with the CSS grid section.', '2026-03-11 10:15:45.000'),
(1, 2, 'Of course Charlie. We can go over CSS grid first if you want.', '2026-03-11 10:18:10.000'),
(1, 3, 'That would be awesome. I tried making a 3-column layout but it breaks on mobile.', '2026-03-11 10:20:05.000'),
(1, 1, 'I found a really good tutorial on that. I will share my screen tonight.', '2026-03-11 10:25:30.000'),
(1, 2, 'Great! Did anyone figure out the JavaScript part for the form validation?', '2026-03-11 11:00:12.000'),
(1, 1, 'Yes, I used standard HTML5 pattern validation plus a small JS script.', '2026-03-11 11:05:40.000'),
(1, 3, 'Can you push your code to the feature branch so I can take a look?', '2026-03-11 11:10:22.000'),
(1, 1, 'Already pushed! Check `feature/form-validation`.', '2026-03-11 11:12:05.000'),
(1, 2, 'Awesome, checking it out now.', '2026-03-11 11:15:30.000'),
(1, 3, 'Thanks Alice, your code is really clean!', '2026-03-11 11:30:15.000'),
(1, 1, 'No problem! See you both at 7 PM!', '2026-03-11 11:35:00.000'),
(1, 2, 'See you later!', '2026-03-11 11:40:20.000');


-- =========================================================================================
-- Step 3: Verification Queries
-- =========================================================================================

-- Query 1: Retrieve the latest messages for a group
-- Fetching the recent messages for the study group we just populated
SELECT m.message_id, u.first_name, m.message_text, m.created_at 
FROM chat_messages m
JOIN `User` u ON m.sender_id = u.user_id
WHERE m.group_id = 1 
ORDER BY m.created_at DESC 
LIMIT 50;

-- Query 2: Retrieve messages after a specific timestamp
-- Simulating fetching new messages since the last poll (e.g. after 11:00 AM)
SELECT message_id, sender_id, message_text, created_at 
FROM chat_messages 
WHERE group_id = 1 AND created_at > '2026-03-11 11:00:00.000' 
ORDER BY created_at ASC;

-- Query 3: Retrieve messages sent by a specific user
-- Fetching all messages sent by Alice (sender_id = 1)
SELECT message_id, group_id, message_text, created_at 
FROM chat_messages 
WHERE sender_id = 1 
ORDER BY created_at DESC;
