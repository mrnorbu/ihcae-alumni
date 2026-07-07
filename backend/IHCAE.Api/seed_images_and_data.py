import os
import shutil
# Source paths for generated images
base_artifact_path = "/Users/sonamnorbu/.gemini/antigravity/brain/34afac05-2209-4d6e-b904-7bc90e309f1b"
images = {
    "tshering_mt_elbrus.jpg": f"{base_artifact_path}/tshering_mt_elbrus_1783395018305.jpg",
    "mountaineering_inspection.jpg": f"{base_artifact_path}/mountaineering_inspection_1783395028702.jpg",
    "sensitization_training.jpg": f"{base_artifact_path}/sensitization_training_1783395040565.jpg",
    "partnership_conclave.jpg": f"{base_artifact_path}/partnership_conclave_1783395051932.jpg",
    "alumni_meet.jpg": f"{base_artifact_path}/alumni_meet_1783395062443.jpg"
}

# Destination paths
uploads_dir = "/Users/sonamnorbu/Desktop/Kalasha_Ventures/Tourism/IHCAE/Alumni/ihcae-alumni-app/backend/IHCAE.Api/wwwroot/uploads"
news_dir = os.path.join(uploads_dir, "news")
events_dir = os.path.join(uploads_dir, "events")

# Create directories if they don't exist
os.makedirs(news_dir, exist_ok=True)
os.makedirs(events_dir, exist_ok=True)

# Copy images to backend wwwroot
shutil.copy(images["tshering_mt_elbrus.jpg"], os.path.join(news_dir, "tshering_mt_elbrus.jpg"))
shutil.copy(images["mountaineering_inspection.jpg"], os.path.join(news_dir, "mountaineering_inspection.jpg"))
shutil.copy(images["sensitization_training.jpg"], os.path.join(news_dir, "sensitization_training.jpg"))

shutil.copy(images["partnership_conclave.jpg"], os.path.join(events_dir, "partnership_conclave.jpg"))
shutil.copy(images["alumni_meet.jpg"], os.path.join(events_dir, "alumni_meet.jpg"))
print("Images copied to wwwroot successfully!")

# Now generate the SQL script
sql_content = """USE ihcae_alumni;

-- Clear existing
DELETE FROM NewsArticles;
DELETE FROM Events;

-- Reset auto-increment
ALTER TABLE NewsArticles AUTO_INCREMENT = 1;
ALTER TABLE Events AUTO_INCREMENT = 1;

-- Get Category IDs dynamically
SET @news_cat_success = (SELECT Id FROM NewsCategories WHERE Slug = 'success-story' LIMIT 1);
SET @news_cat_general = (SELECT Id FROM NewsCategories WHERE Slug = 'general-news' LIMIT 1);
SET @news_cat_announcement = (SELECT Id FROM NewsCategories WHERE Slug = 'announcement' LIMIT 1);
SET @event_cat_meetups = (SELECT Id FROM EventCategories WHERE Slug = 'meetups' LIMIT 1);
SET @event_cat_expeditions = (SELECT Id FROM EventCategories WHERE Slug = 'expeditions' LIMIT 1);
SET @admin_id = (SELECT Id FROM Users WHERE Email = 'admin@ihcae.edu' LIMIT 1);

-- Insert News
INSERT INTO NewsArticles (Title, Slug, Content, Excerpt, CategoryId, AuthorId, ImageUrl, ThumbnailUrl, Status, PublishedAt, CreatedAt, UpdatedAt) VALUES 
('Alumni Spotlight: Tshering Choden scales Mt Elbrus', 'tshering-choden-scales-elbrus', 'We are incredibly proud to share that Sikkim mountaineer Tshering Choden, a graduate of the IHCAE Basic Mountaineering Course, successfully scaled Mount Elbrus in Russia, the highest peak in Europe, marking a significant milestone in her Seven Summits challenge.', 'Tshering Choden successfully scales Mount Elbrus in Russia.', @news_cat_success, @admin_id, '/uploads/news/tshering_mt_elbrus.jpg', '/uploads/news/tshering_mt_elbrus.jpg', 2, NOW(), NOW(), NOW()),
('Basic and Advance Mountaineering Courses Inspect', 'basic-advance-mountaineering-inspect', 'IHCAE recently conducted comprehensive inspections of its Basic and Advance Mountaineering Courses held in the Yumthang and Lankong valleys of North Sikkim. These programs involved 118 participants, including NCC cadets, focusing on mountaineering skills, safety protocols, and environmental stewardship.', 'Basic and Advance Mountaineering Courses inspections completed.', @news_cat_general, @admin_id, '/uploads/news/mountaineering_inspection.jpg', '/uploads/news/mountaineering_inspection.jpg', 2, NOW(), NOW(), NOW()),
('Sensitization Training at Yuksam', 'sensitization-training-yuksam', 'In coordination with the Sashastra Seema Bal (SSB), IHCAE organized a one-day sensitization and orientation training program on high-altitude sickness for registered guides and trekking cooks. The event included practical demonstrations on managing high-altitude emergencies.', 'Sensitization training program on high-altitude sickness at Yuksam.', @news_cat_announcement, @admin_id, '/uploads/news/sensitization_training.jpg', '/uploads/news/sensitization_training.jpg', 2, NOW(), NOW(), NOW());

-- Insert Events
INSERT INTO Events (Title, Slug, Description, Location, EventDate, EventEndDate, CategoryId, Capacity, ImageUrl, ThumbnailUrl, CreatedById, Status, PublishedAt, CreatedAt, UpdatedAt) VALUES 
('Annual Alumni Meet 2026', 'annual-alumni-meet-2026', 'Join us for the annual gathering of all IHCAE alumni at Chemchey. Reconnect with your instructors, share your adventure stories, and participate in friendly climbing competitions.', 'IHCAE Campus, Chemchey', '2026-11-15 10:00:00', '2026-11-16 16:00:00', @event_cat_meetups, 100, '/uploads/events/alumni_meet.jpg', '/uploads/events/alumni_meet.jpg', @admin_id, 2, NOW(), NOW(), NOW()),
('Partnership Conclave', 'partnership-conclave', 'IHCAE hosted its inaugural Partnership Conclave, bringing together stakeholders from India, Nepal, and Bhutan to strengthen regional ties and develop a roadmap for sustainable adventure and eco-tourism.', 'IHCAE HQ', '2025-10-10 09:00:00', '2025-10-12 18:00:00', @event_cat_meetups, 50, '/uploads/events/partnership_conclave.jpg', '/uploads/events/partnership_conclave.jpg', @admin_id, 2, NOW(), NOW(), NOW()),
('Winter Skiing Expedition', 'winter-skiing-expedition', 'Special winter skiing expedition for advanced alumni. We will be heading to the high altitude slopes for a 5-day intense skiing experience.', 'Yumesamdong, North Sikkim', '2026-12-20 08:00:00', '2026-12-25 18:00:00', @event_cat_expeditions, 20, '', '', @admin_id, 2, NOW(), NOW(), NOW());
"""

with open("seed_news_events.sql", "w") as f:
    f.write(sql_content)

print("seed_news_events.sql generated successfully!")

