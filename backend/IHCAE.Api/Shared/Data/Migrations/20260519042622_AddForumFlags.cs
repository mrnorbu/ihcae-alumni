using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IHCAE.Api.Shared.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddForumFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ForumFlags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    PostId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FlaggedById = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Reason = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Details = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ResolvedById = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ResolutionNotes = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP(6)"),
                    ResolvedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ForumFlags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ForumFlags_ForumPosts_PostId",
                        column: x => x.PostId,
                        principalTable: "ForumPosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ForumFlags_Users_FlaggedById",
                        column: x => x.FlaggedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ForumFlags_Users_ResolvedById",
                        column: x => x.ResolvedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ForumFlags_CreatedAt",
                table: "ForumFlags",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ForumFlags_FlaggedById",
                table: "ForumFlags",
                column: "FlaggedById");

            migrationBuilder.CreateIndex(
                name: "IX_ForumFlags_PostId",
                table: "ForumFlags",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_ForumFlags_PostId_FlaggedById",
                table: "ForumFlags",
                columns: new[] { "PostId", "FlaggedById" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ForumFlags_ResolvedById",
                table: "ForumFlags",
                column: "ResolvedById");

            migrationBuilder.CreateIndex(
                name: "IX_ForumFlags_Status",
                table: "ForumFlags",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ForumFlags");
        }
    }
}
