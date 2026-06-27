-- ============================================================
-- Homey: On-Demand Service Dispatch System
-- ============================================================

CREATE DATABASE IF NOT EXISTS homey;
USE homey;

-- ------------------------------------------------------------
-- 1. ACCOUNT (root entity)
-- ------------------------------------------------------------
CREATE TABLE account (
    account_id      VARCHAR(20)     NOT NULL,
    email           VARCHAR(254)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    role_type       VARCHAR(10)     NOT NULL,
    phone           BIGINT          NOT NULL,
    first_name      VARCHAR(255)    NOT NULL,
    middle_name     VARCHAR(255)    NOT NULL DEFAULT '',
    last_name       VARCHAR(255)    NOT NULL DEFAULT '',
    is_active       BOOLEAN         NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (account_id),
    UNIQUE KEY uq_email  (email),
    UNIQUE KEY uq_phone  (phone),

    CONSTRAINT chk_role  CHECK (role_type IN ('app_user', 'worker', 'admin')),
    CONSTRAINT chk_phone CHECK (phone BETWEEN 6000000000 AND 9999999999)
);

-- Trigger: auto-maintain updated_at on every UPDATE
DELIMITER $$
CREATE TRIGGER update_creation_date
BEFORE UPDATE ON account
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;


-- ------------------------------------------------------------
-- 2. WALLET (one per account; RESTRICT prevents orphan deletion)
-- ------------------------------------------------------------
CREATE TABLE wallet (
    account_id      VARCHAR(20)     NOT NULL,
    current_balance DECIMAL(20,2)   NOT NULL DEFAULT 0.00,

    PRIMARY KEY (account_id),
    CONSTRAINT fk_wallet_account FOREIGN KEY (account_id)
        REFERENCES account(account_id) ON DELETE RESTRICT
);

-- Trigger: auto-create a zero-balance wallet on every new account
DELIMITER $$
CREATE TRIGGER create_new_wallet_for_account
AFTER INSERT ON account
FOR EACH ROW
BEGIN
    INSERT INTO wallet (account_id, current_balance)
    VALUES (NEW.account_id, 0.00);
END$$
DELIMITER ;


-- ------------------------------------------------------------
-- 3. ROLE TABLES (1:1 with account; UNIQUE FK enforces single role)
-- ------------------------------------------------------------
CREATE TABLE app_user (
    user_id     VARCHAR(20)     NOT NULL,
    account_id  VARCHAR(20)     NOT NULL,
    longitude   DECIMAL(9,6)    NOT NULL,
    latitude    DECIMAL(8,6)    NOT NULL,

    PRIMARY KEY (user_id),
    UNIQUE KEY uq_app_user_account (account_id),
    CONSTRAINT fk_app_user_account FOREIGN KEY (account_id)
        REFERENCES account(account_id) ON DELETE CASCADE,
    CONSTRAINT app_user_lat_check CHECK (latitude  BETWEEN -90  AND  90),
    CONSTRAINT app_user_lng_check CHECK (longitude BETWEEN -180 AND 180)
);

CREATE TABLE worker (
    worker_id    VARCHAR(20)    NOT NULL,
    account_id   VARCHAR(20)    NOT NULL,
    rating_sum   INT            NOT NULL DEFAULT 0,
    rating_count INT            NOT NULL DEFAULT 0,
    longitude    DECIMAL(9,6)   NOT NULL,
    latitude     DECIMAL(8,6)   NOT NULL,
    stat         VARCHAR(20)    NOT NULL,

    PRIMARY KEY (worker_id),
    UNIQUE KEY uq_worker_account (account_id),
    CONSTRAINT fk_worker_account FOREIGN KEY (account_id)
        REFERENCES account(account_id) ON DELETE CASCADE,
    CONSTRAINT stat_check        CHECK (stat      IN ('Available', 'Unavailable', 'Out of Town')),
    CONSTRAINT worker_lat_check  CHECK (latitude  BETWEEN -90  AND  90),
    CONSTRAINT worker_lng_check  CHECK (longitude BETWEEN -180 AND 180)
);

CREATE TABLE admin (
    admin_id   VARCHAR(20) NOT NULL,
    account_id VARCHAR(20) NOT NULL,

    PRIMARY KEY (admin_id),
    UNIQUE KEY uq_admin_account (account_id),
    CONSTRAINT fk_admin_account FOREIGN KEY (account_id)
        REFERENCES account(account_id) ON DELETE CASCADE
);


-- ------------------------------------------------------------
-- 4. ADDRESS
-- ------------------------------------------------------------
CREATE TABLE address (
    address_id    INT          NOT NULL AUTO_INCREMENT,
    account_id    VARCHAR(20)  NOT NULL,
    address_type  VARCHAR(20)  NOT NULL,
    street_line_1 VARCHAR(255) NOT NULL,
    street_line_2 VARCHAR(255) DEFAULT '',
    city          VARCHAR(100) NOT NULL,
    state         VARCHAR(100) NOT NULL,
    postal_code   VARCHAR(20)  NOT NULL,
    country       VARCHAR(100) NOT NULL,

    PRIMARY KEY (address_id),
    CONSTRAINT fk_address_account FOREIGN KEY (account_id)
        REFERENCES account(account_id) ON DELETE CASCADE,
    CONSTRAINT chk_address_type CHECK (address_type IN ('home', 'work', 'billing', 'shipping'))
);


-- ------------------------------------------------------------
-- 5. SERVICES
-- ------------------------------------------------------------
CREATE TABLE services (
    service_id   VARCHAR(20)  NOT NULL,
    service_name VARCHAR(255) NOT NULL,

    PRIMARY KEY (service_id),
    UNIQUE KEY uq_service_name (service_name)
);


-- ------------------------------------------------------------
-- 6. WORKER_SERVICES (many-to-many with pricing on the join)
-- ------------------------------------------------------------
CREATE TABLE worker_services (
    worker_id  VARCHAR(20)   NOT NULL,
    service_id VARCHAR(20)   NOT NULL,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_type VARCHAR(20)   NOT NULL DEFAULT 'fixed',

    PRIMARY KEY (worker_id, service_id),
    CONSTRAINT fk_ws_worker  FOREIGN KEY (worker_id)
        REFERENCES worker(worker_id)   ON DELETE CASCADE,
    CONSTRAINT fk_ws_service FOREIGN KEY (service_id)
        REFERENCES services(service_id) ON DELETE CASCADE
);


-- ------------------------------------------------------------
-- 7. BOOKING
-- ------------------------------------------------------------
CREATE TABLE booking (
    booking_id   VARCHAR(20) NOT NULL,
    worker_id    VARCHAR(20) NOT NULL,
    user_id      VARCHAR(20) NOT NULL,
    service_id   VARCHAR(20) NOT NULL,
    sched_start  DATETIME    NOT NULL,
    sched_end    DATETIME    NOT NULL,
    actual_start DATETIME    DEFAULT NULL,
    actual_end   DATETIME    DEFAULT NULL,
    stat         VARCHAR(20) DEFAULT 'pending',
    created_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (booking_id),
    CONSTRAINT fk_booking_worker  FOREIGN KEY (worker_id)
        REFERENCES worker(worker_id),
    CONSTRAINT fk_booking_user    FOREIGN KEY (user_id)
        REFERENCES app_user(user_id),
    CONSTRAINT fk_booking_service FOREIGN KEY (service_id)
        REFERENCES services(service_id),
    CONSTRAINT booking_stat_check CHECK (stat IN (
        'pending', 'accepted', 'declined',
        'cancelled', 'ongoing', 'completed', 'payment_pending'
    ))
);

-- Trigger: block booking if worker is not Available
DELIMITER $$
CREATE TRIGGER prevent_unavl_worker
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
    DECLARE v_stat VARCHAR(20);
    SELECT stat INTO v_stat FROM worker WHERE worker_id = NEW.worker_id;
    IF v_stat != 'Available' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot book a worker who is not Available.';
    END IF;
END$$
DELIMITER ;

-- Trigger: block overlapping bookings for the same worker
DELIMITER $$
CREATE TRIGGER prevent_booking_overlap
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;
    SELECT COUNT(*) INTO conflict_count
    FROM booking
    WHERE worker_id = NEW.worker_id
      AND stat NOT IN ('cancelled', 'completed', 'declined')
      AND NEW.sched_start < sched_end
      AND NEW.sched_end   > sched_start;

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Worker already has an active booking in this time slot.';
    END IF;
END$$
DELIMITER ;


-- ------------------------------------------------------------
-- 8. PAYMENT_TRANSACTION
-- ------------------------------------------------------------
CREATE TABLE payment_transaction (
    transaction_id   VARCHAR(20)   NOT NULL,
    booking_id       VARCHAR(20)   NOT NULL,
    base_amount      DECIMAL(10,2) NOT NULL,
    tip_amount       DECIMAL(10,2) DEFAULT 0.00,
    total_amount     DECIMAL(10,2) NOT NULL,
    escrow_status    VARCHAR(20)   NOT NULL DEFAULT 'HELD',
    transaction_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (transaction_id),
    CONSTRAINT fk_txn_booking FOREIGN KEY (booking_id)
        REFERENCES booking(booking_id),
    CONSTRAINT amount_check CHECK (base_amount >= 0 AND tip_amount >= 0)
);


-- ------------------------------------------------------------
-- 9. REVIEW
-- ------------------------------------------------------------
CREATE TABLE review (
    review_id    INT           NOT NULL AUTO_INCREMENT,
    booking_id   VARCHAR(20)   NOT NULL,
    rating_value DECIMAL(2,1)  NOT NULL,
    comment      TEXT,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (review_id),
    UNIQUE KEY uq_review_booking (booking_id),
    CONSTRAINT fk_review_booking FOREIGN KEY (booking_id)
        REFERENCES booking(booking_id) ON DELETE CASCADE,
    CONSTRAINT chk_rating_value CHECK (rating_value BETWEEN 1 AND 5)
);

-- Trigger: on new review, increment worker rating_sum and rating_count
DELIMITER $$
CREATE TRIGGER auto_update_insertion
AFTER INSERT ON review
FOR EACH ROW
BEGIN
    UPDATE worker w
    JOIN booking b ON b.booking_id = NEW.booking_id
    SET w.rating_sum   = w.rating_sum   + NEW.rating_value,
        w.rating_count = w.rating_count + 1
    WHERE w.worker_id = b.worker_id;
END$$
DELIMITER ;

-- Trigger: on review edit, adjust rating_sum by the delta only
DELIMITER $$
CREATE TRIGGER auto_update_updation
AFTER UPDATE ON review
FOR EACH ROW
BEGIN
    UPDATE worker w
    JOIN booking b ON b.booking_id = NEW.booking_id
    SET w.rating_sum = w.rating_sum - OLD.rating_value + NEW.rating_value
    WHERE w.worker_id = b.worker_id;
END$$
DELIMITER ;

-- Trigger: on review deletion, decrement rating_sum and rating_count
DELIMITER $$
CREATE TRIGGER auto_update_deletion
AFTER DELETE ON review
FOR EACH ROW
BEGIN
    UPDATE worker w
    JOIN booking b ON b.booking_id = OLD.booking_id
    SET w.rating_sum   = w.rating_sum   - OLD.rating_value,
        w.rating_count = w.rating_count - 1
    WHERE w.worker_id = b.worker_id;
END$$
DELIMITER ;


-- ------------------------------------------------------------
-- STORED PROCEDURE: submit_review
-- Guards: booking must be completed, no duplicate review
-- Atomically inserts review + updates worker rating in one transaction
-- ------------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE submit_review(
    IN p_booking_id   VARCHAR(20),
    IN p_review_id    VARCHAR(20),
    IN p_rating_value DECIMAL(2,1),
    IN p_comment      TEXT
)
BEGIN
    DECLARE review_exists      INT;
    DECLARE booking_completed  INT;
    DECLARE v_worker_id        VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Transaction aborted due to an error' AS message;
    END;

    START TRANSACTION;

    SELECT COUNT(*) INTO booking_completed
    FROM booking
    WHERE booking_id = p_booking_id
      AND stat = 'completed';

    SELECT worker_id INTO v_worker_id
    FROM booking
    WHERE booking_id = p_booking_id;

    IF booking_completed = 0 THEN
        ROLLBACK;
        SELECT 'Aborted: booking not completed' AS message;
    ELSE
        SELECT COUNT(*) INTO review_exists
        FROM review
        WHERE booking_id = p_booking_id;

        IF review_exists > 0 THEN
            ROLLBACK;
            SELECT 'Aborted: review already exists' AS message;
        ELSE
            INSERT INTO review (booking_id, rating_value, comment)
            VALUES (p_booking_id, p_rating_value, p_comment);

            -- UPDATE worker
            -- SET rating_sum   = rating_sum   + p_rating_value,
            --     rating_count = rating_count + 1
            -- WHERE worker_id = v_worker_id;

            COMMIT;
            SELECT 'Review submitted successfully' AS message;
        END IF;
    END IF;
END$$
DELIMITER ;
