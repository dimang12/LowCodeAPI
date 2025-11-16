using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LowcodeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAppPagesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "app_pages",
                columns: table => new
                {
                    page_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    userid = table.Column<int>(type: "integer", nullable: false),
                    pagename = table.Column<string>(type: "character varying(550)", maxLength: 550, nullable: false),
                    display_status = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    visibility = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    password = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    recommend = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    publish = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    title = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    istwocolumn = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)5),
                    porder = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    auto_play_sec = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    iratio = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    zoom = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    docperrow = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    docpercol = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    docflowtype = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    canvastype = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    geozoom = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    lat = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    lng = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    width_col0 = table.Column<float>(type: "real", nullable: false),
                    width_col1 = table.Column<float>(type: "real", nullable: false),
                    width_col2 = table.Column<float>(type: "real", nullable: false),
                    width_col3 = table.Column<float>(type: "real", nullable: false),
                    width_col4 = table.Column<float>(type: "real", nullable: false),
                    allowPageAvatar = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    bgcolor = table.Column<string>(type: "character varying(2500)", maxLength: 2500, nullable: false),
                    objects_cache_timeout = table.Column<double>(type: "double precision", nullable: false),
                    objects_cache_timeout_meta = table.Column<double>(type: "double precision", nullable: false),
                    lock_unlock_objects_status = table.Column<short>(type: "smallint", nullable: false),
                    collapse_expand_objects_status = table.Column<short>(type: "smallint", nullable: false),
                    report_num_pages = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    max_num_access = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    count_num_access = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    expiration_time = table.Column<int>(type: "integer", nullable: false),
                    dynamic_binding = table.Column<string>(type: "jsonb", nullable: false, defaultValueSql: "'{}'::jsonb"),
                    object_event_binding = table.Column<string>(type: "jsonb", nullable: true),
                    deep_ui_meta_data = table.Column<string>(type: "jsonb", nullable: false, defaultValueSql: "'{}'::jsonb"),
                    layout_settings = table.Column<string>(type: "jsonb", nullable: true),
                    security_settings = table.Column<string>(type: "jsonb", nullable: true),
                    pageNotShareInBindle = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    thumbnail = table.Column<byte[]>(type: "bytea", nullable: false),
                    thumbnailmask = table.Column<int>(type: "integer", nullable: true),
                    lastaccess = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    enableDoubleClickToViewImageWidgets = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    enablePageCache = table.Column<int>(type: "integer", nullable: true),
                    enablePasteConfirmation = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_pages", x => x.page_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_app_pages_display_status",
                table: "app_pages",
                column: "display_status");

            migrationBuilder.CreateIndex(
                name: "IX_app_pages_pagename",
                table: "app_pages",
                column: "pagename");

            migrationBuilder.CreateIndex(
                name: "IX_app_pages_publish",
                table: "app_pages",
                column: "publish");

            migrationBuilder.CreateIndex(
                name: "IX_app_pages_userid",
                table: "app_pages",
                column: "userid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "app_pages");
        }
    }
}
