# Struktur database

```sql
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `seat_id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `origin_station_id` int NOT NULL,
  `destination_station_id` int NOT NULL,
  `status` enum('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `booking_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `seat_id` (`seat_id`),
  KEY `schedule_id` (`schedule_id`),
  KEY `origin_station_id` (`origin_station_id`),
  KEY `destination_station_id` (`destination_station_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`schedule_id`) REFERENCES `train_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`origin_station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`destination_station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `carriages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `train_id` int NOT NULL,
  `carriage_number` int DEFAULT NULL,
  `class` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `train_id` (`train_id`),
  CONSTRAINT `carriages_ibfk_1` FOREIGN KEY (`train_id`) REFERENCES `trains` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `midtrans_order_id` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `status` enum('pending', 'paid', 'failed', 'expired') DEFAULT 'pending',
  `snap_token` varchar(255) DEFAULT NULL,
  `redirect_url` varchar(255) DEFAULT NULL,
  `transaction_time` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `schedule_routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `station_id` int NOT NULL,
  `station_order` int DEFAULT NULL,
  `arrival_time` time DEFAULT NULL,
  `departure_time` time DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `schedule_id` (`schedule_id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `schedule_routes_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `train_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `schedule_routes_ibfk_2` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `seats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `carriage_id` int NOT NULL,
  `seat_number` varchar(10) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `carriage_id` (`carriage_id`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`carriage_id`) REFERENCES `carriages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `stations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `station_name` varchar(100) DEFAULT NULL,
  `station_code` varchar(10) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trains` (
  `id` int NOT NULL AUTO_INCREMENT,
  `train_name` varchar(100) DEFAULT NULL,
  `train_code` varchar(10) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `trains_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `train_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `train_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `train_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `train_id` int NOT NULL,
  `schedule_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `train_id` (`train_id`),
  CONSTRAINT `train_schedules_ibfk_1` FOREIGN KEY (`train_id`) REFERENCES `trains` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin', 'visitor', 'user') DEFAULT 'user',
  `nik` varchar(20) DEFAULT NULL,
  `address` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

# Dummy data test

```sql
-- 1. Train Categories
INSERT INTO train_categories (id, category_name) VALUES
(1, 'Ekonomi'),
(2, 'Bisnis'),
(3, 'Eksekutif');

-- 2. Trains
INSERT INTO trains (id, train_name, train_code, category_id) VALUES
(1, 'Kereta Cepat', 'KC01', 3);

-- 3. Train Schedules
INSERT INTO train_schedules (id, train_id, schedule_date) VALUES
(1, 1, '2025-06-27');

-- 4. Carriages
INSERT INTO carriages (id, train_id, carriage_number, class) VALUES
(1, 1, 1, 'Eksekutif');

-- 5. Seats
INSERT INTO seats (id, carriage_id, seat_number) VALUES
(1, 1, '1A'),
(2, 1, '1B'),
(3, 1, '1C');

-- 6. Stations
INSERT INTO stations (id, station_name, station_code) VALUES
(1, 'Stasiun A', 'STA'),
(2, 'Stasiun B', 'STB'),
(3, 'Stasiun C', 'STC'),
(4, 'Stasiun D', 'STD');

-- 7. Schedule Routes
INSERT INTO schedule_routes (id, schedule_id, station_id, station_order, arrival_time, departure_time) VALUES
(1, 1, 1, 1, NULL, '08:00:00'), -- Stasiun A (keberangkatan awal)
(2, 1, 2, 2, '09:00:00', '09:10:00'), -- Stasiun B
(3, 1, 3, 3, '10:00:00', '10:10:00'), -- Stasiun C
(4, 1, 4, 4, '11:00:00', NULL); -- Stasiun D (tujuan akhir)

-- 8. Users
INSERT INTO users (id, name, email, password, phone, role, nik, address) VALUES
(1, 'User Satu', 'user1@mail.com', 'hashed_password1', '081234567890', 'user', '1234567890123456', 'Alamat 1'),
(2, 'User Dua', 'user2@mail.com', 'hashed_password2', '081234567891', 'user', '1234567890123457', 'Alamat 2');

-- 9. Bookings
INSERT INTO bookings (id, user_id, seat_id, schedule_id, origin_station_id, destination_station_id, status, price) VALUES
(1, 1, 1, 1, 1, 3, 'confirmed', 150000.00), -- User Satu, 1A, dari Stasiun A ke Stasiun C
(2, 2, 2, 1, 2, 4, 'confirmed', 100000.00); -- User Dua, 1B, dari Stasiun B ke Stasiun D

-- 10. Payments
INSERT INTO payments (id, booking_id, midtrans_order_id, amount, payment_method, status, transaction_time) VALUES
(1, 1, 'ORDER-1', 150000.00, 'midtrans', 'paid', '2025-06-26 10:00:00'),
(2, 2, 'ORDER-2', 100000.00, 'midtrans', 'paid', '2025-06-26 10:30:00');
```

---

# Cek kursi yang tersedia dari stasiun 1 ke 4

```sql
-- Cek kursi yang tersedia untuk perjalanan dari origin_station_id = 1 (A) ke destination_station_id = 4 (D)
SELECT s.id AS seat_id, s.seat_number
FROM seats s
JOIN carriages c ON s.carriage_id = c.id
JOIN trains t ON c.train_id = t.id
JOIN train_schedules ts ON t.id = ts.train_id
WHERE ts.id = 1 -- Ganti dengan ID jadwal yang kamu cek
AND NOT EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.seat_id = s.id
      AND b.schedule_id = ts.id
      AND b.status = 'confirmed'
      AND (
        -- Logika overlap: Kalau stasiun tujuan saya berada setelah origin orang lain dan sebelum tujuan orang lain, berarti overlap
        (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = 1)
            < (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = b.destination_station_id)
        AND
        (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = 4)
            > (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = b.origin_station_id)
      )
)
ORDER BY s.id;
```

---

# Cek kursi yang tersedia dari orang yang sudah turun dari stasiun 3 ke 4

```sql
SELECT s.id AS seat_id, s.seat_number
FROM seats s
JOIN carriages c ON s.carriage_id = c.id
JOIN trains t ON c.train_id = t.id
JOIN train_schedules ts ON t.id = ts.train_id
WHERE NOT EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.seat_id = s.id
      AND b.schedule_id = ts.id
      AND b.status = 'confirmed'
      AND (
        -- Logika overlap antara rute 3 ke 4 dengan rute yang sudah dibooking
        (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = 3)
            < (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = b.destination_station_id)
        AND
        (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = 4)
            > (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = b.origin_station_id)
      )
);
```