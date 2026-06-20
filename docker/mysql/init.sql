-- Création des 7 bases de données (une par microservice)
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS aircraft_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS seat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS passenger_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS flight_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS feedback_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS notification_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Droits root sur toutes les bases
GRANT ALL PRIVILEGES ON auth_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON aircraft_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON seat_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON passenger_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON flight_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON feedback_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON notification_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
