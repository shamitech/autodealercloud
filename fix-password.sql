UPDATE admin_users 
SET password_hash = '$2a$10$K.xpqAqhcRq/TJhmuXl9Fu9OvovyrbWpcJOXgsz/H17bL9TpQa7KG'
WHERE email = 'jaredshami@autodealercloud.com';

SELECT email, LENGTH(password_hash) as hash_length, password_hash FROM admin_users;
