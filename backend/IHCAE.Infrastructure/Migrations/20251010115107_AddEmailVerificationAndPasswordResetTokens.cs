using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IHCAE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailVerificationAndPasswordResetTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "VerifiedAt",
                table: "EmailVerificationTokens",
                newName: "UsedAt");

            migrationBuilder.AddColumn<bool>(
                name: "IsUsed",
                table: "PasswordResetTokens",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsUsed",
                table: "EmailVerificationTokens",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsUsed",
                table: "PasswordResetTokens");

            migrationBuilder.DropColumn(
                name: "IsUsed",
                table: "EmailVerificationTokens");

            migrationBuilder.RenameColumn(
                name: "UsedAt",
                table: "EmailVerificationTokens",
                newName: "VerifiedAt");
        }
    }
}
