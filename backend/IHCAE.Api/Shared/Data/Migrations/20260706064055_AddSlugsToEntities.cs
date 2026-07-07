using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IHCAE.Api.Shared.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSlugsToEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "NewsArticles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Events",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "DiscussionTopics",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "AlumniProfiles",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Slug",
                table: "NewsArticles");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "DiscussionTopics");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "AlumniProfiles");
        }
    }
}
