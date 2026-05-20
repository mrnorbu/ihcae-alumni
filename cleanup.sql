SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM AlumniProfiles WHERE UserId IN (SELECT Id FROM Users WHERE Email IN ('mrnorbu@gmail.com', 'mailsonam.norbu@gmail.com', 'bumblebeeguesthouse@gmail.com'));
DELETE FROM UserRoles WHERE UserId IN (SELECT Id FROM Users WHERE Email IN ('mrnorbu@gmail.com', 'mailsonam.norbu@gmail.com', 'bumblebeeguesthouse@gmail.com'));
DELETE FROM PasswordResetTokens WHERE UserId IN (SELECT Id FROM Users WHERE Email IN ('mrnorbu@gmail.com', 'mailsonam.norbu@gmail.com', 'bumblebeeguesthouse@gmail.com'));
DELETE FROM Users WHERE Email IN ('mrnorbu@gmail.com', 'mailsonam.norbu@gmail.com', 'bumblebeeguesthouse@gmail.com');
DELETE FROM AlumniDatabase WHERE Email IN ('mrnorbu@gmail.com', 'mailsonam.norbu@gmail.com', 'bumblebeeguesthouse@gmail.com');

SET FOREIGN_KEY_CHECKS = 1;
