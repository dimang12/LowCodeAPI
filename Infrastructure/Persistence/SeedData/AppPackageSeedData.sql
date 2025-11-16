-- Seed data for app_package table
-- JSON columns use PostgreSQL native jsonb type
-- Note: Column names are case-sensitive in PostgreSQL

INSERT INTO app_package ("Id", "AppCredential", "Uuid", "AppName", "Version", "AppDesc", "PageLayout", "CreateTime", "ViewTime", "CreateMethod", "CreateSource", "CreateBy", "Thumnail", "DeployMeta", "AppVersion", "ExportSetting", "DeploySetting", "App_Settings", "Role", "Maintenance_Status", "Maintenance_Title", "Maintenance_Message", "CreatedAt", "UpdatedAt") 
VALUES (
    1, 
    '68237d28864f7nxX', 
    '679323b266e638fN', 
    'Courses', 
    3, 
    'Studying Course', 
    0, 
    '2025-05-13 17:11:04', 
    '2025-05-29 15:12:42', 
    1, 
    '67f4c0c641f8fph9', 
    41, 
    null, 
    '', 
    1, 
    '{"userDefAppName":"Courses-002","packageName":"Courses-002","remoteUrl":"","remoteUserName":"","remotePwd":""}'::jsonb, 
    null, 
    null, 
    null, 
    0, 
    null, 
    null,
    NOW(),
    NULL
);

INSERT INTO app_package ("Id", "AppCredential", "Uuid", "AppName", "Version", "AppDesc", "PageLayout", "CreateTime", "ViewTime", "CreateMethod", "CreateSource", "CreateBy", "Thumnail", "DeployMeta", "AppVersion", "ExportSetting", "DeploySetting", "App_Settings", "Role", "Maintenance_Status", "Maintenance_Title", "Maintenance_Message", "CreatedAt", "UpdatedAt") 
VALUES (
    2, 
    '6824ec0a4012b9DH', 
    '67e6c6f14a383kjr', 
    'map-shape-information', 
    0, 
    '', 
    0, 
    '2025-05-14 19:16:26', 
    '2025-05-20 14:50:02', 
    1, 
    '67e6c6f14a380yp8', 
    41, 
    null, 
    '', 
    1, 
    null, 
    null, 
    null, 
    null, 
    0, 
    null, 
    null,
    NOW(),
    NULL
);

INSERT INTO app_package ("Id", "AppCredential", "Uuid", "AppName", "Version", "AppDesc", "PageLayout", "CreateTime", "ViewTime", "CreateMethod", "CreateSource", "CreateBy", "Thumnail", "DeployMeta", "AppVersion", "ExportSetting", "DeploySetting", "App_Settings", "Role", "Maintenance_Status", "Maintenance_Title", "Maintenance_Message", "CreatedAt", "UpdatedAt") 
VALUES (
    3, 
    '682676258253esxg', 
    '682676258254386m', 
    'Add-Delete app', 
    0, 
    '', 
    0, 
    '2025-05-15 23:17:57', 
    '2025-05-15 23:23:33', 
    0, 
    '', 
    41, 
    null, 
    '', 
    1, 
    null, 
    null, 
    null, 
    null, 
    0, 
    null, 
    null,
    NOW(),
    NULL
);

INSERT INTO app_package ("Id", "AppCredential", "Uuid", "AppName", "Version", "AppDesc", "PageLayout", "CreateTime", "ViewTime", "CreateMethod", "CreateSource", "CreateBy", "Thumnail", "DeployMeta", "AppVersion", "ExportSetting", "DeploySetting", "App_Settings", "Role", "Maintenance_Status", "Maintenance_Title", "Maintenance_Message", "CreatedAt", "UpdatedAt") 
VALUES (
    4, 
    '6827c44101452ucz', 
    '681ba6270220c4lL', 
    'Basic Blog with DEEP v8', 
    2, 
    'This is a demo app for training sessions', 
    0, 
    '2025-05-16 23:03:29', 
    '2025-05-21 16:45:01', 
    1, 
    '681ba62702208EjO', 
    41, 
    null, 
    '', 
    1, 
    null, 
    null, 
    null, 
    null, 
    0, 
    null, 
    null,
    NOW(),
    NULL
);

