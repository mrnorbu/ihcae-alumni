-- Corrected SQL Script to Update Alumni Names with Tibetan and Nepali Names
-- This script updates the remaining Sample User records

-- =============================================
-- UPDATE USERS TABLE - CORRECTED NAMES
-- =============================================

UPDATE Users SET 
    FirstName = 'Pema',
    LastName = 'Wangmo'
WHERE FirstName = 'Sample' AND LastName = 'User One';

UPDATE Users SET 
    FirstName = 'Sonam',
    LastName = 'Gurung'
WHERE FirstName = 'Sample' AND LastName = 'User Two';

UPDATE Users SET 
    FirstName = 'Karma',
    LastName = 'Tamang'
WHERE FirstName = 'Sample' AND LastName = 'User Three';

UPDATE Users SET 
    FirstName = 'Dolma',
    LastName = 'Sherpa'
WHERE FirstName = 'Sample' AND LastName = 'User Four';

UPDATE Users SET 
    FirstName = 'Lhakpa',
    LastName = 'Lama'
WHERE FirstName = 'Sample' AND LastName = 'User Five';

UPDATE Users SET 
    FirstName = 'Yangchen',
    LastName = 'Thapa'
WHERE FirstName = 'Sample' AND LastName = 'User Six';

UPDATE Users SET 
    FirstName = 'Tsering',
    LastName = 'Bista'
WHERE FirstName = 'Sample' AND LastName = 'User Seven';

UPDATE Users SET 
    FirstName = 'Dechen',
    LastName = 'Magar'
WHERE FirstName = 'Sample' AND LastName = 'User Eight';

UPDATE Users SET 
    FirstName = 'Phurba',
    LastName = 'Subba'
WHERE FirstName = 'Sample' AND LastName = 'User Nine';

UPDATE Users SET 
    FirstName = 'Nima',
    LastName = 'Rai'
WHERE FirstName = 'Sample' AND LastName = 'User Ten';

-- =============================================
-- UPDATE ALUMNI DATABASE TABLE - CORRECTED NAMES
-- =============================================

UPDATE AlumniDatabase SET 
    FirstName = 'Pema',
    LastName = 'Wangmo'
WHERE FirstName = 'Sample' AND LastName = 'User One';

UPDATE AlumniDatabase SET 
    FirstName = 'Sonam',
    LastName = 'Gurung'
WHERE FirstName = 'Sample' AND LastName = 'User Two';

UPDATE AlumniDatabase SET 
    FirstName = 'Karma',
    LastName = 'Tamang'
WHERE FirstName = 'Sample' AND LastName = 'User Three';

UPDATE AlumniDatabase SET 
    FirstName = 'Dolma',
    LastName = 'Sherpa'
WHERE FirstName = 'Sample' AND LastName = 'User Four';

UPDATE AlumniDatabase SET 
    FirstName = 'Lhakpa',
    LastName = 'Lama'
WHERE FirstName = 'Sample' AND LastName = 'User Five';

UPDATE AlumniDatabase SET 
    FirstName = 'Yangchen',
    LastName = 'Thapa'
WHERE FirstName = 'Sample' AND LastName = 'User Six';

UPDATE AlumniDatabase SET 
    FirstName = 'Tsering',
    LastName = 'Bista'
WHERE FirstName = 'Sample' AND LastName = 'User Seven';

UPDATE AlumniDatabase SET 
    FirstName = 'Dechen',
    LastName = 'Magar'
WHERE FirstName = 'Sample' AND LastName = 'User Eight';

UPDATE AlumniDatabase SET 
    FirstName = 'Phurba',
    LastName = 'Subba'
WHERE FirstName = 'Sample' AND LastName = 'User Nine';

UPDATE AlumniDatabase SET 
    FirstName = 'Nima',
    LastName = 'Rai'
WHERE FirstName = 'Sample' AND LastName = 'User Ten';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check updated Users table
SELECT Id, FirstName, LastName, Email, Status 
FROM Users 
WHERE Status = 1  -- Approved users only
ORDER BY FirstName;

-- Check updated AlumniDatabase table
SELECT Id, FirstName, LastName, Email, Course, GraduationYear 
FROM AlumniDatabase 
ORDER BY FirstName;
