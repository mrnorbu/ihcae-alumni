-- Comprehensive Forum Data Fix and Creation Script
-- This script fixes existing data and creates new diverse forum content

-- First, let's clean up any problematic data with invalid UUIDs
DELETE FROM DiscussionTopicTags WHERE TopicId LIKE '4444444%' OR TopicId LIKE '6666666%' OR TopicId LIKE '8888888%';
DELETE FROM PostLikes WHERE PostId LIKE 'p4444444%' OR PostId LIKE 'p6666666%' OR PostId LIKE 'p8888888%';
DELETE FROM ForumPosts WHERE Id LIKE 'p4444444%' OR Id LIKE 'p6666666%' OR Id LIKE 'p8888888%' OR Id LIKE 'r4444444%' OR Id LIKE 'r6666666%' OR Id LIKE 'r8888888%';
DELETE FROM DiscussionTopics WHERE Id LIKE '4444444%' OR Id LIKE '6666666%' OR Id LIKE '8888888%';

-- Create additional tags if they don't exist
INSERT IGNORE INTO Tags (Name, Slug, UsageCount, CreatedAt) VALUES
('Mountaineering', 'mountaineering', 0, NOW()),
('Conservation', 'conservation', 0, NOW()),
('Alumni Stories', 'alumni-stories', 0, NOW()),
('Himalayan Trekking', 'himalayan-trekking', 0, NOW()),
('Wildlife Protection', 'wildlife-protection', 0, NOW()),
('Eco Tourism', 'eco-tourism', 0, NOW()),
('Adventure Sports', 'adventure-sports', 0, NOW()),
('Climate Change', 'climate-change', 0, NOW()),
('Mountain Safety', 'mountain-safety', 0, NOW()),
('Local Communities', 'local-communities', 0, NOW());

-- Create diverse forum topics with different users using proper UUIDs
INSERT INTO DiscussionTopics (Id, Title, CreatedById, IsPinned, IsLocked, CreatedAt, UpdatedAt) VALUES
-- Topics by John Doe
(UUID(), 'Best Routes for Everest Base Camp Trek', '204480b7-8f40-428f-9cca-04670ecde8ce', 1, 0, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 2 DAY),
(UUID(), 'Wildlife Conservation in Sikkim', '204480b7-8f40-428f-9cca-04670ecde8ce', 0, 0, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 1 DAY),

-- Topics by Sample User One
(UUID(), 'My First Himalayan Expedition Experience', '11111111-1111-1111-1111-111111111111', 0, 0, NOW() - INTERVAL 3 DAY, NOW()),
(UUID(), 'Sustainable Tourism Practices', '11111111-1111-1111-1111-111111111111', 0, 0, NOW() - INTERVAL 2 DAY, NOW()),

-- Topics by Sample User Two
(UUID(), 'Mountain Safety Tips for Beginners', '22222222-2222-2222-2222-222222222222', 0, 0, NOW() - INTERVAL 1 DAY, NOW()),
(UUID(), 'Climate Change Impact on Himalayas', '22222222-2222-2222-2222-222222222222', 0, 0, NOW() - INTERVAL 6 HOUR, NOW()),

-- Topics by Sample User Three
(UUID(), 'Local Community Development Projects', '33333333-3333-3333-3333-333333333333', 0, 0, NOW() - INTERVAL 3 HOUR, NOW()),
(UUID(), 'Adventure Sports Equipment Recommendations', '33333333-3333-3333-3333-333333333333', 0, 0, NOW() - INTERVAL 1 HOUR, NOW());

-- Get the topic IDs we just created for creating posts
SET @topic1 = (SELECT Id FROM DiscussionTopics WHERE Title = 'Best Routes for Everest Base Camp Trek' ORDER BY CreatedAt DESC LIMIT 1);
SET @topic2 = (SELECT Id FROM DiscussionTopics WHERE Title = 'Wildlife Conservation in Sikkim' ORDER BY CreatedAt DESC LIMIT 1);
SET @topic3 = (SELECT Id FROM DiscussionTopics WHERE Title = 'My First Himalayan Expedition Experience' ORDER BY CreatedAt DESC LIMIT 1);
SET @topic4 = (SELECT Id FROM DiscussionTopics WHERE Title = 'Sustainable Tourism Practices' ORDER BY CreatedAt DESC LIMIT 1);
SET @topic5 = (SELECT Id FROM DiscussionTopics WHERE Title = 'Mountain Safety Tips for Beginners' ORDER BY CreatedAt DESC LIMIT 1);
SET @topic6 = (SELECT Id FROM DiscussionTopics WHERE Title = 'Climate Change Impact on Himalayas' ORDER BY CreatedAt DESC LIMIT 1);
SET @topic7 = (SELECT Id FROM DiscussionTopics WHERE Title = 'Local Community Development Projects' ORDER BY CreatedAt DESC LIMIT 1);
SET @topic8 = (SELECT Id FROM DiscussionTopics WHERE Title = 'Adventure Sports Equipment Recommendations' ORDER BY CreatedAt DESC LIMIT 1);

-- Create initial posts for each topic
INSERT INTO ForumPosts (Id, TopicId, AuthorId, Content, ParentPostId, IsDeleted, CreatedAt, UpdatedAt) VALUES
-- Posts for Everest Base Camp topic
(UUID(), @topic1, '204480b7-8f40-428f-9cca-04670ecde8ce', 'I''ve completed the Everest Base Camp trek three times and wanted to share the best routes and tips for fellow alumni. The classic route through Lukla is still the most popular, but the Jiri route offers a more authentic experience with gradual altitude gain.', NULL, 0, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 2 DAY),

-- Posts for Wildlife Conservation topic
(UUID(), @topic2, '204480b7-8f40-428f-9cca-04670ecde8ce', 'Sikkim has incredible biodiversity, but climate change and tourism pressure are affecting wildlife habitats. I''m working with local conservation groups and would love to hear from other alumni involved in similar projects.', NULL, 0, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 1 DAY),

-- Posts for First Himalayan Expedition topic
(UUID(), @topic3, '11111111-1111-1111-1111-111111111111', 'Last month I completed my first Himalayan expedition to Annapurna Base Camp. It was life-changing! The views were incredible, but I learned so much about preparation, altitude sickness, and respecting local cultures. Would love to share experiences with others.', NULL, 0, NOW() - INTERVAL 3 DAY, NOW()),

-- Posts for Sustainable Tourism topic
(UUID(), @topic4, '11111111-1111-1111-1111-111111111111', 'As tourism grows in the Himalayas, we need to ensure it benefits local communities while protecting the environment. I''ve been researching sustainable tourism models and would appreciate input from alumni working in this field.', NULL, 0, NOW() - INTERVAL 2 DAY, NOW()),

-- Posts for Mountain Safety topic
(UUID(), @topic5, '22222222-2222-2222-2222-222222222222', 'Safety should be everyone''s top priority in the mountains. I''ve compiled essential safety tips based on my 10+ years of mountaineering experience. This includes weather awareness, equipment checks, and emergency protocols.', NULL, 0, NOW() - INTERVAL 1 DAY, NOW()),

-- Posts for Climate Change topic
(UUID(), @topic6, '22222222-2222-2222-2222-222222222222', 'The Himalayas are experiencing rapid climate change. Glaciers are retreating, weather patterns are shifting, and local communities are adapting. I''m documenting these changes and would love to collaborate with other alumni on climate research.', NULL, 0, NOW() - INTERVAL 6 HOUR, NOW()),

-- Posts for Community Development topic
(UUID(), @topic7, '33333333-3333-3333-3333-333333333333', 'Working with local communities in the Himalayas has taught me the importance of sustainable development. We''re focusing on education, healthcare, and economic opportunities that respect traditional ways of life.', NULL, 0, NOW() - INTERVAL 3 HOUR, NOW()),

-- Posts for Adventure Sports Equipment topic
(UUID(), @topic8, '33333333-3333-3333-3333-333333333333', 'Quality equipment can make or break your adventure experience. I''ve tested various gear over the years and want to share recommendations for different activities and budgets. What''s your go-to equipment?', NULL, 0, NOW() - INTERVAL 1 HOUR, NOW());

-- Get the post IDs we just created for creating replies
SET @post1 = (SELECT Id FROM ForumPosts WHERE TopicId = @topic1 ORDER BY CreatedAt DESC LIMIT 1);
SET @post2 = (SELECT Id FROM ForumPosts WHERE TopicId = @topic2 ORDER BY CreatedAt DESC LIMIT 1);
SET @post3 = (SELECT Id FROM ForumPosts WHERE TopicId = @topic3 ORDER BY CreatedAt DESC LIMIT 1);
SET @post4 = (SELECT Id FROM ForumPosts WHERE TopicId = @topic4 ORDER BY CreatedAt DESC LIMIT 1);
SET @post5 = (SELECT Id FROM ForumPosts WHERE TopicId = @topic5 ORDER BY CreatedAt DESC LIMIT 1);

-- Create replies to posts
INSERT INTO ForumPosts (Id, TopicId, AuthorId, Content, ParentPostId, IsDeleted, CreatedAt, UpdatedAt) VALUES
-- Replies to Everest Base Camp post
(UUID(), @topic1, '11111111-1111-1111-1111-111111111111', 'Great post! I did the Jiri route last year and it was amazing. The gradual acclimatization really helped. How long did your trek take?', @post1, 0, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY),
(UUID(), @topic1, '22222222-2222-2222-2222-222222222222', 'I''m planning my first EBC trek next month. Any recommendations for training beforehand?', @post1, 0, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
(UUID(), @topic1, '204480b7-8f40-428f-9cca-04670ecde8ce', 'The Jiri route took us 18 days including rest days. For training, focus on cardio and leg strength. Stair climbing with a weighted pack is excellent preparation!', @post1, 0, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),

-- Replies to Wildlife Conservation post
(UUID(), @topic2, '33333333-3333-3333-3333-333333333333', 'I''m working on a snow leopard conservation project in Ladakh. Would love to collaborate and share best practices!', @post2, 0, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
(UUID(), @topic2, '44444444-4444-4444-4444-444444444444', 'The red panda population in Sikkim is particularly vulnerable. Are you working with any specific species?', @post2, 0, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),

-- Replies to First Himalayan Expedition post
(UUID(), @topic3, '55555555-5555-5555-5555-555555555555', 'Congratulations on your first expedition! ABC is a fantastic choice. The sunrise from base camp is unforgettable.', @post3, 0, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
(UUID(), @topic3, '66666666-6666-6666-6666-666666666666', 'Altitude sickness is no joke. What symptoms did you experience and how did you manage them?', @post3, 0, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),

-- Replies to Mountain Safety post
(UUID(), @topic5, '77777777-7777-7777-7777-777777777777', 'Excellent safety tips! I''d add: always inform someone of your route and expected return time.', @post5, 0, NOW() - INTERVAL 12 HOUR, NOW() - INTERVAL 12 HOUR),
(UUID(), @topic5, '88888888-8888-8888-8888-888888888888', 'Weather can change rapidly in the mountains. What''s your go-to weather app or resource?', @post5, 0, NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 6 HOUR);

-- Create some likes for posts and replies (using correct PostLikes table structure)
INSERT INTO PostLikes (PostId, UserId, CreatedAt) VALUES
-- Likes for main posts
(@post1, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL 4 DAY),
(@post1, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL 3 DAY),
(@post1, '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL 2 DAY),
(@post1, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL 1 DAY),

(@post2, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL 3 DAY),
(@post2, '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL 2 DAY),
(@post2, '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL 1 DAY),

(@post3, '204480b7-8f40-428f-9cca-04670ecde8ce', NOW() - INTERVAL 2 DAY),
(@post3, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL 1 DAY),
(@post3, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL 12 HOUR);

-- Associate topics with tags
INSERT INTO DiscussionTopicTags (TopicId, TagId) VALUES
-- Everest Base Camp topic tags
(@topic1, (SELECT Id FROM Tags WHERE Name = 'Mountaineering')),
(@topic1, (SELECT Id FROM Tags WHERE Name = 'Himalayan Trekking')),
(@topic1, (SELECT Id FROM Tags WHERE Name = 'Mountain Safety')),

-- Wildlife Conservation topic tags
(@topic2, (SELECT Id FROM Tags WHERE Name = 'Conservation')),
(@topic2, (SELECT Id FROM Tags WHERE Name = 'Wildlife Protection')),
(@topic2, (SELECT Id FROM Tags WHERE Name = 'Climate Change')),

-- First Himalayan Expedition topic tags
(@topic3, (SELECT Id FROM Tags WHERE Name = 'Alumni Stories')),
(@topic3, (SELECT Id FROM Tags WHERE Name = 'Mountaineering')),
(@topic3, (SELECT Id FROM Tags WHERE Name = 'Himalayan Trekking')),

-- Sustainable Tourism topic tags
(@topic4, (SELECT Id FROM Tags WHERE Name = 'Eco Tourism')),
(@topic4, (SELECT Id FROM Tags WHERE Name = 'Local Communities')),
(@topic4, (SELECT Id FROM Tags WHERE Name = 'Conservation')),

-- Mountain Safety topic tags
(@topic5, (SELECT Id FROM Tags WHERE Name = 'Mountain Safety')),
(@topic5, (SELECT Id FROM Tags WHERE Name = 'Mountaineering')),

-- Climate Change topic tags
(@topic6, (SELECT Id FROM Tags WHERE Name = 'Climate Change')),
(@topic6, (SELECT Id FROM Tags WHERE Name = 'Conservation')),

-- Community Development topic tags
(@topic7, (SELECT Id FROM Tags WHERE Name = 'Local Communities')),
(@topic7, (SELECT Id FROM Tags WHERE Name = 'Alumni Stories')),

-- Adventure Sports Equipment topic tags
(@topic8, (SELECT Id FROM Tags WHERE Name = 'Adventure Sports')),
(@topic8, (SELECT Id FROM Tags WHERE Name = 'Mountaineering'));

-- Update tag usage counts
UPDATE Tags SET UsageCount = (
    SELECT COUNT(*) FROM DiscussionTopicTags WHERE TagId = Tags.Id
);

-- Display summary
SELECT 'Forum Data Fix and Creation Complete!' as Status;
SELECT COUNT(*) as TotalTopics FROM DiscussionTopics;
SELECT COUNT(*) as TotalPosts FROM ForumPosts;
SELECT COUNT(*) as TotalLikes FROM PostLikes;
SELECT COUNT(*) as TotalTags FROM Tags;
SELECT COUNT(*) as TotalTopicTags FROM DiscussionTopicTags;
