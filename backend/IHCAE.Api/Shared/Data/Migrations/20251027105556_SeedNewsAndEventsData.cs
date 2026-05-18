using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IHCAE.Api.Shared.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedNewsAndEventsData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("SET FOREIGN_KEY_CHECKS=0;");
            
            // Admin user ID
            var adminUserId = Guid.Parse("af33f3f4-0aea-4621-9722-1fedd1830e1b");
            
            // Seed News Articles
            migrationBuilder.Sql($@"
                INSERT INTO NewsArticles (Id, Title, Content, Excerpt, CategoryId, AuthorId, ImageUrl, ThumbnailUrl, Status, PublishedAt, CreatedAt, ViewCount)
                VALUES 
                (
                    '{Guid.NewGuid()}',
                    'Kanchenjunga Cleanup Initiative',
                    'Alumni-led project successfully removes 2 tons of waste from Kanchenjunga Base Camp, setting new standards for sustainable mountaineering in Sikkim. The initiative involved 25 volunteers who spent two weeks collecting and properly disposing of waste left by previous expeditions. This groundbreaking effort demonstrates the commitment of IHCAE alumni to environmental conservation and sustainable tourism practices in the Himalayan region.',
                    'Alumni-led project removes 2 tons of waste from Kanchenjunga Base Camp, setting new standards for sustainable mountaineering in Sikkim.',
                    '44444444-4444-4444-4444-444444444444',
                    '{adminUserId}',
                    'images/news1.jpg',
                    'images/news1.jpg',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP(),
                    245
                ),
                (
                    '{Guid.NewGuid()}',
                    'Sikkim Alumni Summit 2024',
                    'Over 200 alumni from the Eastern Himalayas gathered in Gangtok to share experiences and plan future conservation projects. The three-day summit featured keynote speeches from industry leaders, panel discussions on sustainable tourism, and networking sessions. Participants discussed innovative approaches to eco-tourism, community engagement, and preserving the unique cultural heritage of the Himalayan region.',
                    'Over 200 alumni from the Eastern Himalayas gathered in Gangtok to share experiences and plan future conservation projects.',
                    '11111111-1111-1111-1111-111111111111',
                    '{adminUserId}',
                    'images/new2.jpg',
                    'images/new2.jpg',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP(),
                    189
                ),
                (
                    '{Guid.NewGuid()}',
                    'First All-Female Team Summits Kanchenjunga',
                    'IHCAE graduates lead historic Kanchenjunga expedition, demonstrating leadership skills and technical expertise. The team of six women successfully reached the summit after weeks of preparation and acclimatization. This achievement marks a significant milestone in promoting gender equality in mountaineering and adventure sports. The team members shared their experiences and inspired young women to pursue careers in adventure tourism and mountain guiding.',
                    'IHCAE graduates lead historic Kanchenjunga expedition, demonstrating leadership skills and technical expertise.',
                    '44444444-4444-4444-4444-444444444444',
                    '{adminUserId}',
                    'images/new3.jpg',
                    'images/new3.jpg',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP(),
                    312
                );
            ");

            // Seed Success Stories (using Success Story category)
            migrationBuilder.Sql($@"
                INSERT INTO NewsArticles (Id, Title, Content, Excerpt, CategoryId, AuthorId, ImageUrl, ThumbnailUrl, Status, PublishedAt, CreatedAt, ViewCount)
                VALUES 
                (
                    '{Guid.NewGuid()}',
                    'From Student to Mountain Guide: Rajesh Kumar''s Journey',
                    'Rajesh Kumar overcame numerous challenges to become a certified mountain guide, now leading expeditions across the Himalayas. Growing up in a small village in Sikkim, Rajesh dreamed of exploring the mountains. After graduating from IHCAE, he worked tirelessly to gain certifications and experience. Today, he runs his own adventure tourism company, employing local guides and promoting sustainable tourism practices. His story inspires many young people from rural areas to pursue their dreams in adventure tourism.',
                    'Rajesh Kumar overcame challenges to become a certified mountain guide, now leading expeditions across the Himalayas.',
                    '33333333-3333-3333-3333-333333333333',
                    '{adminUserId}',
                    'images/success1.jpg',
                    'images/success1.jpg',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP(),
                    428
                ),
                (
                    '{Guid.NewGuid()}',
                    'Conservation Success: Priya Sharma''s Snow Leopard Project',
                    'Priya Sharma led a conservation project that increased snow leopard population by 30% in the region. After completing her studies at IHCAE, Priya dedicated herself to wildlife conservation. She worked with local communities to reduce human-wildlife conflict and established a successful community-based conservation program. Her innovative approach combines scientific research with traditional knowledge, creating sustainable solutions for wildlife protection. The project has become a model for conservation efforts across the Himalayas.',
                    'Priya Sharma led a conservation project that increased snow leopard population by 30% in the region.',
                    '33333333-3333-3333-3333-333333333333',
                    '{adminUserId}',
                    'images/success2.jpg',
                    'images/success2.jpg',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP(),
                    356
                );
            ");

            // Seed Events
            migrationBuilder.Sql($@"
                INSERT INTO Events (Id, Title, Description, CategoryId, Location, EventDate, EventEndDate, ImageUrl, ThumbnailUrl, Capacity, RegistrationDeadline, CreatedById, Status, PublishedAt, CreatedAt)
                VALUES 
                (
                    '{Guid.NewGuid()}',
                    'Annual Alumni Reunion 2024',
                    'Join us for the Annual Alumni Reunion 2024 at IHCAE Campus. Reconnect with old friends, network with fellow alumni, and celebrate our shared experiences. The event will feature guest speakers, cultural performances, and a gala dinner. This is a wonderful opportunity to strengthen our alumni community and share success stories.',
                    '88888888-8888-8888-8888-888888888888',
                    'IHCAE Campus, Sikkim',
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 120 DAY),
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 121 DAY),
                    'images/event1.jpg',
                    'images/event1.jpg',
                    150,
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 110 DAY),
                    '{adminUserId}',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP()
                ),
                (
                    '{Guid.NewGuid()}',
                    'Mountain Safety Workshop',
                    'Comprehensive mountain safety workshop covering essential skills for high-altitude expeditions. Topics include risk assessment, emergency response, first aid, and rescue techniques. Led by experienced mountaineers and safety experts. Suitable for both beginners and experienced climbers looking to refresh their skills.',
                    '66666666-6666-6666-6666-666666666666',
                    'Training Center, Manali',
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 85 DAY),
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 87 DAY),
                    'images/event2.jpg',
                    'images/event2.jpg',
                    30,
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 75 DAY),
                    '{adminUserId}',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP()
                ),
                (
                    '{Guid.NewGuid()}',
                    'Eco-Tourism Conference 2024',
                    'Annual conference on sustainable tourism practices in the Himalayan region. Join industry leaders, researchers, and practitioners to discuss innovative approaches to eco-tourism. Topics include community-based tourism, environmental conservation, and sustainable business models. Network with professionals and learn about the latest trends in sustainable tourism.',
                    '77777777-7777-7777-7777-777777777777',
                    'Conference Hall, Gangtok',
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 135 DAY),
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 137 DAY),
                    'images/event3.jpg',
                    'images/event3.jpg',
                    200,
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 125 DAY),
                    '{adminUserId}',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP()
                ),
                (
                    '{Guid.NewGuid()}',
                    'Adventure Sports Competition',
                    'Annual adventure sports competition featuring rock climbing, rappelling, and mountain biking. Open to all skill levels with separate categories for beginners and advanced participants. Prizes for winners and participation certificates for all. A great opportunity to test your skills and meet fellow adventure enthusiasts.',
                    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    'Adventure Sports Complex, Sikkim',
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 160 DAY),
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 161 DAY),
                    'images/event4.jpg',
                    'images/event4.jpg',
                    75,
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 150 DAY),
                    '{adminUserId}',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP()
                ),
                (
                    '{Guid.NewGuid()}',
                    'Conservation Workshop: Protecting Himalayan Wildlife',
                    'Hands-on workshop on wildlife conservation techniques and community engagement strategies. Learn about the unique biodiversity of the Himalayan region and practical approaches to conservation. Field visits to local conservation projects included. Suitable for students, professionals, and anyone interested in wildlife conservation.',
                    '66666666-6666-6666-6666-666666666666',
                    'Wildlife Sanctuary, Sikkim',
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 197 DAY),
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 199 DAY),
                    'images/event5.jpg',
                    'images/event5.jpg',
                    45,
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 187 DAY),
                    '{adminUserId}',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP()
                ),
                (
                    '{Guid.NewGuid()}',
                    'Sustainable Tourism Summit',
                    'Two-day summit bringing together tourism professionals, policymakers, and community leaders to discuss sustainable tourism development. Topics include responsible tourism practices, cultural preservation, and economic benefits for local communities. Keynote speakers from international organizations and panel discussions on best practices.',
                    '77777777-7777-7777-7777-777777777777',
                    'Hotel Mount View, Gangtok',
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 233 DAY),
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 234 DAY),
                    'images/event6.jpg',
                    'images/event6.jpg',
                    120,
                    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 223 DAY),
                    '{adminUserId}',
                    2,
                    UTC_TIMESTAMP(),
                    UTC_TIMESTAMP()
                );
            ");
            
            migrationBuilder.Sql("SET FOREIGN_KEY_CHECKS=1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove seeded data
            migrationBuilder.Sql(@"
                DELETE FROM NewsArticles WHERE Title IN (
                    'Kanchenjunga Cleanup Initiative',
                    'Sikkim Alumni Summit 2024',
                    'First All-Female Team Summits Kanchenjunga',
                    'From Student to Mountain Guide: Rajesh Kumar''s Journey',
                    'Conservation Success: Priya Sharma''s Snow Leopard Project'
                );
            ");

            migrationBuilder.Sql(@"
                DELETE FROM Events WHERE Title IN (
                    'Annual Alumni Reunion 2024',
                    'Mountain Safety Workshop',
                    'Eco-Tourism Conference 2024',
                    'Adventure Sports Competition',
                    'Conservation Workshop: Protecting Himalayan Wildlife',
                    'Sustainable Tourism Summit'
                );
            ");
        }
    }
}
