# Operational Requisition and Procurement Management System (ORPMS)

A web-based platform designed for BCJ Logistics to automate and streamline their operational requisition, inventory, and procurement processes. This system integrates requisition, inventory, and purchasing subsystems into a single, efficient workflow, replacing error-prone manual methods with a secure, role-based digital solution.

-------------------

### Features

- Requisition Management: Create, view, update, and approve/reject operational requests.
- Inventory Management: Real-time tracking of items, categories, and stock levels.
- Purchase Order Management: Generate and manage purchase orders and deliveries.
- Returns Management (Optional): Handle item returns and update status.
- Supplier Management: Maintain a database of suppliers and their categories.
- Financial Statistics: View and update financial data and summaries.
- User & Role-Based Access Control: Secure authentication and permission management for Encoders, Managers, and Admins.
- Audit Logs: Track all system activities for transparency and accountability.
- Notifications: Real-time alerts for requisition approvals, stock updates, and more.

-------------------

### Tech Stack

- Backend: Laravel (PHP)
- Frontend: React, Inertia.js
- Build Tool: Vite
- Database: PostgreSQL

-------------------

### Installation

Follow these steps to set up the project locally.

#### 1. Clone the Repository
> git clone https://github.com/edmark1434/Operational-Requisition-and-Procurement-Management-System.git

#### 2. Backend Setup (Laravel)
> - composer install
> - composer require inertiajs/inertia-laravel
> - php artisan inertia:middleware
> - Add .env file. Premade .env is currently named .env.example
> - php artisan key:generate - To generate a key

#### 3. Frontend Setup (React + Inertia)
> - npm install
> - npm install --save-dev @vitejs/plugin-react
> - npm install @inertia/react

#### 4. Start the Development
> - php artisan serve
> - npm run dev

Visit http://localhost:8000 to access the application.

-------------------

### Default User Roles

| Role | Permissions |
|------|-------------|
| **Encoder** | Create requisitions, view inventory, update items, manage returns |
| **Manager** | Approve/Reject requisitions, view purchases, update inventory |
| **Admin** | Full system access, user/role management, audit logs, financial statistics |

-------------------

### Developers

This project was developed by **RavenLabs Development**:

**Project Manager:**
- Lauglaug, Joehanes P.

**Team Members:**
- Mahilom, John Paul P.
- Pacibe, Jodeci A.
- Talingting, Edmark T.

-------------------
### License
This project is licensed under the **RavenLabs Dev** License.

-------------------

### [ Draft Area ]
INSTALLATION FOR INERTIA DEPENDENCIES


- npm install --save-dev @vitejs/plugin-react

- composer require inertiajs/intertia-laravel

- php artisan insertia:middleware

- npm install @inertia/react

https://www.youtube.com/watch?v=qBxo6hW83jU
