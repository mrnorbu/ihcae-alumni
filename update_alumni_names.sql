-- SQL Script to Update Alumni Names with Tibetan and Nepali Names
-- This script updates both the Users table and AlumniDatabase table

-- =============================================
-- UPDATE USERS TABLE
-- =============================================

-- Update Users table with Tibetan and Nepali names
UPDATE Users SET 
    FirstName = 'Tenzin',
    LastName = 'Dorjee'
WHERE FirstName = 'John' AND LastName = 'Doe';

UPDATE Users SET 
    FirstName = 'Pema',
    LastName = 'Wangmo'
WHERE FirstName = 'Sample User Eight';

UPDATE Users SET 
    FirstName = 'Sonam',
    LastName = 'Gurung'
WHERE FirstName = 'Sample User Five';

UPDATE Users SET 
    FirstName = 'Karma',
    LastName = 'Tamang'
WHERE FirstName = 'Sample User Four';

UPDATE Users SET 
    FirstName = 'Dolma',
    LastName = 'Sherpa'
WHERE FirstName = 'Sample User Three';

UPDATE Users SET 
    FirstName = 'Lhakpa',
    LastName = 'Lama'
WHERE FirstName = 'Sample User Two';

UPDATE Users SET 
    FirstName = 'Yangchen',
    LastName = 'Thapa'
WHERE FirstName = 'Sample User One';

-- Add more Tibetan/Nepali names for additional users
UPDATE Users SET 
    FirstName = 'Tsering',
    LastName = 'Bista'
WHERE FirstName = 'Sample User Six';

UPDATE Users SET 
    FirstName = 'Nima',
    LastName = 'Rai'
WHERE FirstName = 'Sample User Seven';

UPDATE Users SET 
    FirstName = 'Dechen',
    LastName = 'Magar'
WHERE FirstName = 'Sample User Nine';

UPDATE Users SET 
    FirstName = 'Phurba',
    LastName = 'Subba'
WHERE FirstName = 'Sample User Ten';

-- =============================================
-- UPDATE ALUMNI DATABASE TABLE
-- =============================================

-- Update AlumniDatabase table with matching Tibetan and Nepali names
UPDATE AlumniDatabase SET 
    FirstName = 'Tenzin',
    LastName = 'Dorjee'
WHERE FirstName = 'John' AND LastName = 'Doe';

UPDATE AlumniDatabase SET 
    FirstName = 'Pema',
    LastName = 'Wangmo'
WHERE FirstName = 'Sample User Eight';

UPDATE AlumniDatabase SET 
    FirstName = 'Sonam',
    LastName = 'Gurung'
WHERE FirstName = 'Sample User Five';

UPDATE AlumniDatabase SET 
    FirstName = 'Karma',
    LastName = 'Tamang'
WHERE FirstName = 'Sample User Four';

UPDATE AlumniDatabase SET 
    FirstName = 'Dolma',
    LastName = 'Sherpa'
WHERE FirstName = 'Sample User Three';

UPDATE AlumniDatabase SET 
    FirstName = 'Lhakpa',
    LastName = 'Lama'
WHERE FirstName = 'Sample User Two';

UPDATE AlumniDatabase SET 
    FirstName = 'Yangchen',
    LastName = 'Thapa'
WHERE FirstName = 'Sample User One';

UPDATE AlumniDatabase SET 
    FirstName = 'Tsering',
    LastName = 'Bista'
WHERE FirstName = 'Sample User Six';

UPDATE AlumniDatabase SET 
    FirstName = 'Nima',
    LastName = 'Rai'
WHERE FirstName = 'Sample User Seven';

UPDATE AlumniDatabase SET 
    FirstName = 'Dechen',
    LastName = 'Magar'
WHERE FirstName = 'Sample User Nine';

UPDATE AlumniDatabase SET 
    FirstName = 'Phurba',
    LastName = 'Subba'
WHERE FirstName = 'Sample User Ten';

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

-- =============================================
-- ADDITIONAL TIBETAN/NEPALI NAMES FOR FUTURE USE
-- =============================================

/*
Common Tibetan Names:
- Tenzin, Pema, Sonam, Karma, Dolma, Lhakpa, Yangchen, Tsering, Dechen, Phurba
- Dorjee, Wangmo, Gurung, Tamang, Sherpa, Lama, Thapa, Bista, Rai, Magar, Subba

Common Nepali Names:
- Raj, Kumar, Devi, Shrestha, Maharjan, Shakya, Bajracharya, Tuladhar
- Gurung, Tamang, Rai, Limbu, Magar, Thapa, Bista, Subba, Pradhan

You can use these names for future alumni additions or updates.
*/
