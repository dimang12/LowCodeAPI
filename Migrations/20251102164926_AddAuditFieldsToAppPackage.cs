using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LowcodeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditFieldsToAppPackage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "app_package",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "app_package",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "app_package",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "app_package",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "app_package");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "app_package");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "app_package");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "app_package");
        }
    }
}
