USE ihcae_alumni;

-- 1. Clear existing Forum Data
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM ForumPosts;
DELETE FROM DiscussionTopics;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Reset Auto-Increment
ALTER TABLE ForumPosts AUTO_INCREMENT = 1;
ALTER TABLE DiscussionTopics AUTO_INCREMENT = 1;

-- 3. Get the Admin User ID
SET @admin_id = (SELECT Id FROM Users WHERE Email = 'admin@ihcae.edu' LIMIT 1);

-- 4. Create the Tutorial Topics (Pinned & Locked so they stay at the top and don't get cluttered with replies)
INSERT INTO DiscussionTopics (Title, Slug, CreatedById, IsLocked, IsPinned, CreatedAt, UpdatedAt) VALUES 
('Welcome to the IHCAE Alumni Hub! (Start Here)', 'welcome-start-here', @admin_id, 1, 1, NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 5 HOUR),
('How to use the Alumni Directory to find your Batchmates', 'how-to-use-alumni-directory', @admin_id, 1, 1, NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 4 HOUR),
('Publishing your Expeditions and Stories', 'publishing-expeditions-stories', @admin_id, 1, 1, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 3 HOUR),
('Setting up your Profile and Certifications', 'setting-up-profile-certifications', @admin_id, 1, 1, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR),
('Using the Forums: Best Practices', 'using-the-forums', @admin_id, 1, 1, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR);

-- 5. Create the Initial Posts (Content) for each Topic
-- Topic 1: Welcome
INSERT INTO ForumPosts (Content, TopicId, AuthorId, CreatedAt, UpdatedAt) VALUES 
('Welcome to the official Indian Himalayan Centre for Adventure and Eco-Tourism (IHCAE) Alumni Network!\n\nThis platform was built exclusively for past and present trainees to stay connected, share their mountain experiences, and collaborate on future expeditions.\n\nWhat can you do here?\n- Connect with your old batchmates from your Basic or Advance courses.\n- Stay updated on IHCAE news, upcoming refresher courses, and alumni meets.\n- Share your own expedition stories and success milestones.\n- Use these forums to ask technical mountaineering questions or form climbing teams.\n\nWe are thrilled to have you here. Safe climbing!', 
(SELECT Id FROM DiscussionTopics WHERE Slug = 'welcome-start-here'), @admin_id, NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 5 HOUR);

-- Topic 2: Alumni Directory
INSERT INTO ForumPosts (Content, TopicId, AuthorId, CreatedAt, UpdatedAt) VALUES 
('The Alumni Directory is your most powerful tool for networking!\n\n1. Navigate to the All Users tab.\n2. Use the search bar to look up specific names.\n3. Use the filters to find people by Course (e.g., Basic Mountaineering Course, Mountain Biking) or by Batch/Year.\n\nThis makes it incredibly easy to find the people you trained with in the snow! If you can''t find someone, invite them to join the platform.', 
(SELECT Id FROM DiscussionTopics WHERE Slug = 'how-to-use-alumni-directory'), @admin_id, NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 4 HOUR);

-- Topic 3: Publishing Stories
INSERT INTO ForumPosts (Content, TopicId, AuthorId, CreatedAt, UpdatedAt) VALUES 
('Did you recently summit a major peak? Or are you organizing a local trekking event? We want to feature it!\n\nIf you have a success story or news you would like to share with the rest of the alumni network, please reach out to the platform administrators. You can send us the details of your expedition along with some high-quality photos, and we will review and publish it to the front page for everyone to see.', 
(SELECT Id FROM DiscussionTopics WHERE Slug = 'publishing-expeditions-stories'), @admin_id, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 3 HOUR);

-- Topic 4: Profile Setup
INSERT INTO ForumPosts (Content, TopicId, AuthorId, CreatedAt, UpdatedAt) VALUES 
('Your profile is your mountaineering resume! Make sure it represents you well.\n\n1. Click on your name in the top right and go to Profile.\n2. Upload a clear Profile Picture (preferably in your outdoor gear!).\n3. Write a short bio about your current outdoor activities or profession.\n4. Ensure your IHCAE Courses and Graduation Year are accurate so others can verify your training level.\n\nA complete profile helps build trust when you are forming teams for difficult expeditions.', 
(SELECT Id FROM DiscussionTopics WHERE Slug = 'setting-up-profile-certifications'), @admin_id, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR);

-- Topic 5: Forum Rules
INSERT INTO ForumPosts (Content, TopicId, AuthorId, CreatedAt, UpdatedAt) VALUES 
('The Forums are open for all alumni to discuss gear, routes, weather, and team formations.\n\nBest Practices:\n- Search before posting: Someone might have already asked your question.\n- Be respectful: The mountains teach us humility, let''s practice it here too.\n- Use clear titles: Instead of "Help", use "Need advice on gear for winter Elbrus climb".\n\n(Note: These tutorial threads are locked, but you are free to create new topics in the main forum page!)', 
(SELECT Id FROM DiscussionTopics WHERE Slug = 'using-the-forums'), @admin_id, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR);
