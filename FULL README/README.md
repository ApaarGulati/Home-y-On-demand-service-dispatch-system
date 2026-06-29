# Home(y) 
> A high-concurrency, on-demand marketplace server and system connecting residential consumers with localized service professionals.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Backend](https://img.shields.io/badge/Backend-Flask%20%2F%20Python-lightgrey.svg)](https://flask.palletsprojects.com/)
[![Database](https://img.shields.io/badge/Database-MySQL-blue.svg)](https://www.mysql.com/)
[![Security](https://img.shields.io/badge/Security-JWT%20Auth-red.svg)]()

Home(y) is a production-ready, full-stack service dispatch engine built to handle localized marketplace matching. The system maps customer demand to service providers in real-time, executing multi-parameter geospatial filtering, role-based security access controls, transactional financial state machines, and high-performance server-side data pagination.

---

##  Core Technical Architectures

### 1. Geospatial Discovery Engine
The platform implements native geolocational worker matching via the **Haversine Formula**. When a client hits the discovery endpoint, the server computes the great-circle distances across coordinate pairs directly within an optimized database layer:

$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lon}}{2}\right)}\right)$$

*   **Memory-Optimized Pagination:** Shifting away from massive single-payload fetches, worker query responses are constrained to server-side chunks (18 records per cursor), mitigating client-side memory overhead and eliminating browser-side viewport crashing.

### 2. Strict Relational Transaction Integrity
Data stability is locked completely down at the storage tier using precise **MySQL relational constraints and procedural triggers** to isolate application logic from direct mutations:
*   **Decoupled Account Profiles:** Uses strict `1:1` relational boundaries to map unified `accounts` safely out to isolated `app_user`, `worker`, or `admin` entity roles.
*   **Automated Triggers:** Custom database actions track state transitions automatically (e.g., executing structural logic on booking updates to sync aggregate metrics like worker `rating_sum` and `rating_count`).
*   **Cascade Containment:** Configured specific `FOREIGN KEY` bounds (`ON DELETE RESTRICT`) to preserve append-only legal realities across transactional auditing structures (`payment_transaction` & `wallet`).

### 3. Stateful Authentication Layer
Secured using an decoupled, tokenized **Role-Based Access Control (RBAC)** middleware architecture handled through standard JSON Web Tokens (JWT).
*   Protects backend resource routing dynamically based on state mappings (`app_user` vs `worker`).
*   Maintains a cryptographically safe state checking flow using separate access/refresh token rotation windows to limit session hijack windows.

---

##  System Stack & Components

*   **Frontend Client:** React 19, Vite, Axios, Tailwind CSS
*   **API Application Layer:** Python, Flask, Flask-SQLAlchemy (ORM)
*   **Security Pipeline:** Flask-JWT-Extended, Werkzeug Hashing
*   **Database Management:** MySQL Server, PyMySQL driver

---



