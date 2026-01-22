-- Fix admin user password hash
DELETE FROM admin_users WHERE email = 'jaredshami@autodealercloud.com';

INSERT INTO admin_users (email, password_hash, first_name, last_name, role, status)
VALUES ('jaredshami@autodealercloud.com', '$2a$10$K.xpqAqhcRq/TJhmuXl9Fu9OvovyrbWpcJOXgsz/H17bL9TpQa7KG', 'Jared', 'Shami', 'super_admin', 'active');
