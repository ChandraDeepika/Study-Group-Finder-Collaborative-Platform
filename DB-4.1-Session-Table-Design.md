# Session Table Design

### Section 1 — Table Design Explanation

The `sessions` table is designed to store scheduled study sessions linked to specific study groups. 
* **Primary Key:** The `id` column uses `BIGINT AUTO_INCREMENT` to uniquely identify each session.
* **Foreign Keys:** 
  * `group_id` links the session to a specific study group. By using `ON DELETE CASCADE`, if a study group is deleted, all of its associated sessions are automatically cleaned up.
  * `created_by` links to the user who scheduled the session. Since the requirements specified that `created_by` must be `NOT NULL`, the constraint **must** use `ON DELETE CASCADE` (using `SET NULL` would throw an error because the column cannot accept null values). If the user deletes their account, their created sessions will also be removed.
* **Timestamps:** `session_date` records when the event occurs, and `created_at` automatically captures when the record was inserted into the database.

### Section 2 — MySQL CREATE TABLE Script

```sql
CREATE TABLE sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_date DATETIME NOT NULL,
    created_by BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_group_session (group_id),
    INDEX idx_date_session (session_date),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_sessions_group 
        FOREIGN KEY (group_id) 
        REFERENCES study_groups(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_sessions_creator 
        FOREIGN KEY (created_by) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);
```

### Section 3 — Index Strategy

1. **`INDEX idx_group_session (group_id)`**: Although MySQL automatically creates indexes for foreign keys, explicitly defining the index name ensures your schema is self-documenting. This index is crucial because the most common query will be fetching all scheduled sessions for a particular group.
2. **`INDEX idx_date_session (session_date)`**: This index optimizes time-based queries. When the platform needs to filter out past sessions or display chronological upcoming schedules (`WHERE session_date >= NOW() ORDER BY session_date ASC`), this index prevents the database from performing a full table scan.

### Section 4 — Example Queries

**1. Get all sessions for a specific group (ordered chronologically)**
```sql
SELECT id, title, description, session_date, created_by 
FROM sessions 
WHERE group_id = 1 
ORDER BY session_date ASC;
```

**2. Get upcoming sessions across the platform**
```sql
SELECT id, group_id, title, session_date 
FROM sessions 
WHERE session_date >= NOW() 
ORDER BY session_date ASC;
```

**3. Get upcoming sessions for a specific group (Practical combination)**
```sql
SELECT id, title, description, session_date 
FROM sessions 
WHERE group_id = 1 AND session_date >= NOW() 
ORDER BY session_date ASC;
```
