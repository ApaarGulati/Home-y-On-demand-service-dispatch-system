# MySQL Database Files

This directory contains the final database design and implementation files for the Home(y) On-demand Service Dispatch System.

## Files in this Directory

*   **`Home(y) ER diagram final.pdf`**: This PDF document illustrates the Entity-Relationship (ER) diagram for the system. It visually represents the entities (e.g., Users, Services, Providers, Bookings), their attributes, and the relationships between them.
*   **`Home(y) Relational Schema.pdf`**: This document provides the structured relational schema derived from the ER diagram. It details the exact tables, columns, primary keys, foreign keys, and constraints that make up the database structure.

## Database Schema Details (`homey_db.sql`)

The SQL script implements a robust database with several constraints, triggers, and a stored procedure to maintain data integrity and automate operations.

### Key Constraints & Checks
* **Domain Checks**: Enforces valid roles (`app_user`, `worker`, `admin`), phone number ranges, coordinates (latitude/longitude boundaries), address types, and booking statuses.
* **Foreign Keys & Cascading**: 
  * Strict referential integrity. Deleting an `account` cascades to delete associated `app_user`, `worker`, `admin`, and `address` records.
  * A `RESTRICT` constraint prevents deleting an account if it has a `wallet`.
  * Many-to-many relationship mappings (like `worker_services`) are correctly set up with cascading deletes.

### Triggers
* **`update_creation_date`**: Automatically updates the `updated_at` timestamp on `account` modifications.
* **`create_new_wallet_for_account`**: Automatically provisions a new wallet with zero balance whenever a new account is registered.
* **`prevent_unavl_worker`**: Blocks the creation of a new booking if the selected worker's status is not 'Available'.
* **`prevent_booking_overlap`**: Prevents assigning overlapping bookings to the same worker by checking existing time slots.
* **`auto_update_insertion` / `auto_update_updation` / `auto_update_deletion`**: A set of triggers on the `review` table that automatically aggregates and updates the total rating and count in the `worker` table when reviews are added, modified, or removed.

### Stored Procedures
* **`submit_review`**: Ensures transactional safety when a user submits a review. It verifies that the booking is marked as 'completed' and that no duplicate review exists before inserting the review and committing the transaction.

## Related Documents in Root Folder

*   **`ER_diagram&relationalschema.pdf` (in the parent directory)**: A combined document containing both the ER diagram and the relational schema can also be found in the root directory of the project (`../ER_diagram&relationalschema.pdf`). This serves as a comprehensive reference for the database architecture.
