# DB-3.1 — Chat Message Table Design

### Section 1 — Table Design Explanation
* **`message_id` (BIGINT AUTO_INCREMENT)**: Used as the Primary Key. `BIGINT` is recommended over `INT` for chat messages, as real-time messaging tables can grow rapidly. `AUTO_INCREMENT` ensures efficient, sequential inserts optimizing MySQL's clustered index.
* **`group_id` (BIGINT)**: Foreign key linking to the `Group` table. Must be `NOT NULL` to associate every message with a specific study group.
* **`sender_id` (BIGINT)**: Foreign key linking to the `User` table to identify who sent the message. Must be `NOT NULL`.
* **`message_text` (TEXT)**: Used instead of `VARCHAR(255)` to accommodate long messages, links, code snippets, or study notes without rigid length restrictions.
* **`created_at` (DATETIME(3))**: Using `DATETIME(3)` captures **millisecond precision**. In a real-time WebSocket chat room, multiple users might send messages in the exact same second, so milliseconds guarantee absolute chronological sorting.

**Constraints:**
* **Foreign Keys**: Enforces referential integrity to `Group` and `User`.
* **ON DELETE CASCADE**: For a student project, using `CASCADE` is practical. If a study group is deleted or a user account is removed, their associated chat messages are efficiently and automatically cleaned up, preventing orphan records.

---

### Section 2 — MySQL CREATE TABLE Script
```sql
CREATE TABLE chat_messages (
    message_id BIGINT AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message_text TEXT NOT NULL,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    
    PRIMARY KEY (message_id),
    
    CONSTRAINT fk_chat_group 
        FOREIGN KEY (group_id) 
        REFERENCES `Group` (group_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_chat_sender 
        FOREIGN KEY (sender_id) 
        REFERENCES `User` (user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Section 3 — Index Strategy
Chat systems are heavily read-optimized for specific patterns. **Composite Indexes** drastically improve group history retrieval dynamically.

```sql
-- Index 1: Optimized for loading a group's chat history and scrolling back in time
CREATE INDEX idx_group_time ON chat_messages (group_id, created_at DESC);

-- Index 2: Optimized for viewing all messages sent by an individual user
CREATE INDEX idx_sender_time ON chat_messages (sender_id, created_at DESC);
```

---

### Section 4 — Example Queries

**1. Fetch the latest 50 messages of a group**
```sql
SELECT message_id, sender_id, message_text, created_at 
FROM chat_messages 
WHERE group_id = 123 
ORDER BY created_at DESC 
LIMIT 50;
```

**2. Fetch messages after a given timestamp**
```sql
SELECT message_id, sender_id, message_text, created_at 
FROM chat_messages 
WHERE group_id = 123 
  AND created_at > '2026-03-09 22:45:00.000'
ORDER BY created_at ASC;
```

**3. Fetch messages sent by a specific user**
```sql
SELECT message_id, group_id, message_text, created_at 
FROM chat_messages 
WHERE sender_id = 456 
ORDER BY created_at DESC
LIMIT 50;
```

**4. Join messages with the User table to show sender name**
```sql
SELECT 
    m.message_id, 
    m.message_text, 
    m.created_at, 
    u.user_id, 
    u.first_name, 
    u.last_name
FROM chat_messages m
INNER JOIN `User` u ON m.sender_id = u.user_id
WHERE m.group_id = 123
ORDER BY m.created_at DESC
LIMIT 50;
```

---

### Section 5 — Simple Scalability Considerations
Although MySQL works well for the current project size, the system can be scaled in the future using the following approaches:

1. **Efficient Indexing**
   Indexes on `group_id` and `created_at` allow MySQL to quickly retrieve recent messages for a specific study group, ensuring fast chat history loading even as the table grows.
2. **Table Partitioning**
   If the `chat_messages` table grows very large, time-based partitioning (for example by month using `created_at`) can improve query performance and make it easier to archive older messages.
3. **Read–Write Separation**
   In high-traffic systems, write operations such as message inserts can be handled by a primary database while read queries for chat history can be served by replica databases.
4. **Optional Caching**
   Frequently accessed chat messages can be temporarily cached using an in-memory system like Redis to reduce database load and improve response time.
