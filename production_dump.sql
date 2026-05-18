-- MySQL dump 10.13  Distrib 8.0.41, for macos15 (arm64)
--
-- Host: localhost    Database: ihcae_alumni
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'a1b35da0-774d-11f0-a0ab-c7ea438e0159:1-7';

--
-- Table structure for table `__EFMigrationsHistory`
--

DROP TABLE IF EXISTS `__EFMigrationsHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__EFMigrationsHistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__EFMigrationsHistory`
--

LOCK TABLES `__EFMigrationsHistory` WRITE;
/*!40000 ALTER TABLE `__EFMigrationsHistory` DISABLE KEYS */;
INSERT INTO `__EFMigrationsHistory` VALUES ('20251010094854_InitialCreate','9.0.9'),('20251010115107_AddEmailVerificationAndPasswordResetTokens','9.0.9'),('20251011043421_AddPhoneToUser','9.0.9'),('20251014040518_AddForumTables','9.0.9'),('20251014042026_AddSoftDeleteToForumPosts','9.0.9'),('20251014043135_AddTagsSystem','9.0.9'),('20251027091155_AddNewsAndEventsTables','8.0.10'),('20251027105556_SeedNewsAndEventsData','9.0.9');
/*!40000 ALTER TABLE `__EFMigrationsHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AlumniDatabase`
--

DROP TABLE IF EXISTS `AlumniDatabase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AlumniDatabase` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `FirstName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Course` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GraduationYear` int DEFAULT NULL,
  `Phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ImportedAt` datetime(6) NOT NULL,
  `MatchedUserId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_AlumniDatabase_Email` (`Email`),
  KEY `IX_AlumniDatabase_FirstName_LastName` (`FirstName`,`LastName`),
  KEY `IX_AlumniDatabase_MatchedUserId` (`MatchedUserId`),
  CONSTRAINT `FK_AlumniDatabase_Users_MatchedUserId` FOREIGN KEY (`MatchedUserId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AlumniDatabase`
--

LOCK TABLES `AlumniDatabase` WRITE;
/*!40000 ALTER TABLE `AlumniDatabase` DISABLE KEYS */;
INSERT INTO `AlumniDatabase` VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Pema','Wangmo','sample.user.one@example.com','Adventure Tourism Management',2018,'+91-98765-43210','Manali, Himachal Pradesh','2025-10-11 10:21:54.000000','11111111-1111-1111-1111-111111111111'),('cccccccc-cccc-cccc-cccc-cccccccccccc','Sonam','Gurung','sample.user.two@example.com','Eco-Tourism & Conservation',2017,'+91-98765-43211','Bangalore, Karnataka','2025-10-11 10:21:54.000000','22222222-2222-2222-2222-222222222222'),('dddddddd-dddd-dddd-dddd-dddddddddddd','Karma','Tamang','sample.user.three@example.com','Mountain Leadership & Safety',2016,'+91-98765-43212','Dehradun, Uttarakhand','2025-10-11 10:21:54.000000','33333333-3333-3333-3333-333333333333');
/*!40000 ALTER TABLE `AlumniDatabase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AlumniProfiles`
--

DROP TABLE IF EXISTS `AlumniProfiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AlumniProfiles` (
  `UserId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `ProfileImageUrl` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GraduationYear` int DEFAULT NULL,
  `Course` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Bio` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `JobTitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`UserId`),
  KEY `IX_AlumniProfiles_Course` (`Course`),
  KEY `IX_AlumniProfiles_GraduationYear` (`GraduationYear`),
  CONSTRAINT `FK_AlumniProfiles_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AlumniProfiles`
--

LOCK TABLES `AlumniProfiles` WRITE;
/*!40000 ALTER TABLE `AlumniProfiles` DISABLE KEYS */;
INSERT INTO `AlumniProfiles` VALUES ('11111111-1111-1111-1111-111111111111','/uploads/profiles/11111111-1111-1111-1111-111111111111_a86769bb-f25b-460e-a265-7019768d73df.png',2018,'Adventure Tourism Management','Passionate adventure tourism professional with 6+ years of experience in Himalayan trekking operations. Specialized in sustainable tourism practices and eco-friendly adventure activities.','Senior Adventure Tourism Coordinator','Manali, Himachal Pradesh','2023-01-15 10:30:00.000000','2025-10-11 10:21:54.000000'),('204480b7-8f40-428f-9cca-04670ecde8ce',NULL,2020,'Advanced Mountaineering','I am a passionate mountaineer and outdoor enthusiast.','Mountain Guide','Gangtok, Sikkim','2025-10-11 04:37:49.987601','2025-10-11 04:37:50.004237'),('22222222-2222-2222-2222-222222222222','/uploads/profiles/22222222-2222-2222-2222-222222222222_ce769618-d814-4284-b10f-31de6b0b8faa.png',2017,'Eco-Tourism & Conservation','Environmental consultant specializing in sustainable tourism development. Led multiple conservation projects in the Western Ghats and Northeast India.','Eco-Tourism Consultant','Bangalore, Karnataka','2022-08-20 14:45:00.000000','2025-10-11 10:21:54.000000'),('33333333-3333-3333-3333-333333333333','/uploads/profiles/33333333-3333-3333-3333-333333333333_4a6cf495-ff7c-49ba-b09b-e815027662ad.png',2016,'Mountain Leadership & Safety','Certified mountain guide with extensive experience in high-altitude trekking and mountaineering. Trained over 200+ adventure enthusiasts in safety protocols.','Senior Mountain Guide','Dehradun, Uttarakhand','2021-03-10 09:15:00.000000','2025-10-11 10:21:54.000000'),('44444444-4444-4444-4444-444444444444','/uploads/profiles/44444444-4444-4444-4444-444444444444_53278696-14fe-40a2-b812-7f7036083b82.png',2015,'Wildlife Tourism & Photography','Wildlife photographer and tourism expert specializing in tiger safaris and bird watching tours. Published author of \"Wildlife of Central India\" guidebook.','Wildlife Tourism Specialist','Jabalpur, Madhya Pradesh','2020-11-25 16:20:00.000000','2025-10-11 10:21:54.000000'),('55555555-5555-5555-5555-555555555555','/uploads/profiles/55555555-5555-5555-5555-555555555555_5db010d5-5286-4a65-9175-8eacd50cdcbd.png',2014,'Cultural Heritage Tourism','Heritage tourism specialist with expertise in Rajasthan\'s cultural sites. Developed sustainable tourism models for UNESCO World Heritage sites.','Cultural Heritage Manager','Jaipur, Rajasthan','2019-07-12 11:30:00.000000','2025-10-11 10:21:54.000000'),('66666666-6666-6666-6666-666666666666','/uploads/profiles/66666666-6666-6666-6666-666666666666_bff78b89-7b50-4a16-bdd8-f00139480a90.png',2019,'Adventure Sports Management','Adventure sports coordinator specializing in white-water rafting and rock climbing. Certified instructor for multiple adventure sports disciplines.','Adventure Sports Coordinator','Rishikesh, Uttarakhand','2023-05-18 13:45:00.000000','2025-10-11 10:21:54.000000'),('77777777-7777-7777-7777-777777777777','/uploads/profiles/77777777-7777-7777-7777-777777777777_27f03c19-7ba5-426d-9cf9-02dd16eba01e.png',2018,'Sustainable Tourism Development','Research scholar in sustainable tourism with focus on community-based tourism models. Published research papers on eco-tourism impact assessment.','Sustainable Tourism Researcher','Hyderabad, Telangana','2022-12-03 08:15:00.000000','2025-10-11 10:21:54.000000'),('88888888-8888-8888-8888-888888888888','/uploads/profiles/88888888-8888-8888-8888-888888888888_ac8265ed-b215-4799-916e-12edce265b4c.png',2017,'Tourism Business Management','Entrepreneur and travel agency owner specializing in adventure and cultural tours. Established successful travel business with focus on responsible tourism.','Travel Agency Owner','Delhi, NCR','2021-09-28 15:30:00.000000','2025-10-11 10:21:54.000000'),('99999999-9999-9999-9999-999999999999','/uploads/profiles/99999999-9999-9999-9999-999999999999_afca72d9-fa23-4a23-924c-23c1b7c59281.png',2016,'Hospitality & Tourism Management','Hospitality professional with expertise in luxury resort management and guest experience enhancement. Managed premium properties in Goa and Kerala.','Hospitality Manager','Goa, India','2020-04-15 12:00:00.000000','2025-10-11 10:21:54.000000'),('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','/uploads/profiles/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa_b880b3bf-2ed3-4abb-a4ac-4914cdb163d5.png',2020,'Tourism Marketing & Digital Media','Digital marketing specialist focused on tourism promotion and destination branding. Expert in social media marketing for travel and hospitality industry.','Tourism Marketing Specialist','Mumbai, Maharashtra','2023-02-22 17:45:00.000000','2025-10-11 10:21:54.000000'),('ef3379e2-ecf6-4c26-83aa-7d3dd442549a',NULL,2023,'Adventure Tourism Management',NULL,NULL,'Sikkim, India','2025-10-14 19:16:26.000000',NULL);
/*!40000 ALTER TABLE `AlumniProfiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DiscussionTopics`
--

DROP TABLE IF EXISTS `DiscussionTopics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DiscussionTopics` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedById` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `IsLocked` tinyint(1) NOT NULL DEFAULT '0',
  `IsPinned` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `UpdatedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_DiscussionTopics_CreatedAt` (`CreatedAt`),
  KEY `IX_DiscussionTopics_CreatedById` (`CreatedById`),
  KEY `IX_DiscussionTopics_IsPinned` (`IsPinned`),
  CONSTRAINT `FK_DiscussionTopics_Users_CreatedById` FOREIGN KEY (`CreatedById`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DiscussionTopics`
--

LOCK TABLES `DiscussionTopics` WRITE;
/*!40000 ALTER TABLE `DiscussionTopics` DISABLE KEYS */;
INSERT INTO `DiscussionTopics` VALUES ('139a651e-a8c5-11f0-8760-baf7a760ec7e','Best Routes for Everest Base Camp Trek','204480b7-8f40-428f-9cca-04670ecde8ce',0,1,'2025-10-09 11:44:43.000000','2025-10-12 11:44:43.000000'),('139a75a4-a8c5-11f0-8760-baf7a760ec7e','Wildlife Conservation in Sikkim','204480b7-8f40-428f-9cca-04670ecde8ce',0,0,'2025-10-10 11:44:43.000000','2025-10-13 11:44:43.000000'),('139a7a40-a8c5-11f0-8760-baf7a760ec7e','My First Himalayan Expedition Experience','11111111-1111-1111-1111-111111111111',0,0,'2025-10-11 11:44:43.000000','2025-10-14 11:44:43.000000'),('139a7b80-a8c5-11f0-8760-baf7a760ec7e','Sustainable Tourism Practices','11111111-1111-1111-1111-111111111111',0,0,'2025-10-12 11:44:43.000000','2025-10-14 11:44:43.000000'),('139a7c70-a8c5-11f0-8760-baf7a760ec7e','Mountain Safety Tips for Beginners','22222222-2222-2222-2222-222222222222',0,0,'2025-10-13 11:44:43.000000','2025-10-14 11:44:43.000000'),('139a7eaa-a8c5-11f0-8760-baf7a760ec7e','Climate Change Impact on Himalayas','22222222-2222-2222-2222-222222222222',0,0,'2025-10-14 05:44:43.000000','2025-10-14 11:44:43.000000'),('139a7ff4-a8c5-11f0-8760-baf7a760ec7e','Local Community Development Projects','33333333-3333-3333-3333-333333333333',0,0,'2025-10-14 08:44:43.000000','2025-10-14 11:44:43.000000'),('139a80f8-a8c5-11f0-8760-baf7a760ec7e','Adventure Sports Equipment Recommendations','33333333-3333-3333-3333-333333333333',0,0,'2025-10-14 10:44:43.000000','2025-10-14 11:44:43.000000'),('33333333-3333-3333-3333-333333333333','Job Opportunities and Career Advice','9ab5be04-3120-4182-8b1b-5f937e8d7079',0,0,'2025-10-14 09:39:33.000000',NULL),('637d5192-c959-4d72-8e33-2ebfb2eeb497','Test Topic from API','9ab5be04-3120-4182-8b1b-5f937e8d7079',0,0,'2025-10-14 04:10:00.157712',NULL),('72d5d0c3-75d7-4cfc-9fea-f887022dacf5','Test Topic with Tags','af33f3f4-0aea-4621-9722-1fedd1830e1b',0,0,'2025-10-14 04:48:12.929633',NULL),('b1d0c0d4-113c-4bd0-b49b-7c5041dbd250','My First Expedition','ef3379e2-ecf6-4c26-83aa-7d3dd442549a',0,0,'2025-10-27 08:17:17.073961',NULL),('d49fe208-a8c4-11f0-8760-baf7a760ec7e','Best Routes for Everest Base Camp Trek','204480b7-8f40-428f-9cca-04670ecde8ce',0,1,'2025-10-09 11:42:58.000000','2025-10-12 11:42:58.000000'),('d4a0adaa-a8c4-11f0-8760-baf7a760ec7e','Wildlife Conservation in Sikkim','204480b7-8f40-428f-9cca-04670ecde8ce',0,0,'2025-10-10 11:42:58.000000','2025-10-13 11:42:58.000000'),('d4a0aea4-a8c4-11f0-8760-baf7a760ec7e','My First Himalayan Expedition Experience','11111111-1111-1111-1111-111111111111',0,0,'2025-10-11 11:42:58.000000','2025-10-14 11:42:58.000000'),('d4a0af26-a8c4-11f0-8760-baf7a760ec7e','Sustainable Tourism Practices','11111111-1111-1111-1111-111111111111',0,0,'2025-10-12 11:42:58.000000','2025-10-14 11:42:58.000000'),('d4a0af94-a8c4-11f0-8760-baf7a760ec7e','Mountain Safety Tips for Beginners','22222222-2222-2222-2222-222222222222',0,0,'2025-10-13 11:42:58.000000','2025-10-14 11:42:58.000000'),('d4a0aff8-a8c4-11f0-8760-baf7a760ec7e','Climate Change Impact on Himalayas','22222222-2222-2222-2222-222222222222',0,0,'2025-10-14 05:42:58.000000','2025-10-14 11:42:58.000000'),('d4a0b066-a8c4-11f0-8760-baf7a760ec7e','Local Community Development Projects','33333333-3333-3333-3333-333333333333',0,0,'2025-10-14 08:42:58.000000','2025-10-14 11:42:58.000000'),('d4a0b0fc-a8c4-11f0-8760-baf7a760ec7e','Adventure Sports Equipment Recommendations','33333333-3333-3333-3333-333333333333',0,0,'2025-10-14 10:42:58.000000','2025-10-14 11:42:58.000000'),('d71556a7-35af-4278-a5cd-78c304929b76','Career Development Tips','af33f3f4-0aea-4621-9722-1fedd1830e1b',0,0,'2025-10-14 04:49:10.441089',NULL);
/*!40000 ALTER TABLE `DiscussionTopics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DiscussionTopicTags`
--

DROP TABLE IF EXISTS `DiscussionTopicTags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DiscussionTopicTags` (
  `TopicId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `TagId` int NOT NULL,
  PRIMARY KEY (`TopicId`,`TagId`),
  KEY `IX_DiscussionTopicTags_TagId` (`TagId`),
  CONSTRAINT `FK_DiscussionTopicTags_DiscussionTopics_TopicId` FOREIGN KEY (`TopicId`) REFERENCES `DiscussionTopics` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_DiscussionTopicTags_Tags_TagId` FOREIGN KEY (`TagId`) REFERENCES `Tags` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DiscussionTopicTags`
--

LOCK TABLES `DiscussionTopicTags` WRITE;
/*!40000 ALTER TABLE `DiscussionTopicTags` DISABLE KEYS */;
INSERT INTO `DiscussionTopicTags` VALUES ('72d5d0c3-75d7-4cfc-9fea-f887022dacf5',1),('b1d0c0d4-113c-4bd0-b49b-7c5041dbd250',1),('d71556a7-35af-4278-a5cd-78c304929b76',1),('72d5d0c3-75d7-4cfc-9fea-f887022dacf5',2),('33333333-3333-3333-3333-333333333333',3),('72d5d0c3-75d7-4cfc-9fea-f887022dacf5',3),('d71556a7-35af-4278-a5cd-78c304929b76',3),('d71556a7-35af-4278-a5cd-78c304929b76',4),('33333333-3333-3333-3333-333333333333',7),('b1d0c0d4-113c-4bd0-b49b-7c5041dbd250',17),('139a651e-a8c5-11f0-8760-baf7a760ec7e',20),('139a7a40-a8c5-11f0-8760-baf7a760ec7e',20),('139a7c70-a8c5-11f0-8760-baf7a760ec7e',20),('139a80f8-a8c5-11f0-8760-baf7a760ec7e',20),('b1d0c0d4-113c-4bd0-b49b-7c5041dbd250',20),('139a75a4-a8c5-11f0-8760-baf7a760ec7e',21),('139a7b80-a8c5-11f0-8760-baf7a760ec7e',21),('139a7eaa-a8c5-11f0-8760-baf7a760ec7e',21),('139a7a40-a8c5-11f0-8760-baf7a760ec7e',22),('139a7ff4-a8c5-11f0-8760-baf7a760ec7e',22),('139a651e-a8c5-11f0-8760-baf7a760ec7e',23),('139a7a40-a8c5-11f0-8760-baf7a760ec7e',23),('139a75a4-a8c5-11f0-8760-baf7a760ec7e',24),('139a7b80-a8c5-11f0-8760-baf7a760ec7e',25),('139a80f8-a8c5-11f0-8760-baf7a760ec7e',26),('139a75a4-a8c5-11f0-8760-baf7a760ec7e',27),('139a7eaa-a8c5-11f0-8760-baf7a760ec7e',27),('139a651e-a8c5-11f0-8760-baf7a760ec7e',28),('139a7c70-a8c5-11f0-8760-baf7a760ec7e',28),('139a7b80-a8c5-11f0-8760-baf7a760ec7e',29),('139a7ff4-a8c5-11f0-8760-baf7a760ec7e',29);
/*!40000 ALTER TABLE `DiscussionTopicTags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EmailVerificationTokens`
--

DROP TABLE IF EXISTS `EmailVerificationTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EmailVerificationTokens` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `UserId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `TokenHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UsedAt` datetime(6) DEFAULT NULL,
  `IsUsed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_EmailVerificationTokens_TokenHash` (`TokenHash`),
  KEY `IX_EmailVerificationTokens_UserId` (`UserId`),
  CONSTRAINT `FK_EmailVerificationTokens_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EmailVerificationTokens`
--

LOCK TABLES `EmailVerificationTokens` WRITE;
/*!40000 ALTER TABLE `EmailVerificationTokens` DISABLE KEYS */;
INSERT INTO `EmailVerificationTokens` VALUES ('613e6350-41a8-4f3b-b162-7aa194741f17','57b057ec-012b-48ec-905b-4abc0a9594aa','xmuHfQGQUlgdUa1gJidZQbDFZVeWlSCj+dWbBPDiwLM=','2025-10-11 12:02:06.804907','2025-10-10 12:02:06.804891','2025-10-10 12:02:41.202971',1),('7b0bf9a5-6b46-4310-8741-f5b20c001389','204480b7-8f40-428f-9cca-04670ecde8ce','2zjqdknqr8xdDtYfBk/1N2KJhviDrNCtDIkNpHDjMwY=','2025-10-12 04:35:46.199054','2025-10-11 04:35:46.199038',NULL,0),('97121f0c-17ba-4da1-901a-2cfa7788552b','e35a9145-d8f7-44cb-92cb-cf3a66f213f5','vahuWhRINUIzdA7uyKN5i4YaczEnAarj2FHl5A7OWdg=','2025-10-12 04:36:16.987896','2025-10-11 04:36:16.987896',NULL,0),('9afe85d5-c6a0-4f17-a4ea-d9700c377522','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','V7I0ovhNtOExAsPQ9tAoJb3ED9P4VJRbp3YmKV0tSr0=','2025-10-12 03:42:02.524358','2025-10-11 03:42:02.524342','2025-10-11 04:42:23.509903',1),('cd3c5ef1-683e-4433-aae7-85088a55f448','9ab5be04-3120-4182-8b1b-5f937e8d7079','Vno585bmDvlmeCW6eWAJAL6gM7RPSK1ehLTP/NOkdl4=','2025-10-15 04:08:35.327861','2025-10-14 04:08:35.327846',NULL,0);
/*!40000 ALTER TABLE `EmailVerificationTokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EventCategories`
--

DROP TABLE IF EXISTS `EventCategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EventCategories` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_EventCategories_Name` (`Name`),
  UNIQUE KEY `IX_EventCategories_Slug` (`Slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EventCategories`
--

LOCK TABLES `EventCategories` WRITE;
/*!40000 ALTER TABLE `EventCategories` DISABLE KEYS */;
INSERT INTO `EventCategories` VALUES ('66666666-6666-6666-6666-666666666666','Workshop','workshop','Hands-on workshops and training sessions','2025-10-27 09:12:48.000000'),('77777777-7777-7777-7777-777777777777','Seminar','seminar','Educational seminars and talks','2025-10-27 09:12:48.000000'),('88888888-8888-8888-8888-888888888888','Networking','networking','Networking events and meetups','2025-10-27 09:12:48.000000'),('99999999-9999-9999-9999-999999999999','Training','training','Professional training programs','2025-10-27 09:12:48.000000'),('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Social Event','social-event','Social gatherings and celebrations','2025-10-27 09:12:48.000000');
/*!40000 ALTER TABLE `EventCategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EventRegistrations`
--

DROP TABLE IF EXISTS `EventRegistrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EventRegistrations` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `EventId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `UserId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `Name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RegistrationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `Status` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_EventRegistrations_EventId_Email` (`EventId`,`Email`),
  KEY `IX_EventRegistrations_Email` (`Email`),
  KEY `IX_EventRegistrations_EventId` (`EventId`),
  KEY `IX_EventRegistrations_Status` (`Status`),
  KEY `IX_EventRegistrations_UserId` (`UserId`),
  CONSTRAINT `FK_EventRegistrations_Events_EventId` FOREIGN KEY (`EventId`) REFERENCES `Events` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_EventRegistrations_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EventRegistrations`
--

LOCK TABLES `EventRegistrations` WRITE;
/*!40000 ALTER TABLE `EventRegistrations` DISABLE KEYS */;
INSERT INTO `EventRegistrations` VALUES ('7418f525-c4e1-49df-92f6-02bae677730f','917e1bda-2f39-4439-b2a9-93d926b24f68',NULL,'Sonam Norbu','mrnorbu@gmail.com','06297962863','2025-10-27 11:30:54.840237',0);
/*!40000 ALTER TABLE `EventRegistrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CategoryId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `Location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `EventDate` datetime(6) NOT NULL,
  `EventEndDate` datetime(6) DEFAULT NULL,
  `ImageUrl` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ThumbnailUrl` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Capacity` int DEFAULT NULL,
  `RegistrationDeadline` datetime(6) DEFAULT NULL,
  `CreatedById` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Status` int NOT NULL,
  `PublishedAt` datetime(6) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `UpdatedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Events_CategoryId` (`CategoryId`),
  KEY `IX_Events_CreatedById` (`CreatedById`),
  KEY `IX_Events_EventDate` (`EventDate`),
  KEY `IX_Events_Status` (`Status`),
  CONSTRAINT `FK_Events_EventCategories_CategoryId` FOREIGN KEY (`CategoryId`) REFERENCES `EventCategories` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `FK_Events_Users_CreatedById` FOREIGN KEY (`CreatedById`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES ('3af7b0c1-948f-4f26-bfec-6176e355f9ee','Mountain Safety Workshop','Comprehensive mountain safety workshop covering essential skills for high-altitude expeditions. Topics include risk assessment, emergency response, first aid, and rescue techniques. Led by experienced mountaineers and safety experts. Suitable for both beginners and experienced climbers looking to refresh their skills.','66666666-6666-6666-6666-666666666666','Training Center, Manali','2026-01-20 11:00:06.000000','2026-01-22 11:00:06.000000','images/event2.jpg','images/event2.jpg',30,'2026-01-10 11:00:06.000000','af33f3f4-0aea-4621-9722-1fedd1830e1b',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL),('917e1bda-2f39-4439-b2a9-93d926b24f68','Adventure Workshop 2025','Join us for an exciting adventure workshop covering rock climbing, trekking, and wilderness survival skills. Perfect for beginners and experienced adventurers alike!','66666666-6666-6666-6666-666666666666','IHCAE Campus, Chemchey','2025-11-15 09:00:00.000000',NULL,NULL,NULL,30,NULL,'af33f3f4-0aea-4621-9722-1fedd1830e1b',2,'2025-10-27 09:52:50.643398','2025-10-27 09:52:50.643486',NULL),('977f0d8a-be21-425d-9cb9-d54c0567b8c4','Eco-Tourism Conference 2024','Annual conference on sustainable tourism practices in the Himalayan region. Join industry leaders, researchers, and practitioners to discuss innovative approaches to eco-tourism. Topics include community-based tourism, environmental conservation, and sustainable business models. Network with professionals and learn about the latest trends in sustainable tourism.','77777777-7777-7777-7777-777777777777','Conference Hall, Gangtok','2026-03-11 11:00:06.000000','2026-03-13 11:00:06.000000','images/event3.jpg','images/event3.jpg',200,'2026-03-01 11:00:06.000000','af33f3f4-0aea-4621-9722-1fedd1830e1b',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL),('ba2cc1a2-7ec9-4f16-acc1-e66236dfa223','Conservation Workshop: Protecting Himalayan Wildlife','Hands-on workshop on wildlife conservation techniques and community engagement strategies. Learn about the unique biodiversity of the Himalayan region and practical approaches to conservation. Field visits to local conservation projects included. Suitable for students, professionals, and anyone interested in wildlife conservation.','66666666-6666-6666-6666-666666666666','Wildlife Sanctuary, Sikkim','2026-05-12 11:00:06.000000','2026-05-14 11:00:06.000000','images/event5.jpg','images/event5.jpg',45,'2026-05-02 11:00:06.000000','af33f3f4-0aea-4621-9722-1fedd1830e1b',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL),('d2ed001d-64ac-4210-aeb4-63bc9446bd01','Annual Alumni Reunion 2024','Join us for the Annual Alumni Reunion 2024 at IHCAE Campus. Reconnect with old friends, network with fellow alumni, and celebrate our shared experiences. The event will feature guest speakers, cultural performances, and a gala dinner. This is a wonderful opportunity to strengthen our alumni community and share success stories.','88888888-8888-8888-8888-888888888888','IHCAE Campus, Sikkim','2026-02-24 11:00:06.000000','2026-02-25 11:00:06.000000','images/event1.jpg','images/event1.jpg',150,'2026-02-14 11:00:06.000000','af33f3f4-0aea-4621-9722-1fedd1830e1b',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL),('fe225b93-8a90-4493-8b36-57ae1c565978','Adventure Sports Competition','Annual adventure sports competition featuring rock climbing, rappelling, and mountain biking. Open to all skill levels with separate categories for beginners and advanced participants. Prizes for winners and participation certificates for all. A great opportunity to test your skills and meet fellow adventure enthusiasts.','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Adventure Sports Complex, Sikkim','2026-04-05 11:00:06.000000','2026-04-06 11:00:06.000000','images/event4.jpg','images/event4.jpg',75,'2026-03-26 11:00:06.000000','af33f3f4-0aea-4621-9722-1fedd1830e1b',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL),('fe71b774-8704-47a3-b2b3-7fac0bba27da','Sustainable Tourism Summit','Two-day summit bringing together tourism professionals, policymakers, and community leaders to discuss sustainable tourism development. Topics include responsible tourism practices, cultural preservation, and economic benefits for local communities. Keynote speakers from international organizations and panel discussions on best practices.','77777777-7777-7777-7777-777777777777','Hotel Mount View, Gangtok','2026-06-17 11:00:06.000000','2026-06-18 11:00:06.000000','images/event6.jpg','images/event6.jpg',120,'2026-06-07 11:00:06.000000','af33f3f4-0aea-4621-9722-1fedd1830e1b',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL);
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ForumPosts`
--

DROP TABLE IF EXISTS `ForumPosts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ForumPosts` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TopicId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `AuthorId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `ParentPostId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `DeletedAt` datetime(6) DEFAULT NULL,
  `DeletedBy` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `DeletionReason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`),
  KEY `IX_ForumPosts_AuthorId` (`AuthorId`),
  KEY `IX_ForumPosts_CreatedAt` (`CreatedAt`),
  KEY `IX_ForumPosts_ParentPostId` (`ParentPostId`),
  KEY `IX_ForumPosts_TopicId` (`TopicId`),
  CONSTRAINT `FK_ForumPosts_DiscussionTopics_TopicId` FOREIGN KEY (`TopicId`) REFERENCES `DiscussionTopics` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_ForumPosts_ForumPosts_ParentPostId` FOREIGN KEY (`ParentPostId`) REFERENCES `ForumPosts` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_ForumPosts_Users_AuthorId` FOREIGN KEY (`AuthorId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ForumPosts`
--

LOCK TABLES `ForumPosts` WRITE;
/*!40000 ALTER TABLE `ForumPosts` DISABLE KEYS */;
INSERT INTO `ForumPosts` VALUES ('139bc10c-a8c5-11f0-8760-baf7a760ec7e','I\'ve completed the Everest Base Camp trek three times and wanted to share the best routes and tips for fellow alumni. The classic route through Lukla is still the most popular, but the Jiri route offers a more authentic experience with gradual altitude gain.','139a651e-a8c5-11f0-8760-baf7a760ec7e','204480b7-8f40-428f-9cca-04670ecde8ce',NULL,'2025-10-09 11:44:43.000000','2025-10-12 11:44:43.000000',NULL,NULL,NULL,0),('139bd660-a8c5-11f0-8760-baf7a760ec7e','Sikkim has incredible biodiversity, but climate change and tourism pressure are affecting wildlife habitats. I\'m working with local conservation groups and would love to hear from other alumni involved in similar projects.','139a75a4-a8c5-11f0-8760-baf7a760ec7e','204480b7-8f40-428f-9cca-04670ecde8ce',NULL,'2025-10-10 11:44:43.000000','2025-10-13 11:44:43.000000',NULL,NULL,NULL,0),('139bd9b2-a8c5-11f0-8760-baf7a760ec7e','Last month I completed my first Himalayan expedition to Annapurna Base Camp. It was life-changing! The views were incredible, but I learned so much about preparation, altitude sickness, and respecting local cultures. Would love to share experiences with others.','139a7a40-a8c5-11f0-8760-baf7a760ec7e','11111111-1111-1111-1111-111111111111',NULL,'2025-10-11 11:44:43.000000','2025-10-14 11:44:43.000000',NULL,NULL,NULL,0),('139bdd9a-a8c5-11f0-8760-baf7a760ec7e','As tourism grows in the Himalayas, we need to ensure it benefits local communities while protecting the environment. I\'ve been researching sustainable tourism models and would appreciate input from alumni working in this field.','139a7b80-a8c5-11f0-8760-baf7a760ec7e','11111111-1111-1111-1111-111111111111',NULL,'2025-10-12 11:44:43.000000','2025-10-14 11:44:43.000000',NULL,NULL,NULL,0),('139be5c4-a8c5-11f0-8760-baf7a760ec7e','Safety should be everyone\'s top priority in the mountains. I\'ve compiled essential safety tips based on my 10+ years of mountaineering experience. This includes weather awareness, equipment checks, and emergency protocols.','139a7c70-a8c5-11f0-8760-baf7a760ec7e','22222222-2222-2222-2222-222222222222',NULL,'2025-10-13 11:44:43.000000','2025-10-14 11:44:43.000000',NULL,NULL,NULL,0),('139be790-a8c5-11f0-8760-baf7a760ec7e','The Himalayas are experiencing rapid climate change. Glaciers are retreating, weather patterns are shifting, and local communities are adapting. I\'m documenting these changes and would love to collaborate with other alumni on climate research.','139a7eaa-a8c5-11f0-8760-baf7a760ec7e','22222222-2222-2222-2222-222222222222',NULL,'2025-10-14 05:44:43.000000','2025-10-14 11:44:43.000000',NULL,NULL,NULL,0),('139bec68-a8c5-11f0-8760-baf7a760ec7e','Working with local communities in the Himalayas has taught me the importance of sustainable development. We\'re focusing on education, healthcare, and economic opportunities that respect traditional ways of life.','139a7ff4-a8c5-11f0-8760-baf7a760ec7e','33333333-3333-3333-3333-333333333333',NULL,'2025-10-14 08:44:43.000000','2025-10-14 11:44:43.000000',NULL,NULL,NULL,0),('139bef74-a8c5-11f0-8760-baf7a760ec7e','Quality equipment can make or break your adventure experience. I\'ve tested various gear over the years and want to share recommendations for different activities and budgets. What\'s your go-to equipment?','139a80f8-a8c5-11f0-8760-baf7a760ec7e','33333333-3333-3333-3333-333333333333',NULL,'2025-10-14 10:44:43.000000','2025-10-14 11:44:43.000000',NULL,NULL,NULL,0),('139c9546-a8c5-11f0-8760-baf7a760ec7e','Great post! I did the Jiri route last year and it was amazing. The gradual acclimatization really helped. How long did your trek take?','139a651e-a8c5-11f0-8760-baf7a760ec7e','11111111-1111-1111-1111-111111111111','139bc10c-a8c5-11f0-8760-baf7a760ec7e','2025-10-10 11:44:43.000000','2025-10-10 11:44:43.000000',NULL,NULL,NULL,0),('139c9cd0-a8c5-11f0-8760-baf7a760ec7e','I\'m planning my first EBC trek next month. Any recommendations for training beforehand?','139a651e-a8c5-11f0-8760-baf7a760ec7e','22222222-2222-2222-2222-222222222222','139bc10c-a8c5-11f0-8760-baf7a760ec7e','2025-10-11 11:44:43.000000','2025-10-11 11:44:43.000000',NULL,NULL,NULL,0),('139c9f00-a8c5-11f0-8760-baf7a760ec7e','The Jiri route took us 18 days including rest days. For training, focus on cardio and leg strength. Stair climbing with a weighted pack is excellent preparation!','139a651e-a8c5-11f0-8760-baf7a760ec7e','204480b7-8f40-428f-9cca-04670ecde8ce','139bc10c-a8c5-11f0-8760-baf7a760ec7e','2025-10-12 11:44:43.000000','2025-10-12 11:44:43.000000',NULL,NULL,NULL,0),('139ca09a-a8c5-11f0-8760-baf7a760ec7e','I\'m working on a snow leopard conservation project in Ladakh. Would love to collaborate and share best practices!','139a75a4-a8c5-11f0-8760-baf7a760ec7e','33333333-3333-3333-3333-333333333333','139bd660-a8c5-11f0-8760-baf7a760ec7e','2025-10-11 11:44:43.000000','2025-10-11 11:44:43.000000',NULL,NULL,NULL,0),('139ca32e-a8c5-11f0-8760-baf7a760ec7e','The red panda population in Sikkim is particularly vulnerable. Are you working with any specific species?','139a75a4-a8c5-11f0-8760-baf7a760ec7e','44444444-4444-4444-4444-444444444444','139bd660-a8c5-11f0-8760-baf7a760ec7e','2025-10-12 11:44:43.000000','2025-10-12 11:44:43.000000',NULL,NULL,NULL,0),('139ca554-a8c5-11f0-8760-baf7a760ec7e','Congratulations on your first expedition! ABC is a fantastic choice. The sunrise from base camp is unforgettable.','139a7a40-a8c5-11f0-8760-baf7a760ec7e','55555555-5555-5555-5555-555555555555','139bd9b2-a8c5-11f0-8760-baf7a760ec7e','2025-10-12 11:44:43.000000','2025-10-12 11:44:43.000000',NULL,NULL,NULL,0),('139ca6da-a8c5-11f0-8760-baf7a760ec7e','Altitude sickness is no joke. What symptoms did you experience and how did you manage them?','139a7a40-a8c5-11f0-8760-baf7a760ec7e','66666666-6666-6666-6666-666666666666','139bd9b2-a8c5-11f0-8760-baf7a760ec7e','2025-10-13 11:44:43.000000','2025-10-13 11:44:43.000000',NULL,NULL,NULL,0),('139ca900-a8c5-11f0-8760-baf7a760ec7e','Excellent safety tips! I\'d add: always inform someone of your route and expected return time.','139a7c70-a8c5-11f0-8760-baf7a760ec7e','77777777-7777-7777-7777-777777777777','139be5c4-a8c5-11f0-8760-baf7a760ec7e','2025-10-13 23:44:43.000000','2025-10-13 23:44:43.000000',NULL,NULL,NULL,0),('139caa86-a8c5-11f0-8760-baf7a760ec7e','Weather can change rapidly in the mountains. What\'s your go-to weather app or resource?','139a7c70-a8c5-11f0-8760-baf7a760ec7e','88888888-8888-8888-8888-888888888888','139be5c4-a8c5-11f0-8760-baf7a760ec7e','2025-10-14 05:44:43.000000','2025-10-14 05:44:43.000000',NULL,NULL,NULL,0),('37e8c05e-b5f0-43f8-a8ad-4b558e9a14c3','This is a test topic created via API. Check out https://github.com for more information!','637d5192-c959-4d72-8e33-2ebfb2eeb497','9ab5be04-3120-4182-8b1b-5f937e8d7079',NULL,'2025-10-14 04:10:00.157956',NULL,NULL,NULL,NULL,0),('67727960-14a6-4344-a2b3-eb68031d8ab2','Sharing some career development tips for alumni.','d71556a7-35af-4278-a5cd-78c304929b76','af33f3f4-0aea-4621-9722-1fedd1830e1b',NULL,'2025-10-14 04:49:10.441097',NULL,NULL,NULL,NULL,0),('6fd41018-a0e4-427f-a519-09fa7c90e2c8','Hi, is it wokring ?','d49fe208-a8c4-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','d4a1d784-a8c4-11f0-8760-baf7a760ec7e','2025-10-27 06:04:15.413506',NULL,NULL,NULL,NULL,0),('7baed72a-5e02-414f-ab4a-007cec47d636','Not yet but will do','d49fe208-a8c4-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','d4a2493a-a8c4-11f0-8760-baf7a760ec7e','2025-10-27 06:17:53.918445',NULL,NULL,NULL,NULL,0),('7d9a0464-ae28-4857-adc6-561cbababa3e','OK we go','d49fe208-a8c4-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','d4a1d784-a8c4-11f0-8760-baf7a760ec7e','2025-10-14 14:46:09.989954',NULL,NULL,NULL,NULL,0),('8cf1a354-374a-44f5-bcc6-3aef36fd4c24','Hi< is this OK','139a651e-a8c5-11f0-8760-baf7a760ec7e','af33f3f4-0aea-4621-9722-1fedd1830e1b',NULL,'2025-10-14 07:50:07.218197',NULL,NULL,NULL,NULL,0),('97d5d870-9676-4f9b-85ba-2e5ba5d05ed2','ok','d49fe208-a8c4-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','d4a1d784-a8c4-11f0-8760-baf7a760ec7e','2026-03-15 07:57:58.002389',NULL,NULL,NULL,NULL,0),('9819c919-49c5-43d3-a1f8-603b0f50ae45','I would like to do the same','d49fe208-a8c4-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','d4a2493a-a8c4-11f0-8760-baf7a760ec7e','2025-10-27 06:16:06.215976',NULL,NULL,NULL,NULL,0),('a70a4cb0-6896-4e86-b21c-ad3dbed38c10','here','139a651e-a8c5-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','8cf1a354-374a-44f5-bcc6-3aef36fd4c24','2025-10-14 08:05:14.419878',NULL,'2025-10-27 08:16:29.472897',NULL,NULL,1),('be94305b-e883-4eba-bbc9-f9861d134528','PLease tell me where should I go ','b1d0c0d4-113c-4bd0-b49b-7c5041dbd250','ef3379e2-ecf6-4c26-83aa-7d3dd442549a',NULL,'2025-10-27 08:17:17.073989',NULL,NULL,NULL,NULL,0),('c8565cdf-29c8-41d6-ae0a-7899c4c3472b','This is a test topic to verify the tagging system works correctly.','72d5d0c3-75d7-4cfc-9fea-f887022dacf5','af33f3f4-0aea-4621-9722-1fedd1830e1b',NULL,'2025-10-14 04:48:12.929981',NULL,NULL,NULL,NULL,0),('cae00ddc-d6a2-47fa-b4b2-ccc51b3bfbca','Is this the same community ?','139a7ff4-a8c5-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','139bec68-a8c5-11f0-8760-baf7a760ec7e','2025-10-27 07:33:43.816475',NULL,'2025-10-27 08:16:17.525662',NULL,NULL,1),('d4a1d784-a8c4-11f0-8760-baf7a760ec7e','I\'ve completed the Everest Base Camp trek three times and wanted to share the best routes and tips for fellow alumni. The classic route through Lukla is still the most popular, but the Jiri route offers a more authentic experience with gradual altitude gain.','d49fe208-a8c4-11f0-8760-baf7a760ec7e','204480b7-8f40-428f-9cca-04670ecde8ce',NULL,'2025-10-09 11:42:58.000000','2025-10-12 11:42:58.000000',NULL,NULL,NULL,0),('d4a1e7ba-a8c4-11f0-8760-baf7a760ec7e','Sikkim has incredible biodiversity, but climate change and tourism pressure are affecting wildlife habitats. I\'m working with local conservation groups and would love to hear from other alumni involved in similar projects.','d4a0adaa-a8c4-11f0-8760-baf7a760ec7e','204480b7-8f40-428f-9cca-04670ecde8ce',NULL,'2025-10-10 11:42:58.000000','2025-10-13 11:42:58.000000',NULL,NULL,NULL,0),('d4a1e8dc-a8c4-11f0-8760-baf7a760ec7e','Last month I completed my first Himalayan expedition to Annapurna Base Camp. It was life-changing! The views were incredible, but I learned so much about preparation, altitude sickness, and respecting local cultures. Would love to share experiences with others.','d4a0aea4-a8c4-11f0-8760-baf7a760ec7e','11111111-1111-1111-1111-111111111111',NULL,'2025-10-11 11:42:58.000000','2025-10-14 11:42:58.000000',NULL,NULL,NULL,0),('d4a1e990-a8c4-11f0-8760-baf7a760ec7e','As tourism grows in the Himalayas, we need to ensure it benefits local communities while protecting the environment. I\'ve been researching sustainable tourism models and would appreciate input from alumni working in this field.','d4a0af26-a8c4-11f0-8760-baf7a760ec7e','11111111-1111-1111-1111-111111111111',NULL,'2025-10-12 11:42:58.000000','2025-10-14 11:42:58.000000',NULL,NULL,NULL,0),('d4a1ea30-a8c4-11f0-8760-baf7a760ec7e','Safety should be everyone\'s top priority in the mountains. I\'ve compiled essential safety tips based on my 10+ years of mountaineering experience. This includes weather awareness, equipment checks, and emergency protocols.','d4a0af94-a8c4-11f0-8760-baf7a760ec7e','22222222-2222-2222-2222-222222222222',NULL,'2025-10-13 11:42:58.000000','2025-10-14 11:42:58.000000',NULL,NULL,NULL,0),('d4a1eac6-a8c4-11f0-8760-baf7a760ec7e','The Himalayas are experiencing rapid climate change. Glaciers are retreating, weather patterns are shifting, and local communities are adapting. I\'m documenting these changes and would love to collaborate with other alumni on climate research.','d4a0aff8-a8c4-11f0-8760-baf7a760ec7e','22222222-2222-2222-2222-222222222222',NULL,'2025-10-14 05:42:58.000000','2025-10-14 11:42:58.000000',NULL,NULL,NULL,0),('d4a1eb5c-a8c4-11f0-8760-baf7a760ec7e','Working with local communities in the Himalayas has taught me the importance of sustainable development. We\'re focusing on education, healthcare, and economic opportunities that respect traditional ways of life.','d4a0b066-a8c4-11f0-8760-baf7a760ec7e','33333333-3333-3333-3333-333333333333',NULL,'2025-10-14 08:42:58.000000','2025-10-14 11:42:58.000000',NULL,NULL,NULL,0),('d4a1ebf2-a8c4-11f0-8760-baf7a760ec7e','Quality equipment can make or break your adventure experience. I\'ve tested various gear over the years and want to share recommendations for different activities and budgets. What\'s your go-to equipment?','d4a0b0fc-a8c4-11f0-8760-baf7a760ec7e','33333333-3333-3333-3333-333333333333',NULL,'2025-10-14 10:42:58.000000','2025-10-14 11:42:58.000000',NULL,NULL,NULL,0),('d4a2493a-a8c4-11f0-8760-baf7a760ec7e','Great post! I did the Jiri route last year and it was amazing. The gradual acclimatization really helped. How long did your trek take?','d49fe208-a8c4-11f0-8760-baf7a760ec7e','11111111-1111-1111-1111-111111111111','d4a1d784-a8c4-11f0-8760-baf7a760ec7e','2025-10-10 11:42:58.000000','2025-10-10 11:42:58.000000',NULL,NULL,NULL,0),('d4a252ea-a8c4-11f0-8760-baf7a760ec7e','I\'m planning my first EBC trek next month. Any recommendations for training beforehand?','d49fe208-a8c4-11f0-8760-baf7a760ec7e','22222222-2222-2222-2222-222222222222','d4a1d784-a8c4-11f0-8760-baf7a760ec7e','2025-10-11 11:42:58.000000','2025-10-11 11:42:58.000000',NULL,NULL,NULL,0),('d4a28472-a8c4-11f0-8760-baf7a760ec7e','The Jiri route took us 18 days including rest days. For training, focus on cardio and leg strength. Stair climbing with a weighted pack is excellent preparation!','d49fe208-a8c4-11f0-8760-baf7a760ec7e','204480b7-8f40-428f-9cca-04670ecde8ce','d4a1d784-a8c4-11f0-8760-baf7a760ec7e','2025-10-12 11:42:58.000000','2025-10-12 11:42:58.000000',NULL,NULL,NULL,0),('d4a2853a-a8c4-11f0-8760-baf7a760ec7e','I\'m working on a snow leopard conservation project in Ladakh. Would love to collaborate and share best practices!','d4a0adaa-a8c4-11f0-8760-baf7a760ec7e','33333333-3333-3333-3333-333333333333','d4a1e7ba-a8c4-11f0-8760-baf7a760ec7e','2025-10-11 11:42:58.000000','2025-10-11 11:42:58.000000',NULL,NULL,NULL,0),('d4a285ee-a8c4-11f0-8760-baf7a760ec7e','The red panda population in Sikkim is particularly vulnerable. Are you working with any specific species?','d4a0adaa-a8c4-11f0-8760-baf7a760ec7e','44444444-4444-4444-4444-444444444444','d4a1e7ba-a8c4-11f0-8760-baf7a760ec7e','2025-10-12 11:42:58.000000','2025-10-12 11:42:58.000000',NULL,NULL,NULL,0),('d4a286a2-a8c4-11f0-8760-baf7a760ec7e','Congratulations on your first expedition! ABC is a fantastic choice. The sunrise from base camp is unforgettable.','d4a0aea4-a8c4-11f0-8760-baf7a760ec7e','55555555-5555-5555-5555-555555555555','d4a1e8dc-a8c4-11f0-8760-baf7a760ec7e','2025-10-12 11:42:58.000000','2025-10-12 11:42:58.000000',NULL,NULL,NULL,0),('d4a28742-a8c4-11f0-8760-baf7a760ec7e','Altitude sickness is no joke. What symptoms did you experience and how did you manage them?','d4a0aea4-a8c4-11f0-8760-baf7a760ec7e','66666666-6666-6666-6666-666666666666','d4a1e8dc-a8c4-11f0-8760-baf7a760ec7e','2025-10-13 11:42:58.000000','2025-10-13 11:42:58.000000',NULL,NULL,NULL,0),('d4a287d8-a8c4-11f0-8760-baf7a760ec7e','Excellent safety tips! I\'d add: always inform someone of your route and expected return time.','d4a0af94-a8c4-11f0-8760-baf7a760ec7e','77777777-7777-7777-7777-777777777777','d4a1ea30-a8c4-11f0-8760-baf7a760ec7e','2025-10-13 23:42:58.000000','2025-10-13 23:42:58.000000',NULL,NULL,NULL,0),('d4a28878-a8c4-11f0-8760-baf7a760ec7e','Weather can change rapidly in the mountains. What\'s your go-to weather app or resource?','d4a0af94-a8c4-11f0-8760-baf7a760ec7e','88888888-8888-8888-8888-888888888888','d4a1ea30-a8c4-11f0-8760-baf7a760ec7e','2025-10-14 05:42:58.000000','2025-10-14 05:42:58.000000',NULL,NULL,NULL,0),('ece1ff53-7270-467e-87f9-de07b1c327bc','OK','d49fe208-a8c4-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','d4a1d784-a8c4-11f0-8760-baf7a760ec7e','2025-10-14 14:48:29.419855',NULL,NULL,NULL,NULL,0),('ee0fd659-1a8b-43fe-a6c0-d7a6ca3679cd','Jiri Jiri','d49fe208-a8c4-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','d4a2493a-a8c4-11f0-8760-baf7a760ec7e','2025-10-27 06:22:44.390459',NULL,NULL,NULL,NULL,0),('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','Our company is hiring! We have several positions open for software developers. Check out our careers page at https://company.com/careers for more details.','33333333-3333-3333-3333-333333333333','9ab5be04-3120-4182-8b1b-5f937e8d7079',NULL,'2025-10-14 09:39:33.000000',NULL,NULL,NULL,NULL,0),('fa0f81fc-e5f8-4039-8858-233e8eded4af','OK','139a7ff4-a8c5-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','139bec68-a8c5-11f0-8760-baf7a760ec7e','2025-10-27 07:31:41.280513',NULL,'2025-10-27 08:16:20.587813',NULL,NULL,1),('fc9d0949-24e4-416b-a554-0661678a996a','OK','d49fe208-a8c4-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','d4a2493a-a8c4-11f0-8760-baf7a760ec7e','2025-10-27 06:18:54.065263',NULL,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `ForumPosts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NewsArticles`
--

DROP TABLE IF EXISTS `NewsArticles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NewsArticles` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Excerpt` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CategoryId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `AuthorId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `ImageUrl` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ThumbnailUrl` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Status` int NOT NULL,
  `PublishedAt` datetime(6) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `ViewCount` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`),
  KEY `IX_NewsArticles_AuthorId` (`AuthorId`),
  KEY `IX_NewsArticles_CategoryId` (`CategoryId`),
  KEY `IX_NewsArticles_PublishedAt` (`PublishedAt`),
  KEY `IX_NewsArticles_Status` (`Status`),
  CONSTRAINT `FK_NewsArticles_NewsCategories_CategoryId` FOREIGN KEY (`CategoryId`) REFERENCES `NewsCategories` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_NewsArticles_Users_AuthorId` FOREIGN KEY (`AuthorId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NewsArticles`
--

LOCK TABLES `NewsArticles` WRITE;
/*!40000 ALTER TABLE `NewsArticles` DISABLE KEYS */;
INSERT INTO `NewsArticles` VALUES ('205b9665-80b1-4ff9-ad1e-4159cfc8dae0','Sikkim Alumni Summit 2024','Over 200 alumni from the Eastern Himalayas gathered in Gangtok to share experiences and plan future conservation projects. The three-day summit featured keynote speeches from industry leaders, panel discussions on sustainable tourism, and networking sessions. Participants discussed innovative approaches to eco-tourism, community engagement, and preserving the unique cultural heritage of the Himalayan region.','Over 200 alumni from the Eastern Himalayas gathered in Gangtok to share experiences and plan future conservation projects.','11111111-1111-1111-1111-111111111111','af33f3f4-0aea-4621-9722-1fedd1830e1b','/uploads/content/news/news2.jpg','/uploads/content/news/news2.jpg',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL,190),('55bf813c-8ea3-4346-8cd7-40fac8f5b627','Kanchenjunga Cleanup Initiative','Alumni-led project successfully removes 2 tons of waste from Kanchenjunga Base Camp, setting new standards for sustainable mountaineering in Sikkim. The initiative involved 25 volunteers who spent two weeks collecting and properly disposing of waste left by previous expeditions. This groundbreaking effort demonstrates the commitment of IHCAE alumni to environmental conservation and sustainable tourism practices in the Himalayan region.','Alumni-led project removes 2 tons of waste from Kanchenjunga Base Camp, setting new standards for sustainable mountaineering in Sikkim.','44444444-4444-4444-4444-444444444444','af33f3f4-0aea-4621-9722-1fedd1830e1b','/uploads/content/news/news1.jpg','/uploads/content/news/news1.jpg',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL,248),('8426fc50-a8a9-4f28-98ad-07766d48c8c3','Welcome to IHCAE Alumni Network','We are excited to announce the launch of our new alumni network platform. This platform will help you stay connected with fellow alumni, discover career opportunities, and participate in exciting events.','We are excited to announce the launch of our new alumni network platform. This platform will help you stay connected with fellow alumni, discover career opportunities, and participate in exciting even...','11111111-1111-1111-1111-111111111111','af33f3f4-0aea-4621-9722-1fedd1830e1b',NULL,NULL,2,'2025-10-27 09:52:01.049310','2025-10-27 09:52:01.049414',NULL,1),('8d704b83-36c4-453d-be90-f62130fc0260','From Student to Mountain Guide: Rajesh Kumar\'s Journey','Rajesh Kumar overcame numerous challenges to become a certified mountain guide, now leading expeditions across the Himalayas. Growing up in a small village in Sikkim, Rajesh dreamed of exploring the mountains. After graduating from IHCAE, he worked tirelessly to gain certifications and experience. Today, he runs his own adventure tourism company, employing local guides and promoting sustainable tourism practices. His story inspires many young people from rural areas to pursue their dreams in adventure tourism.','Rajesh Kumar overcame challenges to become a certified mountain guide, now leading expeditions across the Himalayas.','33333333-3333-3333-3333-333333333333','af33f3f4-0aea-4621-9722-1fedd1830e1b','/uploads/content/news/news1.jpg','/uploads/content/news/news1.jpg',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL,429),('b419d032-fb3b-4928-9b69-14ae61bc71b8','First All-Female Team Summits Kanchenjunga','IHCAE graduates lead historic Kanchenjunga expedition, demonstrating leadership skills and technical expertise. The team of six women successfully reached the summit after weeks of preparation and acclimatization. This achievement marks a significant milestone in promoting gender equality in mountaineering and adventure sports. The team members shared their experiences and inspired young women to pursue careers in adventure tourism and mountain guiding.','IHCAE graduates lead historic Kanchenjunga expedition, demonstrating leadership skills and technical expertise.','44444444-4444-4444-4444-444444444444','af33f3f4-0aea-4621-9722-1fedd1830e1b','/uploads/content/news/news3.jpg','/uploads/content/news/news3.jpg',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL,313),('d8a6d15e-fc05-4a99-8f90-e49f7b857b55','Conservation Success: Priya Sharma\'s Snow Leopard Project','Priya Sharma led a conservation project that increased snow leopard population by 30% in the region. After completing her studies at IHCAE, Priya dedicated herself to wildlife conservation. She worked with local communities to reduce human-wildlife conflict and established a successful community-based conservation program. Her innovative approach combines scientific research with traditional knowledge, creating sustainable solutions for wildlife protection. The project has become a model for conservation efforts across the Himalayas.','Priya Sharma led a conservation project that increased snow leopard population by 30% in the region.','33333333-3333-3333-3333-333333333333','af33f3f4-0aea-4621-9722-1fedd1830e1b','/uploads/content/news/news2.jpg','/uploads/content/news/news2.jpg',2,'2025-10-27 11:00:06.000000','2025-10-27 11:00:06.000000',NULL,357);
/*!40000 ALTER TABLE `NewsArticles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NewsCategories`
--

DROP TABLE IF EXISTS `NewsCategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NewsCategories` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_NewsCategories_Name` (`Name`),
  UNIQUE KEY `IX_NewsCategories_Slug` (`Slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NewsCategories`
--

LOCK TABLES `NewsCategories` WRITE;
/*!40000 ALTER TABLE `NewsCategories` DISABLE KEYS */;
INSERT INTO `NewsCategories` VALUES ('11111111-1111-1111-1111-111111111111','General News','general-news','General news and updates about IHCAE','2025-10-27 09:12:48.000000'),('22222222-2222-2222-2222-222222222222','Announcement','announcement','Official announcements and notices','2025-10-27 09:12:48.000000'),('33333333-3333-3333-3333-333333333333','Success Story','success-story','Alumni success stories and achievements','2025-10-27 09:12:48.000000'),('44444444-4444-4444-4444-444444444444','Achievement','achievement','Notable achievements and milestones','2025-10-27 09:12:48.000000'),('55555555-5555-5555-5555-555555555555','Alumni Spotlight','alumni-spotlight','Featured alumni profiles and interviews','2025-10-27 09:12:48.000000');
/*!40000 ALTER TABLE `NewsCategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PasswordResetTokens`
--

DROP TABLE IF EXISTS `PasswordResetTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PasswordResetTokens` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `UserId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `TokenHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UsedAt` datetime(6) DEFAULT NULL,
  `IsUsed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_PasswordResetTokens_TokenHash` (`TokenHash`),
  KEY `IX_PasswordResetTokens_UserId` (`UserId`),
  CONSTRAINT `FK_PasswordResetTokens_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PasswordResetTokens`
--

LOCK TABLES `PasswordResetTokens` WRITE;
/*!40000 ALTER TABLE `PasswordResetTokens` DISABLE KEYS */;
INSERT INTO `PasswordResetTokens` VALUES ('2238b6dc-64cf-46ee-8b3b-577eb72bcea4','57b057ec-012b-48ec-905b-4abc0a9594aa','XoR2Dl6Ut6UdWE6uvAawe+HkTILQuzovdCFfjPtk/pM=','2025-10-11 03:49:06.806429','2025-10-11 02:49:06.806413','2025-10-11 02:49:38.680991',1),('582f0a93-d079-4a7a-ae6e-5056e25346c1','57b057ec-012b-48ec-905b-4abc0a9594aa','k1WAnAKpYN6ZVMGPEEPXAFbK8m8EEuKU0k93mwL19SQ=','2025-10-11 04:40:25.906805','2025-10-11 03:40:25.906805',NULL,0);
/*!40000 ALTER TABLE `PasswordResetTokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PostLikes`
--

DROP TABLE IF EXISTS `PostLikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PostLikes` (
  `PostId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `UserId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`PostId`,`UserId`),
  KEY `IX_PostLikes_UserId` (`UserId`),
  CONSTRAINT `FK_PostLikes_ForumPosts_PostId` FOREIGN KEY (`PostId`) REFERENCES `ForumPosts` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_PostLikes_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PostLikes`
--

LOCK TABLES `PostLikes` WRITE;
/*!40000 ALTER TABLE `PostLikes` DISABLE KEYS */;
INSERT INTO `PostLikes` VALUES ('139bc10c-a8c5-11f0-8760-baf7a760ec7e','11111111-1111-1111-1111-111111111111','2025-10-10 11:44:43.000000'),('139bc10c-a8c5-11f0-8760-baf7a760ec7e','22222222-2222-2222-2222-222222222222','2025-10-11 11:44:43.000000'),('139bc10c-a8c5-11f0-8760-baf7a760ec7e','33333333-3333-3333-3333-333333333333','2025-10-12 11:44:43.000000'),('139bc10c-a8c5-11f0-8760-baf7a760ec7e','44444444-4444-4444-4444-444444444444','2025-10-13 11:44:43.000000'),('139bc10c-a8c5-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','2025-10-27 06:53:56.604076'),('139bd660-a8c5-11f0-8760-baf7a760ec7e','11111111-1111-1111-1111-111111111111','2025-10-11 11:44:43.000000'),('139bd660-a8c5-11f0-8760-baf7a760ec7e','33333333-3333-3333-3333-333333333333','2025-10-12 11:44:43.000000'),('139bd660-a8c5-11f0-8760-baf7a760ec7e','55555555-5555-5555-5555-555555555555','2025-10-13 11:44:43.000000'),('139bd9b2-a8c5-11f0-8760-baf7a760ec7e','204480b7-8f40-428f-9cca-04670ecde8ce','2025-10-12 11:44:43.000000'),('139bd9b2-a8c5-11f0-8760-baf7a760ec7e','22222222-2222-2222-2222-222222222222','2025-10-13 11:44:43.000000'),('139bd9b2-a8c5-11f0-8760-baf7a760ec7e','44444444-4444-4444-4444-444444444444','2025-10-13 23:44:43.000000'),('139bec68-a8c5-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','2025-10-27 07:31:36.141816'),('139bef74-a8c5-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','2025-10-27 07:26:25.795988'),('be94305b-e883-4eba-bbc9-f9861d134528','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','2025-10-27 08:19:03.023459'),('d4a1d784-a8c4-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','2025-10-14 11:38:31.617588'),('d4a1ebf2-a8c4-11f0-8760-baf7a760ec7e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','2025-10-27 07:14:36.692250'),('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','9ab5be04-3120-4182-8b1b-5f937e8d7079','2025-10-14 09:39:33.000000');
/*!40000 ALTER TABLE `PostLikes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Roles_Name` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Roles`
--

LOCK TABLES `Roles` WRITE;
/*!40000 ALTER TABLE `Roles` DISABLE KEYS */;
INSERT INTO `Roles` VALUES (1,'Admin','System administrator with full access','2025-10-10 09:54:53.697777'),(2,'Alumni','Graduated IHCAE student with full member access','2025-10-10 09:54:53.697797'),(3,'Applicant','Job applicant with access to job board and resume builder','2025-10-10 09:54:53.697797'),(5,'ContentCreator','Can create news articles and events for admin review','2025-10-27 09:21:27.000000');
/*!40000 ALTER TABLE `Roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tags`
--

DROP TABLE IF EXISTS `Tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tags` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Slug` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UsageCount` int NOT NULL DEFAULT '0',
  `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Tags_Name` (`Name`),
  UNIQUE KEY `IX_Tags_Slug` (`Slug`),
  KEY `IX_Tags_UsageCount` (`UsageCount`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tags`
--

LOCK TABLES `Tags` WRITE;
/*!40000 ALTER TABLE `Tags` DISABLE KEYS */;
INSERT INTO `Tags` VALUES (1,'alumni','alumni',5,'2025-10-14 04:48:13.015203'),(2,'networking','networking',1,'2025-10-14 04:48:13.237492'),(3,'career','career',3,'2025-10-14 04:48:13.241976'),(4,'professional-development','professional-development',1,'2025-10-14 04:49:10.456948'),(5,'technology','technology',2,'2025-10-14 10:22:24.000000'),(6,'education','education',2,'2025-10-14 10:22:24.000000'),(7,'business','business',3,'2025-10-14 10:22:24.000000'),(8,'healthcare','healthcare',0,'2025-10-14 10:22:24.000000'),(9,'engineering','engineering',1,'2025-10-14 10:22:24.000000'),(10,'management','management',1,'2025-10-14 10:22:24.000000'),(11,'startup','startup',1,'2025-10-14 10:22:24.000000'),(12,'research','research',1,'2025-10-14 10:22:24.000000'),(13,'leadership','leadership',1,'2025-10-14 10:22:24.000000'),(14,'innovation','innovation',1,'2025-10-14 10:22:24.000000'),(15,'sustainability','sustainability',0,'2025-10-14 10:22:24.000000'),(16,'global','global',1,'2025-10-14 10:22:24.000000'),(17,'community','community',5,'2025-10-14 10:22:24.000000'),(18,'mentorship','mentorship',1,'2025-10-14 10:22:24.000000'),(19,'success','success',2,'2025-10-14 10:22:24.000000'),(20,'Mountaineering','mountaineering',5,'2025-10-14 11:41:23.000000'),(21,'Conservation','conservation',3,'2025-10-14 11:41:23.000000'),(22,'Alumni Stories','alumni-stories',2,'2025-10-14 11:41:23.000000'),(23,'Himalayan Trekking','himalayan-trekking',2,'2025-10-14 11:41:23.000000'),(24,'Wildlife Protection','wildlife-protection',1,'2025-10-14 11:41:23.000000'),(25,'Eco Tourism','eco-tourism',1,'2025-10-14 11:41:23.000000'),(26,'Adventure Sports','adventure-sports',1,'2025-10-14 11:41:23.000000'),(27,'Climate Change','climate-change',2,'2025-10-14 11:41:23.000000'),(28,'Mountain Safety','mountain-safety',2,'2025-10-14 11:41:23.000000'),(29,'Local Communities','local-communities',2,'2025-10-14 11:41:23.000000');
/*!40000 ALTER TABLE `Tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserRefreshTokens`
--

DROP TABLE IF EXISTS `UserRefreshTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserRefreshTokens` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `UserId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `TokenHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `RevokedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_UserRefreshTokens_TokenHash` (`TokenHash`),
  KEY `IX_UserRefreshTokens_UserId` (`UserId`),
  CONSTRAINT `FK_UserRefreshTokens_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserRefreshTokens`
--

LOCK TABLES `UserRefreshTokens` WRITE;
/*!40000 ALTER TABLE `UserRefreshTokens` DISABLE KEYS */;
INSERT INTO `UserRefreshTokens` VALUES ('0387b949-5ade-4ca5-a552-a65d1d8ba02f','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$eURy7BQMx1pKgibNsfaJjO/ep1rc2VXcBBow9gcfRqfrFOTBT7q1u','2025-11-03 11:54:31.439246','2025-10-27 11:54:31.439262',NULL),('09b9ddfb-c304-48ae-b33d-b1bc04ffad36','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$gWSFy1X254PIEEfGFAoQi.4XZlua./j424evxs7XXr9CG4WwM6p.y','2025-10-21 04:21:52.408348','2025-10-14 04:21:52.408367',NULL),('0b77364d-5dff-47b3-a4b0-c8fa3d522ae0','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$Daz/zW1GHdjgIpS0Kx9quOTpxp89uWXDbzPYAfkzScxqVkLdkxl8S','2025-10-17 12:03:07.017948','2025-10-10 12:03:07.017953',NULL),('10398e78-5913-4c75-9842-d874d89072f5','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$BKKt5FN.09aELdQDupn2.OsP71VXnMQ3rW2jtzBK323kX7ft/bpte','2025-10-18 04:47:15.276386','2025-10-11 04:47:15.276387',NULL),('169f86ae-1d5c-4049-baa4-12967fb321f4','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$VDl2c6.uFEqEO1BBWqN/v.K41JWYb5Wurz5e7k9NnshtaAYJn2DDO','2025-10-21 13:48:08.442593','2025-10-14 13:48:08.442607',NULL),('17670734-b844-43bb-ba35-758faa634f77','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$5b3.8/lp1rjmQA6SA6vTw.8u.xYEA1FdTDWaQL6pRo3MmTM45ruZ2','2025-10-18 04:52:57.533696','2025-10-11 04:52:57.533721',NULL),('1aa881b2-c39e-4e9b-8b7d-6bfd8b94e86e','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$J9.u65r1o8qZwBjggyIBKOrUaLfUP1VdmdqtPgcssy7/ibnqhTDJO','2025-10-18 04:42:32.752968','2025-10-11 04:42:32.752970',NULL),('1e8924cd-6178-4e7a-b65a-b60ad4897640','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$jB6/wjc77UstvZyhL/2XMeufFlnxc0vzBJxFapj0lQwR9fhFiazP6','2025-10-18 04:42:04.687677','2025-10-11 04:42:04.687712',NULL),('25427b2c-51df-4b32-b745-c611d2bcef92','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$emWhe5blVqhnb8KDPuoXRe8VZvrqucT0OJvetncuBKh9Zh0M5Azpm','2025-10-21 13:41:57.246245','2025-10-14 13:41:57.246258',NULL),('25813136-54c6-4c7e-be61-baae79d6abfb','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$F6ntXj/ryVwSdcXmLO9Hle7nEbg/h5PBAZ9X6Xv8fDkP7bYB5uJhy','2026-03-30 11:37:39.700954','2026-03-23 11:37:39.700971',NULL),('30bb5580-6cb6-4f5c-89cb-684a84046fc1','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$yU7Cg61aEGygzg.w/Sx0bOul7vSJkkkfBFNtfNKc.3CEZlDl5tc4W','2025-11-03 06:03:51.469524','2025-10-27 06:03:51.469540',NULL),('3348cf18-9289-40b9-9996-a0a19141bcef','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$zfWbegKFA15KOgAC.i3PTeYmG1pV0gEyuYcv05HnOZ3yitBrYqm3W','2026-03-22 07:51:40.483391','2026-03-15 07:51:40.483406',NULL),('35838c8a-9753-469c-a941-b250fd55e6e5','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$JLW7CEoHAEyQ.EaISvv37OptI12YjomeSzGe4.uS9rrLMgaY11nQ.','2025-10-17 12:37:50.941751','2025-10-10 12:37:50.941755',NULL),('36b75bc7-3a85-473b-86e7-1683d28d583b','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$wy/sLZW.dABv9uwq.vcd.Ol3B4tNac2DCUEUMqS4ckQUVYEq4DxN6','2025-10-21 07:50:53.162551','2025-10-14 07:50:53.162556',NULL),('382358bf-18ed-4d93-946b-10e17ad8c929','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$ZxmaqAIhwXGr9.95nzGNQuPU3tX.KJNThg5CVpKLEGWkDZ2EsiHNq','2025-11-03 05:58:02.607861','2025-10-27 05:58:02.607890',NULL),('387c7fde-b9fd-4224-abfe-51ea153f8e45','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$A6NsTym2O29aV/Lj0FDccOEmAvdbm/OJegLnGm3RFXL6e/tHMISd.','2025-10-18 02:29:17.943020','2025-10-11 02:29:17.943048',NULL),('39a6c742-862b-4b12-ba6c-e95d1d06cc20','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$DEHe54DeEIyk9adYEWXmjO9xG2uPS11920zxa72YxGrtV4KIXWwjm','2025-10-21 07:03:31.466383','2025-10-14 07:03:31.466384',NULL),('3a95ea75-6e28-44c2-87b3-76a37cf2be8f','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$Lletgr1/Q/2M5EgjDEY9Duac8Awab2KuOTLJVH9gFmgK5mFxNHAr.','2025-10-21 14:14:17.589091','2025-10-14 14:14:17.589122',NULL),('3bbfd507-5158-4317-a5ff-60290bc09568','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$rm.pT.HlTurPMPk6zzh6fu9oey/AmUrbWR056wcJfbUrCYtN5v8DC','2025-10-18 02:47:39.295311','2025-10-11 02:47:39.295312',NULL),('3f0ee405-0d62-43b0-b7c6-f12f5ff34815','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$VGo7fPQalVC2pt9wrg.TLuq1nQqbEHyYIhIfp5yyqvlv3/Qu2FGea','2025-11-03 11:36:45.204188','2025-10-27 11:36:45.204203',NULL),('3f76d4ef-e69d-4d0d-b672-bec193b40d2f','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$UTjANIpd1XvRGhApqwsAVO2a5iWq5X2flVeV.lB3yqPbxKo.llAmu','2025-10-17 12:11:20.379818','2025-10-10 12:11:20.379940',NULL),('488b2295-495e-4891-b5bb-fe479cfeee59','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$uLoV5VYaOdQUp8hN9VGAOOoSmZidGz.cQGijxbQcZS4JH298dLyMW','2025-10-19 04:58:26.329310','2025-10-12 04:58:26.329312',NULL),('4a71dbe6-02cc-427b-96da-b467253fd4bc','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$kny3reV5Y8vC8ajYLrNCzub6RbfN//6dPZz/35xVxYQ7e07dpiXku','2025-10-21 12:02:06.547905','2025-10-14 12:02:06.547927',NULL),('4b613767-38ae-4e70-a18e-6715247444b2','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$L7Px/0VhRSUvrFyVCEo6Q.efrW0/8Ae/fX5X2phngsMl8pTy4BQwm','2025-10-17 10:15:35.497862','2025-10-10 10:15:35.497864',NULL),('4dbb81e2-5d52-4f54-ac34-06bb41ed92a1','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$OY6hVXzjucwGoHq..9Yu0uG7wSmKm7RWfYWgAUQvT2IYHbMjParBu','2025-10-21 04:48:06.847183','2025-10-14 04:48:06.847202',NULL),('540689a9-a0bb-4667-808b-4ca63b7ec794','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$TVJwTok/9cUohCfbq532KO5C540A0xwkpKnSCyzxLT5nbPJAr8lby','2025-10-21 04:42:57.871065','2025-10-14 04:42:57.871099',NULL),('552fead0-83c9-44ed-9edb-ae061fbeb331','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$WfX6M9SC2u/sRhMs9LgXQuz0bImQJJ.uSlKxyH2PAUzIqopUwLra6','2025-10-17 12:08:47.807231','2025-10-10 12:08:47.807234',NULL),('5f451639-5bac-48d1-aaab-da66587e8fec','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$l0G/0clLQSN5saWMOOKcOu12BwHOV5qr2XD0gVnqf9fFfuI658Dq.','2025-10-21 03:36:01.492177','2025-10-14 03:36:01.492193',NULL),('600bb71f-4eb8-4325-9fc9-39a039c5f4c5','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$FKJ5Wu/PIbPtgqrmrushvuldBeRjVblbpicFn5gjLJ3NR/TEZ8vd.','2025-10-21 07:18:51.911528','2025-10-14 07:18:51.911535',NULL),('62f1c188-6818-4d8c-9a5b-39a5e587a80c','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$BN5Xp6DC2D0p7h5vp3zwQenLOJ2QUCFyD/gRuvTpQApeOlcx1Tdea','2025-11-03 08:15:54.026983','2025-10-27 08:15:54.027296',NULL),('648bbc42-3c97-4c08-835f-43827cf35c07','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$b5CW93z1IlZGgEy1ADZo3.0mZsgbBgOk6Va8ph33Xcnuz3ZZRIcX.','2025-10-18 04:41:52.191160','2025-10-11 04:41:52.191164',NULL),('677642fd-71cc-4c42-b8bf-18a85dd69473','9ab5be04-3120-4182-8b1b-5f937e8d7079','$2a$11$lztuLXVlOagjCIW/FT9ToeKVJ5igz5Yuun5lRAmV5xPumuOyv1F8K','2025-10-21 04:09:39.230276','2025-10-14 04:09:39.230295',NULL),('683f82dc-72de-427d-923d-af6ec4c052ba','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$03BOlgaW0C5rrHQrVKiLv.wfDx9Sblrhz/AjCykkxeX4SpdxIbyVu','2025-10-21 04:13:05.087003','2025-10-14 04:13:05.087006',NULL),('688dd39e-e436-46be-86e8-8bafe0fb5881','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$gIYC0Kj/ADAxjeqs0ZpNQux5UjImWU2QA4AZOdJRoHYZk9Q1v/bUK','2025-10-21 13:47:20.865910','2025-10-14 13:47:20.865935',NULL),('69196bfd-585e-48e6-be5a-a6eadf22a10d','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$SpgNgmvgwnrERxsKQf2C/uL9uPHNWjhKBoINV8rPdx40AL/Uy5waC','2025-10-18 03:39:50.820937','2025-10-11 03:39:50.820938',NULL),('6b4a420c-55d9-443c-ae9d-a3c0242e7ffb','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$T3xP752rKmqkqIayPaUK8eEoqiufAYmQc9fQfalZGhNbtcJNWkJ/2','2025-11-05 05:52:18.422161','2025-10-29 05:52:18.422176',NULL),('72dc517e-22cf-4454-bede-dedae8a7b718','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$iX2cfT9lX6kD90xYEbaHQeVKkG3LZSpzRGY66tP.C8DXlXdC8UoRW','2025-10-17 10:16:27.235347','2025-10-10 10:16:27.235348',NULL),('770c7db6-600c-48a5-86f8-f302af1eefff','204480b7-8f40-428f-9cca-04670ecde8ce','$2a$11$4KmlCSi8/f1DHOHDdhRweOe5Uy164PVgNdvjvox9/xm2tcKqQ/c92','2025-10-18 04:37:33.398812','2025-10-11 04:37:33.398813',NULL),('78e89040-a5cd-4b7b-8807-c45900075097','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$Wc0exJ0tZW/f4xC.uP1oveNZpvWkL4UIxYL3XSbX9slmbXsIZj1Ee','2025-10-21 12:08:24.032637','2025-10-14 12:08:24.032653',NULL),('7a092bb0-cc8b-4f4f-be22-4ab4b360a358','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$8CC4jqChyqZqYfM6g9dptenuMThEOrBZWvnHyIlH/AmLN3kTyrKjW','2025-10-21 12:15:42.070006','2025-10-14 12:15:42.070023',NULL),('7ae85687-4da1-4742-8d08-fc7a6595056e','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$XAgrxGh4SDfE9s9K83ZgI.yU/WmfkpT0E5XhfYzw0cSxGEchNl1B2','2025-10-19 04:56:24.521598','2025-10-12 04:56:24.521759',NULL),('7c3eb9a2-4582-4b9b-a1b0-ee220e0e7667','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$XndYfJDGf7okfQeBPFULpOalOcKWIcMhbjaA.VjaaE2E64mWsQttG','2025-10-21 13:46:49.611346','2025-10-14 13:46:49.611361',NULL),('7fbfc503-e09a-4e82-b97e-dac3f3e8f600','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$WNISA2qXiwUUx381H2f/s.lmZ/drC9Y2qLuhEDPqo5s.j6rzIcleW','2025-10-17 10:10:45.965617','2025-10-10 10:10:45.965636',NULL),('83b7787b-a399-4173-a5e3-12657ea68f33','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$FD1iL7lo6vQ1KVm7.SmLZOQPyE/bUMoQGn9OAqqblqEMADVU9EODK','2025-10-17 10:00:51.268850','2025-10-10 10:00:51.268868',NULL),('84a8c228-d82a-4eec-9769-cf5a66c7b26c','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$VoJ89UsmVIEPbnCjTESuUuru9086UkfYulCVS1mXvrJ0vVEDcWFlG','2025-11-03 07:12:00.773855','2025-10-27 07:12:00.773873',NULL),('853a686f-300e-472a-8f04-621c116ecbb5','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$z8w69kOQ.jp2ZOJGA/3TXu9Y.2hZahk5wAIi4tuTolWQjt6fRjPHO','2025-10-18 02:50:07.289857','2025-10-11 02:50:07.289858',NULL),('8f0a0064-dc3a-411d-93bb-96d304ae177b','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$8UjFxbZZCkpfnST4DpnLlOjIfIlp3ugnpIB8LmDz4JA4sKkczdsYK','2025-10-18 03:43:17.995088','2025-10-11 03:43:17.995089',NULL),('8f998770-ce6f-46ee-b974-1984c27b0ba9','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$FDKjKzek1T5fDqfMJ2KjCO.KSGlZfwEtLePEwGL8ChVeobtlUe2T2','2025-10-21 04:17:43.676404','2025-10-14 04:17:43.676424',NULL),('966201ad-8f8f-4118-a07d-c0a5d0bdbfc1','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$d5.37.RyNuho4KYUo98lj.z.hLn7zyBSk4R7RzUCTYYTUUsP3VvMW','2026-03-22 07:57:32.569273','2026-03-15 07:57:32.569290',NULL),('98425b4a-edf7-4e7a-a9d6-b2a5fdfe2222','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$Elv9EPlL29EP2d7R.hzyPOCNFFHYu6gwJ1VAXKgeSIRCpwJ7cXyH2','2025-10-21 06:39:57.245086','2025-10-14 06:39:57.245102',NULL),('a156a0ae-f194-4448-b44a-9eebbd096ac7','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$KQMGMFW9LSI0OfTl/0vUqeEmiQeWD7zQantqM8Im6MWmhwnaYhP/W','2025-10-17 12:16:48.260514','2025-10-10 12:16:48.260533',NULL),('a201be04-aab3-4807-ac63-9f7eefaa99a5','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$6xRbijBfVMELxoxwJ3wZWunxDZlQM3HfKLJnochXD6uqhcNbTLp/K','2025-10-21 11:09:57.968439','2025-10-14 11:09:57.968454',NULL),('a73aac1a-fb7e-46ab-88c9-622c16e18380','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$yPRGXjZ34XTN.WGBJX375.NUFatVsI1EW3alcJcxsF5xxsyWrRmwi','2025-10-17 11:59:56.152210','2025-10-10 11:59:56.152244',NULL),('b8afb86d-fd3a-4198-9673-af7fb24ab323','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$thkvEmHvnShG436ZAyypyuSrY7ZdQaKQQyPGmy5CIX1eTb8nBu0sK','2025-10-17 12:00:20.877026','2025-10-10 12:00:20.877027',NULL),('bda0318c-cde0-4386-a667-3594b8964b8f','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$YqXuNmFNVOhGnO44O6je9eXTOY8xydCWeYZ43UGO8384E39Os.6Ma','2025-10-22 02:26:13.579931','2025-10-15 02:26:13.579932',NULL),('c03e2d0f-03be-40ce-ac29-14c844da3b1b','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$nvf8hLcYSnVjpYM8XqaGhePDp68pufEJ.ikGcz1RWZzICGRTr8mqm','2025-10-18 04:37:09.284474','2025-10-11 04:37:09.284490',NULL),('c3e9e5ac-bc8d-4c9a-a8d7-23a07e06f424','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$WH1bUvp/y.5JWJMljs9BXe66VHozxDgHxWv6R/k2bpp5vN8U3T6fe','2025-11-03 11:59:31.803930','2025-10-27 11:59:31.803941',NULL),('c966c2ef-c197-47d6-9af6-f7307c9df42d','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$N7vy50G7XnqO6WZAHhJQ/eHm9KnBh.uIbETgzQJ5z4RkG9ZQ.hSla','2025-10-18 02:40:52.129931','2025-10-11 02:40:52.129932',NULL),('d1246e5e-f5a0-4d75-a986-7b9a1b6caad2','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$WI8l2BrLt9/RlrzMU4DCh.f5GmK3OWo5FKRfTuWvZVjYvuyErNiuC','2025-11-03 08:30:49.481544','2025-10-27 08:30:49.481560',NULL),('d2e3dbda-82ca-4555-b507-15a1379218a3','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$NovpI9H7FOdz74OR9ewAGuMUnomddlOENP3t39eIntQlO1LF35Lb2','2025-10-17 10:11:48.536605','2025-10-10 10:11:48.536626',NULL),('d8b43ea4-2044-4fbc-93b6-511584926fac','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$WiW2l5MevCSmxTO.dXPFc.IkREz1dX9IyUoq8SR6eKvCe7SIcIyC2','2025-11-03 11:58:54.644772','2025-10-27 11:58:54.644784',NULL),('d9e1d364-8bff-490b-b6b4-fd70f327ab59','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$/xqEdzvDB1Kw0vgefHyh1.ajoWr08lsE00Jp.AvQPJudU3Sabvvk.','2025-10-21 14:21:11.967223','2025-10-14 14:21:11.968176',NULL),('de6244d0-d8bc-458f-b7b8-b5f4913ec115','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$5yxVFQlx5yqm84tCv8T.BuPsQQMMu7hO4txnxDEo793KGkllmmE7i','2026-03-30 11:17:04.711648','2026-03-23 11:17:04.711663',NULL),('e7cf19a4-8467-423d-8a59-56d3be282946','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$g2M1.B5noaYZtEwp1z6HFuI7QuRHqdFdL4H/DK95XQklncgqER/N6','2025-10-21 15:28:18.670864','2025-10-14 15:28:18.670880',NULL),('e7f4d5d4-8e4d-48eb-9334-56c1a6c192a8','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$8PQo4V9LBEokXItPSVuK2O8z.Yt8m0bib5DMAfib19BxkBsfIU1Aq','2025-10-21 13:19:10.093424','2025-10-14 13:19:10.093452',NULL),('e8467b7b-742c-4e58-bc67-89e6f7c89a81','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$TNbT8I7L66ZkndJan98C3emfRUCcpKQTtUCvJb0wXmvviqO0nXACu','2026-03-30 11:49:27.720742','2026-03-23 11:49:27.720758',NULL),('eacc08f0-1e1b-48f5-acfe-4265e4a0de96','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$i9YtmUOfYQuD.pXYgUWQcuvpKghbhIFs6gbsuSauhdC6A/HVAIFOu','2025-11-03 09:51:38.472614','2025-10-27 09:51:38.472698',NULL),('ee46a496-f4f8-4786-9a56-a7f2b5ae7991','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$NJMnTlOtKctunHmJHl0bVe5vvBfo.bh6XW7h7durZ28pAHcv1SFlq','2025-10-21 06:01:22.541275','2025-10-14 06:01:22.541291',NULL),('f2c8494e-187d-4823-a963-f19c82f5c1f2','af33f3f4-0aea-4621-9722-1fedd1830e1b','$2a$11$XJ2Bi9BnEeRuJ1JtnjnX3OBXQvQbecsYjjXRtkniXJwADRLtOm7GO','2025-10-22 03:38:56.047135','2025-10-15 03:38:56.047376',NULL),('f887b2d9-33f7-4a78-bab3-c7995aa42fc7','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$9nbaCgsWj0GgxghJCh8ZAOZBcUOrn5OT9OdyGRYAB1gIerZnWY.SO','2025-10-18 04:43:21.116479','2025-10-11 04:43:21.116481',NULL),('ff0af09c-76c7-4e6c-a2f3-ce9480e4965c','ef3379e2-ecf6-4c26-83aa-7d3dd442549a','$2a$11$/cxko1H8/lmBv6Pu9Rwleuyh.WRv/iN9RGSVmj.gphD42EAfn0bYO','2025-11-04 02:11:51.516972','2025-10-28 02:11:51.517060',NULL);
/*!40000 ALTER TABLE `UserRefreshTokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserRoles`
--

DROP TABLE IF EXISTS `UserRoles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserRoles` (
  `UserId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `RoleId` int NOT NULL,
  `AssignedAt` datetime(6) NOT NULL,
  `AssignedBy` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  PRIMARY KEY (`UserId`,`RoleId`),
  KEY `IX_UserRoles_RoleId` (`RoleId`),
  CONSTRAINT `FK_UserRoles_Roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_UserRoles_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserRoles`
--

LOCK TABLES `UserRoles` WRITE;
/*!40000 ALTER TABLE `UserRoles` DISABLE KEYS */;
INSERT INTO `UserRoles` VALUES ('11111111-1111-1111-1111-111111111111',2,'2025-10-11 10:21:54.000000','11111111-1111-1111-1111-111111111111'),('204480b7-8f40-428f-9cca-04670ecde8ce',2,'2025-10-11 10:34:01.000000','204480b7-8f40-428f-9cca-04670ecde8ce'),('22222222-2222-2222-2222-222222222222',2,'2025-10-11 10:21:54.000000','22222222-2222-2222-2222-222222222222'),('33333333-3333-3333-3333-333333333333',2,'2025-10-11 10:21:54.000000','33333333-3333-3333-3333-333333333333'),('44444444-4444-4444-4444-444444444444',2,'2025-10-11 10:21:54.000000','44444444-4444-4444-4444-444444444444'),('55555555-5555-5555-5555-555555555555',2,'2025-10-11 10:21:54.000000','55555555-5555-5555-5555-555555555555'),('66666666-6666-6666-6666-666666666666',2,'2025-10-11 10:21:54.000000','66666666-6666-6666-6666-666666666666'),('77777777-7777-7777-7777-777777777777',2,'2025-10-11 10:21:54.000000','77777777-7777-7777-7777-777777777777'),('88888888-8888-8888-8888-888888888888',2,'2025-10-11 10:21:54.000000','88888888-8888-8888-8888-888888888888'),('99999999-9999-9999-9999-999999999999',2,'2025-10-11 10:21:54.000000','99999999-9999-9999-9999-999999999999'),('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',2,'2025-10-11 10:21:54.000000','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),('af33f3f4-0aea-4621-9722-1fedd1830e1b',1,'2025-10-10 09:54:54.845072','af33f3f4-0aea-4621-9722-1fedd1830e1b'),('ef3379e2-ecf6-4c26-83aa-7d3dd442549a',2,'2025-10-14 19:16:05.000000',NULL);
/*!40000 ALTER TABLE `UserRoles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FirstName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Status` int NOT NULL,
  `EmailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `IsBanned` tinyint(1) NOT NULL DEFAULT '0',
  `LastLoginAt` datetime(6) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `Phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Users_Email` (`Email`),
  KEY `IX_Users_EmailVerified` (`EmailVerified`),
  KEY `IX_Users_IsBanned` (`IsBanned`),
  KEY `IX_Users_LastLoginAt` (`LastLoginAt`),
  KEY `IX_Users_Status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('11111111-1111-1111-1111-111111111111','sample.user.one@example.com','$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC','Pema','Wangmo',1,1,0,'2025-10-11 10:21:54.000000','2023-01-15 10:30:00.000000','2025-10-11 10:21:54.000000','+91-98765-43210'),('204480b7-8f40-428f-9cca-04670ecde8ce','john.doe@example.com','$2a$12$5Wo0T6gqhKZJ02eHKFuBquSVwZjlTxxs2nYIHhVQEFHORZi0Ezy6S','Tenzin','Dorjee',1,0,0,'2025-10-11 04:37:33.217831','2025-10-11 04:35:40.951064','2025-10-11 04:37:49.987599','+91 98765 43210'),('22222222-2222-2222-2222-222222222222','sample.user.two@example.com','$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC','Sonam','Gurung',1,1,0,'2025-10-11 10:21:54.000000','2022-08-20 14:45:00.000000','2025-10-11 10:21:54.000000','+91-98765-43211'),('33333333-3333-3333-3333-333333333333','sample.user.three@example.com','$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC','Karma','Tamang',1,1,0,'2025-10-11 10:21:54.000000','2021-03-10 09:15:00.000000','2025-10-11 10:21:54.000000','+91-98765-43212'),('44444444-4444-4444-4444-444444444444','sample.user.four@example.com','$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC','Dolma','Sherpa',1,1,0,'2025-10-11 10:21:54.000000','2020-11-25 16:20:00.000000','2025-10-11 10:21:54.000000','+91-98765-43213'),('55555555-5555-5555-5555-555555555555','sample.user.five@example.com','$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC','Lhakpa','Lama',1,1,0,'2025-10-11 10:21:54.000000','2019-07-12 11:30:00.000000','2025-10-11 10:21:54.000000','+91-98765-43214'),('57b057ec-012b-48ec-905b-4abc0a9594aa','mail.sonam.norbu@gmail.com','$2a$12$E39ZYlLbupgQKg7Xo.zASevYSiM79YXcDe7/8krjuOHTK2Ok5689m','Sonam','Norbu',2,1,0,NULL,'2025-10-10 12:02:01.417219','2025-10-11 02:49:39.060843',NULL),('61d8bd3a-9ba7-4eb4-b011-9a8ab1339333','test@example.com','$2a$12$Yz5VmJd3SGxAN12bAjYqlODIOPHVDHIATP0x3PnofJ4MeCIzsyv9S','Test','User',1,0,0,NULL,'2025-10-10 10:00:35.412320','2025-10-11 03:39:57.013786',NULL),('66666666-6666-6666-6666-666666666666','sample.user.six@example.com','$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC','Yangchen','Thapa',1,1,0,'2025-10-11 10:21:54.000000','2023-05-18 13:45:00.000000','2025-10-11 10:21:54.000000','+91-98765-43215'),('77777777-7777-7777-7777-777777777777','sample.user.seven@example.com','$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC','Tsering','Bista',1,1,0,'2025-10-11 10:21:54.000000','2022-12-03 08:15:00.000000','2025-10-11 10:21:54.000000','+91-98765-43216'),('88888888-8888-8888-8888-888888888888','sample.user.eight@example.com','$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC','Dechen','Magar',1,1,0,'2025-10-11 10:21:54.000000','2021-09-28 15:30:00.000000','2025-10-11 10:21:54.000000','+91-98765-43217'),('89b6b6e4-a60e-4c6d-ba78-c3efa4a3d5b8','testemail@example.com','$2a$12$btzk1jOm2eIQ7saUUOnUEevkxws3/.NXhMJIxBGy2NJAXu1C0AueW','Email','Test',0,0,0,NULL,'2025-10-10 10:05:25.247406',NULL,NULL),('99999999-9999-9999-9999-999999999999','sample.user.nine@example.com','$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC','Phurba','Subba',1,1,0,'2025-10-11 10:21:54.000000','2020-04-15 12:00:00.000000','2025-10-11 10:21:54.000000','+91-98765-43218'),('9ab5be04-3120-4182-8b1b-5f937e8d7079','forumtest@example.com','$2a$12$FJ8AZXhTbpe91ki7/OLByuw00hCDl1Y.9/XZ2ArqnUbpOO9EZ5/n.','Forum','Tester',1,1,0,'2025-10-14 04:09:39.006608','2025-10-14 04:08:30.380024','2025-10-14 04:09:39.007251',NULL),('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','sample.user.ten@example.com','$2a$12$8VzGwmVkyUAEyc.ht1CrXem0iZZMOFUVbzyOEkESjSPZ.Y79RefCC','Nima','Rai',1,1,0,'2025-10-11 10:21:54.000000','2023-02-22 17:45:00.000000','2025-10-11 10:21:54.000000','+91-98765-43219'),('af33f3f4-0aea-4621-9722-1fedd1830e1b','admin@ihcae.edu','$2a$12$LVwGM/Wyopm7h9V1I9nK8eyACGpjSuo1UhCWjRlRgcIOPOX4wezfy','System','Administrator',1,1,0,'2026-03-15 07:51:40.243784','2025-10-10 09:54:54.780127','2026-03-15 07:51:40.244078',NULL),('d2b1835d-f33c-468a-9b48-6479f78036c5','frontendtest@example.com','$2a$12$ih7sbFDWM9KJIaG6JvYPfuyA2ewAGCdgWyfzQXIG.n0ey.WL.CWCW','Frontend','Test',0,0,0,NULL,'2025-10-10 10:15:23.765751',NULL,NULL),('e35a9145-d8f7-44cb-92cb-cf3a66f213f5','admin@ihcae.com','$2a$12$cdfPC..aktAQZUBjPoaGG.Zxj95K1PlqrjlRhoL6lyIDv2taEuCKu','Admin','User',0,0,0,NULL,'2025-10-11 04:36:12.580618',NULL,NULL),('ef3379e2-ecf6-4c26-83aa-7d3dd442549a','mrnorbu@gmail.com','$2a$12$M5dcXP3CUMsaw9ybWwuTMemy8L3MydGfEucwCpUGAM/nhgEjiEJPu','Sonam','Norbu',1,1,0,'2026-03-23 11:49:27.472746','2025-10-11 03:41:57.313099','2026-03-23 11:49:27.473046',NULL);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24  8:23:23
