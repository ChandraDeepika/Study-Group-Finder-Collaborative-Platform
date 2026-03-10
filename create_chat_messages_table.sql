CREATE TABLE chat_messages (
    message_id BIGINT AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message_text TEXT NOT NULL,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    
    PRIMARY KEY (message_id),
    
    CONSTRAINT fk_chat_group 
        FOREIGN KEY (group_id) 
        REFERENCES `study_groups` (id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_chat_sender 
        FOREIGN KEY (sender_id) 
        REFERENCES `users` (id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index 1: Optimized for loading a group's chat history and scrolling back in time
CREATE INDEX idx_group_time ON chat_messages (group_id, created_at DESC);

-- Index 2: Optimized for viewing all messages sent by an individual user
CREATE INDEX idx_sender_time ON chat_messages (sender_id, created_at DESC);
