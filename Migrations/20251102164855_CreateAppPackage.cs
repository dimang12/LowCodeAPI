using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LowcodeAPI.Migrations
{
    /// <inheritdoc />
    public partial class CreateAppPackage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "app_package",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    AppCredential = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Uuid = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    AppName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    AppDesc = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    PageLayout = table.Column<int>(type: "integer", nullable: false),
                    CreateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ViewTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateMethod = table.Column<int>(type: "integer", nullable: false),
                    CreateSource = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreateBy = table.Column<int>(type: "integer", nullable: false),
                    Thumnail = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DeployMeta = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    AppVersion = table.Column<int>(type: "integer", nullable: false),
                    ExportSetting = table.Column<string>(type: "jsonb", nullable: true),
                    DeploySetting = table.Column<string>(type: "jsonb", nullable: true),
                    App_Settings = table.Column<string>(type: "jsonb", nullable: true),
                    Role = table.Column<string>(type: "jsonb", nullable: true),
                    Maintenance_Status = table.Column<int>(type: "integer", nullable: false),
                    Maintenance_Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Maintenance_Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_package", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_app_package_AppCredential",
                table: "app_package",
                column: "AppCredential");

            migrationBuilder.CreateIndex(
                name: "IX_app_package_CreateBy",
                table: "app_package",
                column: "CreateBy");

            migrationBuilder.CreateIndex(
                name: "IX_app_package_Uuid",
                table: "app_package",
                column: "Uuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "app_package");
        }
    }
}
