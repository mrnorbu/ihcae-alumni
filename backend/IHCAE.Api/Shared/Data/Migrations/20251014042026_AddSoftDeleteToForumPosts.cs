using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IHCAE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteToForumPosts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "ForumPosts",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedBy",
                table: "ForumPosts",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "DeletionReason",
                table: "ForumPosts",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ForumPosts",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ForumPosts");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "ForumPosts");

            migrationBuilder.DropColumn(
                name: "DeletionReason",
                table: "ForumPosts");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ForumPosts");
        }
    }
}
