using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IHCAE.Api.Shared.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBatchColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AlumniProfiles_GraduationYear",
                table: "AlumniProfiles");

            migrationBuilder.DropColumn(
                name: "GraduationYear",
                table: "AlumniProfiles");

            migrationBuilder.DropColumn(
                name: "GraduationYear",
                table: "AlumniDatabase");

            migrationBuilder.AddColumn<string>(
                name: "Batch",
                table: "AlumniProfiles",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Batch",
                table: "AlumniDatabase",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_AlumniProfiles_Batch",
                table: "AlumniProfiles",
                column: "Batch");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AlumniProfiles_Batch",
                table: "AlumniProfiles");

            migrationBuilder.DropColumn(
                name: "Batch",
                table: "AlumniProfiles");

            migrationBuilder.DropColumn(
                name: "Batch",
                table: "AlumniDatabase");

            migrationBuilder.AddColumn<int>(
                name: "GraduationYear",
                table: "AlumniProfiles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GraduationYear",
                table: "AlumniDatabase",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AlumniProfiles_GraduationYear",
                table: "AlumniProfiles",
                column: "GraduationYear");
        }
    }
}
