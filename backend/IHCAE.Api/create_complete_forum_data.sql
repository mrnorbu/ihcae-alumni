-- Complete Forum Data Creation Script
-- This script creates diverse forum topics, posts, replies, likes, and tags

-- First, let's create some additional tags
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

-- Create initial posts for each topic
INSERT INTO ForumPosts (Id, TopicId, AuthorId, Content, ParentPostId, IsDeleted, CreatedAt, UpdatedAt) VALUES
-- Posts for Everest Base Camp topic
('p1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '204480b7-8f40-428f-9cca-04670ecde8ce', 'I''ve completed the Everest Base Camp trek three times and wanted to share the best routes and tips for fellow alumni. The classic route through Lukla is still the most popular, but the Jiri route offers a more authentic experience with gradual altitude gain.', NULL, 0, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 2 DAY),

-- Posts for Wildlife Conservation topic
('p2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', '204480b7-8f40-428f-9cca-04670ecde8ce', 'Sikkim has incredible biodiversity, but climate change and tourism pressure are affecting wildlife habitats. I''m working with local conservation groups and would love to hear from other alumni involved in similar projects.', NULL, 0, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 1 DAY),

-- Posts for First Himalayan Expedition topic
('p3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Last month I completed my first Himalayan expedition to Annapurna Base Camp. It was life-changing! The views were incredible, but I learned so much about preparation, altitude sickness, and respecting local cultures. Would love to share experiences with others.', NULL, 0, NOW() - INTERVAL 3 DAY, NOW()),

-- Posts for Sustainable Tourism topic
('p4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'As tourism grows in the Himalayas, we need to ensure it benefits local communities while protecting the environment. I''ve been researching sustainable tourism models and would appreciate input from alumni working in this field.', NULL, 0, NOW() - INTERVAL 2 DAY, NOW()),

-- Posts for Mountain Safety topic
('p5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Safety should be everyone''s top priority in the mountains. I''ve compiled essential safety tips based on my 10+ years of mountaineering experience. This includes weather awareness, equipment checks, and emergency protocols.', NULL, 0, NOW() - INTERVAL 1 DAY, NOW()),

-- Posts for Climate Change topic
('p6666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'The Himalayas are experiencing rapid climate change. Glaciers are retreating, weather patterns are shifting, and local communities are adapting. I''m documenting these changes and would love to collaborate with other alumni on climate research.', NULL, 0, NOW() - INTERVAL 6 HOUR, NOW()),

-- Posts for Community Development topic
('p7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'Working with local communities in the Himalayas has taught me the importance of sustainable development. We''re focusing on education, healthcare, and economic opportunities that respect traditional ways of life.', NULL, 0, NOW() - INTERVAL 3 HOUR, NOW()),

-- Posts for Adventure Sports Equipment topic
('p8888888-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 'Quality equipment can make or break your adventure experience. I''ve tested various gear over the years and want to share recommendations for different activities and budgets. What''s your go-to equipment?', NULL, 0, NOW() - INTERVAL 1 HOUR, NOW());

-- Create replies to posts
INSERT INTO ForumPosts (Id, TopicId, AuthorId, Content, ParentPostId, IsDeleted, CreatedAt, UpdatedAt) VALUES
-- Replies to Everest Base Camp post
('r1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Great post! I did the Jiri route last year and it was amazing. The gradual acclimatization really helped. How long did your trek take?', 'p1111111-1111-1111-1111-111111111111', 0, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY),
('r2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'I''m planning my first EBC trek next month. Any recommendations for training beforehand?', 'p1111111-1111-1111-1111-111111111111', 0, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
('r3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', '204480b7-8f40-428f-9cca-04670ecde8ce', 'The Jiri route took us 18 days including rest days. For training, focus on cardio and leg strength. Stair climbing with a weighted pack is excellent preparation!', 'p1111111-1111-1111-1111-111111111111', 0, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),

-- Replies to Wildlife Conservation post
('r4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'I''m working on a snow leopard conservation project in Ladakh. Would love to collaborate and share best practices!', 'p2222222-2222-2222-2222-222222222222', 0, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
('r5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'The red panda population in Sikkim is particularly vulnerable. Are you working with any specific species?', 'p2222222-2222-2222-2222-222222222222', 0, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),

-- Replies to First Himalayan Expedition post
('r6666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'Congratulations on your first expedition! ABC is a fantastic choice. The sunrise from base camp is unforgettable.', 'p3333333-3333-3333-3333-333333333333', 0, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
('r7777777-7777-7777-7777-777777777777', 'a3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Altitude sickness is no joke. What symptoms did you experience and how did you manage them?', 'p3333333-3333-3333-3333-333333333333', 0, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),

-- Replies to Mountain Safety post
('r8888888-8888-8888-8888-888888888888', 'a5555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'Excellent safety tips! I''d add: always inform someone of your route and expected return time.', 'p5555555-5555-5555-5555-555555555555', 0, NOW() - INTERVAL 12 HOUR, NOW() - INTERVAL 12 HOUR),
('r9999999-9999-9999-9999-999999999999', 'a5555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'Weather can change rapidly in the mountains. What''s your go-to weather app or resource?', 'p5555555-5555-5555-5555-555555555555', 0, NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 6 HOUR);

-- Create likes for posts and replies
INSERT INTO PostLikes (Id, PostId, UserId, CreatedAt) VALUES
-- Likes for main posts
('l1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL 4 DAY),
('l2222222-2222-2222-2222-222222222222', 'p1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL 3 DAY),
('l3333333-3333-3333-3333-333333333333', 'p1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL 2 DAY),
('l4444444-4444-4444-4444-444444444444', 'p1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL 1 DAY),

('l5555555-5555-5555-5555-555555555555', 'p2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL 3 DAY),
('l6666666-6666-6666-6666-666666666666', 'p2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL 2 DAY),
('l7777777-7777-7777-7777-777777777777', 'p2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL 1 DAY),

('l8888888-8888-8888-8888-888888888888', 'p3333333-3333-3333-3333-333333333333', '204480b7-8f40-428f-9cca-04670ecde8ce', NOW() - INTERVAL 2 DAY),
('l9999999-9999-9999-9999-999999999999', 'p3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL 1 DAY),
('l0000000-0000-0000-0000-000000000000', 'p3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL 12 HOUR),

-- Likes for replies
('l1111112-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', '204480b7-8f40-428f-9cca-04670ecde8ce', NOW() - INTERVAL 3 DAY),
('l1111113-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL 2 DAY),
('l1111114-1111-1111-1111-111111111111', 'r2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL 2 DAY),
('l1111115-1111-1111-1111-111111111111', 'r3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL 1 DAY);

-- Associate topics with tags
INSERT INTO DiscussionTopicTags (TopicId, TagId) VALUES
-- Everest Base Camp topic tags
('a1111111-1111-1111-1111-111111111111', (SELECT Id FROM Tags WHERE Name = 'Mountaineering')),
('a1111111-1111-1111-1111-111111111111', (SELECT Id FROM Tags WHERE Name = 'Himalayan Trekking')),
('a1111111-1111-1111-1111-111111111111', (SELECT Id FROM Tags WHERE Name = 'Mountain Safety')),

-- Wildlife Conservation topic tags
('a2222222-2222-2222-2222-222222222222', (SELECT Id FROM Tags WHERE Name = 'Conservation')),
('a2222222-2222-2222-2222-222222222222', (SELECT Id FROM Tags WHERE Name = 'Wildlife Protection')),
('a2222222-2222-2222-2222-222222222222', (SELECT Id FROM Tags WHERE Name = 'Climate Change')),

-- First Himalayan Expedition topic tags
('a3333333-3333-3333-3333-333333333333', (SELECT Id FROM Tags WHERE Name = 'Alumni Stories')),
('a3333333-3333-3333-3333-333333333333', (SELECT Id FROM Tags WHERE Name = 'Mountaineering')),
('a3333333-3333-3333-3333-333333333333', (SELECT Id FROM Tags WHERE Name = 'Himalayan Trekking')),

-- Sustainable Tourism topic tags
('a4444444-4444-4444-4444-444444444444', (SELECT Id FROM Tags WHERE Name = 'Eco Tourism')),
('a4444444-4444-4444-4444-444444444444', (SELECT Id FROM Tags WHERE Name = 'Local Communities')),
('a4444444-4444-4444-4444-444444444444', (SELECT Id FROM Tags WHERE Name = 'Conservation')),

-- Mountain Safety topic tags
('a5555555-5555-5555-5555-555555555555', (SELECT Id FROM Tags WHERE Name = 'Mountain Safety')),
('a5555555-5555-5555-5555-555555555555', (SELECT Id FROM Tags WHERE Name = 'Mountaineering')),

-- Climate Change topic tags
('a6666666-6666-6666-6666-666666666666', (SELECT Id FROM Tags WHERE Name = 'Climate Change')),
('a6666666-6666-6666-6666-666666666666', (SELECT Id FROM Tags WHERE Name = 'Conservation')),

-- Community Development topic tags
('a7777777-7777-7777-7777-777777777777', (SELECT Id FROM Tags WHERE Name = 'Local Communities')),
('a7777777-7777-7777-7777-777777777777', (SELECT Id FROM Tags WHERE Name = 'Alumni Stories')),

-- Adventure Sports Equipment topic tags
('a8888888-8888-8888-8888-888888888888', (SELECT Id FROM Tags WHERE Name = 'Adventure Sports')),
('a8888888-8888-8888-8888-888888888888', (SELECT Id FROM Tags WHERE Name = 'Mountaineering'));

-- Update tag usage counts
UPDATE Tags SET UsageCount = (
    SELECT COUNT(*) FROM DiscussionTopicTags WHERE TagId = Tags.Id
);

-- Display summary
SELECT 'Forum Data Creation Complete!' as Status;
SELECT COUNT(*) as TotalTopics FROM DiscussionTopics;
SELECT COUNT(*) as TotalPosts FROM ForumPosts;
SELECT COUNT(*) as TotalLikes FROM PostLikes;
SELECT COUNT(*) as TotalTags FROM Tags;
SELECT COUNT(*) as TotalTopicTags FROM DiscussionTopicTags;
