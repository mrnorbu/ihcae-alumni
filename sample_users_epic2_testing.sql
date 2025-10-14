-- =====================================================
-- IHCAE Alumni Network - Sample Users for Epic 2 Testing
-- =====================================================
-- This script creates 10 diverse alumni users with complete profiles
-- for testing the directory and profile features in Epic 2.
-- 
-- Generated: January 2025
-- Purpose: Epic 2 Frontend Testing
-- =====================================================

-- First, ensure we have the required roles
-- (These should already exist from SeedDataService, but including for safety)
INSERT IGNORE INTO Roles (Name, Description, CreatedAt) VALUES
('Admin', 'System administrator with full access', NOW()),
('Alumnus', 'Graduated IHCAE student with full member access', NOW()),
('Trainee', 'Current IHCAE trainee with limited access', NOW());

-- Get the Alumnus role ID for assignment
SET @alumnus_role_id = (SELECT Id FROM Roles WHERE Name = 'Alumnus');

-- =====================================================
-- SAMPLE ALUMNI USERS
-- =====================================================

-- User 1: Adventure Tourism Specialist
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Status, EmailVerified, IsBanned, LastLoginAt, CreatedAt, UpdatedAt) VALUES
('11111111-1111-1111-1111-111111111111', 'sample.user.one@example.com', '$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC', 'Sample', 'User One', '+91-98765-43210', 1, 1, 0, NOW(), '2023-01-15 10:30:00', NOW());

INSERT INTO AlumniProfiles (UserId, ProfileImageUrl, GraduationYear, Course, Bio, JobTitle, Location, CreatedAt, UpdatedAt) VALUES
('11111111-1111-1111-1111-111111111111', 'https://lucide.dev/icons/user.svg', 2018, 'Adventure Tourism Management', 'Passionate adventure tourism professional with 6+ years of experience in Himalayan trekking operations. Specialized in sustainable tourism practices and eco-friendly adventure activities.', 'Senior Adventure Tourism Coordinator', 'Manali, Himachal Pradesh', '2023-01-15 10:30:00', NOW());

INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) VALUES
('11111111-1111-1111-1111-111111111111', @alumnus_role_id, NOW(), '11111111-1111-1111-1111-111111111111');

-- User 2: Eco-Tourism Consultant
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Status, EmailVerified, IsBanned, LastLoginAt, CreatedAt, UpdatedAt) VALUES
('22222222-2222-2222-2222-222222222222', 'sample.user.two@example.com', '$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC', 'Sample', 'User Two', '+91-98765-43211', 1, 1, 0, NOW(), '2022-08-20 14:45:00', NOW());

INSERT INTO AlumniProfiles (UserId, ProfileImageUrl, GraduationYear, Course, Bio, JobTitle, Location, CreatedAt, UpdatedAt) VALUES
('22222222-2222-2222-2222-222222222222', 'https://lucide.dev/icons/user.svg', 2017, 'Eco-Tourism & Conservation', 'Environmental consultant specializing in sustainable tourism development. Led multiple conservation projects in the Western Ghats and Northeast India.', 'Eco-Tourism Consultant', 'Bangalore, Karnataka', '2022-08-20 14:45:00', NOW());

INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) VALUES
('22222222-2222-2222-2222-222222222222', @alumnus_role_id, NOW(), '22222222-2222-2222-2222-222222222222');

-- User 3: Mountain Guide & Instructor
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Status, EmailVerified, IsBanned, LastLoginAt, CreatedAt, UpdatedAt) VALUES
('33333333-3333-3333-3333-333333333333', 'sample.user.three@example.com', '$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC', 'Sample', 'User Three', '+91-98765-43212', 1, 1, 0, NOW(), '2021-03-10 09:15:00', NOW());

INSERT INTO AlumniProfiles (UserId, ProfileImageUrl, GraduationYear, Course, Bio, JobTitle, Location, CreatedAt, UpdatedAt) VALUES
('33333333-3333-3333-3333-333333333333', 'https://lucide.dev/icons/user.svg', 2016, 'Mountain Leadership & Safety', 'Certified mountain guide with extensive experience in high-altitude trekking and mountaineering. Trained over 200+ adventure enthusiasts in safety protocols.', 'Senior Mountain Guide', 'Dehradun, Uttarakhand', '2021-03-10 09:15:00', NOW());

INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) VALUES
('33333333-3333-3333-3333-333333333333', @alumnus_role_id, NOW(), '33333333-3333-3333-3333-333333333333');

-- User 4: Wildlife Tourism Expert
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Status, EmailVerified, IsBanned, LastLoginAt, CreatedAt, UpdatedAt) VALUES
('44444444-4444-4444-4444-444444444444', 'sample.user.four@example.com', '$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC', 'Sample', 'User Four', '+91-98765-43213', 1, 1, 0, NOW(), '2020-11-25 16:20:00', NOW());

INSERT INTO AlumniProfiles (UserId, ProfileImageUrl, GraduationYear, Course, Bio, JobTitle, Location, CreatedAt, UpdatedAt) VALUES
('44444444-4444-4444-4444-444444444444', 'https://lucide.dev/icons/user.svg', 2015, 'Wildlife Tourism & Photography', 'Wildlife photographer and tourism expert specializing in tiger safaris and bird watching tours. Published author of "Wildlife of Central India" guidebook.', 'Wildlife Tourism Specialist', 'Jabalpur, Madhya Pradesh', '2020-11-25 16:20:00', NOW());

INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) VALUES
('44444444-4444-4444-4444-444444444444', @alumnus_role_id, NOW(), '44444444-4444-4444-4444-444444444444');

-- User 5: Cultural Heritage Tourism Manager
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Status, EmailVerified, IsBanned, LastLoginAt, CreatedAt, UpdatedAt) VALUES
('55555555-5555-5555-5555-555555555555', 'sample.user.five@example.com', '$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC', 'Sample', 'User Five', '+91-98765-43214', 1, 1, 0, NOW(), '2019-07-12 11:30:00', NOW());

INSERT INTO AlumniProfiles (UserId, ProfileImageUrl, GraduationYear, Course, Bio, JobTitle, Location, CreatedAt, UpdatedAt) VALUES
('55555555-5555-5555-5555-555555555555', 'https://lucide.dev/icons/user.svg', 2014, 'Cultural Heritage Tourism', 'Heritage tourism specialist with expertise in Rajasthan''s cultural sites. Developed sustainable tourism models for UNESCO World Heritage sites.', 'Cultural Heritage Manager', 'Jaipur, Rajasthan', '2019-07-12 11:30:00', NOW());

INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) VALUES
('55555555-5555-5555-5555-555555555555', @alumnus_role_id, NOW(), '55555555-5555-5555-5555-555555555555');

-- User 6: Adventure Sports Coordinator
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Status, EmailVerified, IsBanned, LastLoginAt, CreatedAt, UpdatedAt) VALUES
('66666666-6666-6666-6666-666666666666', 'sample.user.six@example.com', '$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC', 'Sample', 'User Six', '+91-98765-43215', 1, 1, 0, NOW(), '2023-05-18 13:45:00', NOW());

INSERT INTO AlumniProfiles (UserId, ProfileImageUrl, GraduationYear, Course, Bio, JobTitle, Location, CreatedAt, UpdatedAt) VALUES
('66666666-6666-6666-6666-666666666666', 'https://lucide.dev/icons/user.svg', 2019, 'Adventure Sports Management', 'Adventure sports coordinator specializing in white-water rafting and rock climbing. Certified instructor for multiple adventure sports disciplines.', 'Adventure Sports Coordinator', 'Rishikesh, Uttarakhand', '2023-05-18 13:45:00', NOW());

INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) VALUES
('66666666-6666-6666-6666-666666666666', @alumnus_role_id, NOW(), '66666666-6666-6666-6666-666666666666');

-- User 7: Sustainable Tourism Researcher
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Status, EmailVerified, IsBanned, LastLoginAt, CreatedAt, UpdatedAt) VALUES
('77777777-7777-7777-7777-777777777777', 'sample.user.seven@example.com', '$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC', 'Sample', 'User Seven', '+91-98765-43216', 1, 1, 0, NOW(), '2022-12-03 08:15:00', NOW());

INSERT INTO AlumniProfiles (UserId, ProfileImageUrl, GraduationYear, Course, Bio, JobTitle, Location, CreatedAt, UpdatedAt) VALUES
('77777777-7777-7777-7777-777777777777', 'https://lucide.dev/icons/user.svg', 2018, 'Sustainable Tourism Development', 'Research scholar in sustainable tourism with focus on community-based tourism models. Published research papers on eco-tourism impact assessment.', 'Sustainable Tourism Researcher', 'Hyderabad, Telangana', '2022-12-03 08:15:00', NOW());

INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) VALUES
('77777777-7777-7777-7777-777777777777', @alumnus_role_id, NOW(), '77777777-7777-7777-7777-777777777777');

-- User 8: Travel Agency Owner
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Status, EmailVerified, IsBanned, LastLoginAt, CreatedAt, UpdatedAt) VALUES
('88888888-8888-8888-8888-888888888888', 'sample.user.eight@example.com', '$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC', 'Sample', 'User Eight', '+91-98765-43217', 1, 1, 0, NOW(), '2021-09-28 15:30:00', NOW());

INSERT INTO AlumniProfiles (UserId, ProfileImageUrl, GraduationYear, Course, Bio, JobTitle, Location, CreatedAt, UpdatedAt) VALUES
('88888888-8888-8888-8888-888888888888', 'https://lucide.dev/icons/user.svg', 2017, 'Tourism Business Management', 'Entrepreneur and travel agency owner specializing in adventure and cultural tours. Established successful travel business with focus on responsible tourism.', 'Travel Agency Owner', 'Delhi, NCR', '2021-09-28 15:30:00', NOW());

INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) VALUES
('88888888-8888-8888-8888-888888888888', @alumnus_role_id, NOW(), '88888888-8888-8888-8888-888888888888');

-- User 9: Hospitality & Tourism Manager
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Status, EmailVerified, IsBanned, LastLoginAt, CreatedAt, UpdatedAt) VALUES
('99999999-9999-9999-9999-999999999999', 'sample.user.nine@example.com', '$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC', 'Sample', 'User Nine', '+91-98765-43218', 1, 1, 0, NOW(), '2020-04-15 12:00:00', NOW());

INSERT INTO AlumniProfiles (UserId, ProfileImageUrl, GraduationYear, Course, Bio, JobTitle, Location, CreatedAt, UpdatedAt) VALUES
('99999999-9999-9999-9999-999999999999', 'https://lucide.dev/icons/user.svg', 2016, 'Hospitality & Tourism Management', 'Hospitality professional with expertise in luxury resort management and guest experience enhancement. Managed premium properties in Goa and Kerala.', 'Hospitality Manager', 'Goa, India', '2020-04-15 12:00:00', NOW());

INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) VALUES
('99999999-9999-9999-9999-999999999999', @alumnus_role_id, NOW(), '99999999-9999-9999-9999-999999999999');

-- User 10: Tourism Marketing Specialist
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Status, EmailVerified, IsBanned, LastLoginAt, CreatedAt, UpdatedAt) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sample.user.ten@example.com', '$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC', 'Sample', 'User Ten', '+91-98765-43219', 1, 1, 0, NOW(), '2023-02-22 17:45:00', NOW());

INSERT INTO AlumniProfiles (UserId, ProfileImageUrl, GraduationYear, Course, Bio, JobTitle, Location, CreatedAt, UpdatedAt) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://lucide.dev/icons/user.svg', 2020, 'Tourism Marketing & Digital Media', 'Digital marketing specialist focused on tourism promotion and destination branding. Expert in social media marketing for travel and hospitality industry.', 'Tourism Marketing Specialist', 'Mumbai, Maharashtra', '2023-02-22 17:45:00', NOW());

INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', @alumnus_role_id, NOW(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- =====================================================
-- ADDITIONAL SAMPLE DATA FOR TESTING
-- =====================================================

-- Add some alumni database entries for auto-approval testing
INSERT INTO AlumniDatabase (Id, FirstName, LastName, Email, Course, GraduationYear, Phone, Location, ImportedAt, MatchedUserId) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sample', 'User One', 'sample.user.one@example.com', 'Adventure Tourism Management', 2018, '+91-98765-43210', 'Manali, Himachal Pradesh', NOW(), '11111111-1111-1111-1111-111111111111'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sample', 'User Two', 'sample.user.two@example.com', 'Eco-Tourism & Conservation', 2017, '+91-98765-43211', 'Bangalore, Karnataka', NOW(), '22222222-2222-2222-2222-222222222222'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Sample', 'User Three', 'sample.user.three@example.com', 'Mountain Leadership & Safety', 2016, '+91-98765-43212', 'Dehradun, Uttarakhand', NOW(), '33333333-3333-3333-3333-333333333333');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify users were created
SELECT 
    u.Id,
    u.Email,
    u.FirstName,
    u.LastName,
    u.Status,
    u.EmailVerified,
    ap.Course,
    ap.GraduationYear,
    ap.JobTitle,
    ap.Location
FROM Users u
LEFT JOIN AlumniProfiles ap ON u.Id = ap.UserId
WHERE u.Email LIKE '%@example.com'
ORDER BY ap.GraduationYear DESC;

-- Verify roles were assigned
SELECT 
    u.FirstName,
    u.LastName,
    r.Name as RoleName
FROM Users u
JOIN UserRoles ur ON u.Id = ur.UserId
JOIN Roles r ON ur.RoleId = r.Id
WHERE u.Email LIKE '%@example.com'
ORDER BY u.FirstName;

-- Count total users by status
SELECT 
    Status,
    COUNT(*) as UserCount
FROM Users
GROUP BY Status;

-- Count users by course
SELECT 
    Course,
    COUNT(*) as AlumniCount
FROM AlumniProfiles
GROUP BY Course
ORDER BY AlumniCount DESC;

-- =====================================================
-- NOTES FOR TESTING
-- =====================================================
/*
TESTING SCENARIOS:

1. DIRECTORY PAGE TESTING:
   - Search by name: Try "Sample", "User One", "User Two"
   - Filter by course: Adventure Tourism, Eco-Tourism, Mountain Leadership
   - Filter by graduation year: 2014-2020 range
   - Pagination: Should show 10 users across multiple pages

2. PROFILE PAGE TESTING:
   - View individual profiles: Click on any alumni card
   - Test contact buttons: Email, Phone, WhatsApp
   - Verify profile completeness: Bio, job title, location

3. MY PROFILE TESTING:
   - Login with any user (password: "password123" for all)
   - Edit profile information
   - Upload profile image
   - Save and verify changes

4. FILTER COMBINATIONS:
   - Search + Course filter
   - Search + Year filter
   - Course + Year filter
   - All filters together

5. RESPONSIVE TESTING:
   - Test on mobile, tablet, desktop
   - Verify grid layouts adapt properly
   - Check button and form usability

PASSWORD FOR ALL USERS: password123
(BCrypt hash: $2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC)

PROFILE IMAGES: All users have Lucide user icon as fallback
URL: https://lucide.dev/icons/user.svg

SAMPLE USER EMAILS:
- sample.user.one@example.com
- sample.user.two@example.com
- sample.user.three@example.com
- sample.user.four@example.com
- sample.user.five@example.com
- sample.user.six@example.com
- sample.user.seven@example.com
- sample.user.eight@example.com
- sample.user.nine@example.com
- sample.user.ten@example.com
*/
