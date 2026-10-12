# Product Requirements Document (PRD): User Authentication & Role-Based Access Control

## 1. Overview
The current version of the NxtFlix application lacks explicit role-based access control (RBAC) separating regular viewers from administrative users. Additionally, there is no self-serve registration process for new users to create accounts.

This document defines the functional and non-functional requirements to implement a secure **User Sign-Up Workflow** and **Role-Based Authentication (User vs. Admin)**.

---

## 2. Objectives
- Enable new users to register an account directly on the platform.
- Implement Role-Based Access Control (RBAC) separating **Standard Users** from **Admin Users**.
- Restrict administrative routes, endpoints, and UI components from non-admin accounts.
- Improve application security and user data isolation.

---

## 3. User Roles & Permissions

### 3.1 Standard User (`USER`)
- **Sign-Up & Login:** Can create a new account and log in using credentials.
- **Content Consumption:** Browse, search, filter, and stream available titles.
- **Personalization:** Manage user profile, watchlists, and viewing history.
- **Restrictions:** No access to content management, analytics, or user management tools.

### 3.2 Administrative User (`ADMIN`)
- **All Standard User Capabilities:** Full viewing and profile access.
- **Content Management System (CMS):**
  - Add, update, hide, or delete movies/shows.
  - Manage media metadata (genres, descriptions, thumbnails, video source URLs).
- **User Management:** View registered users, manage user roles, or manage subscriptions/status.
- **Dashboard & Analytics:** View application metrics (total users, popular content, active sessions).

---

## 4. Functional Requirements

### 4.1 Feature 1: User Registration (Sign-Up)
- **UI Components:**
  - Dedicated Sign-Up Page / Modal (`/signup`).
  - Input Fields:
    - Full Name
    - Email Address (with format validation)
    - Password (minimum 8 characters, requiring at least one number and special character)
    - Confirm Password
  - "Already have an account? Log In" link leading to `/login`.
- **Backend Workflow:**
  - Check if the provided email already exists in the database.
  - Hash the password securely using `bcrypt` or similar standard hashing algorithm before storing.
  - Assign the default role `USER` to newly registered accounts.
  - Automatically log in the user upon successful registration or send an email verification link (if required).

---

### 4.2 Feature 2: Role-Based Authentication & Authorization

#### A. Data Model Updates
Update the `User` schema/model in the database to include a role field:
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "user@example.com",
  "passwordHash": "hashed_string",
  "role": "USER", // Options: "USER", "ADMIN"
  "createdAt": "Timestamp"
}
```

#### B. Authentication Token / Session
- Include the user's `role` within the JWT (JSON Web Token) payload or session object upon authentication.
- Example JWT Payload:
  ```json
  {
    "userId": "123456789",
    "email": "user@example.com",
    "role": "ADMIN",
    "iat": 1712345678,
    "exp": 1712432078
  }
  ```

#### C. Route Protection & Authorization Middleware
- **Frontend Protection:**
  - Protected Route wrapper checking `isAuthenticated` and `role`.
  - Non-admin users attempting to access `/admin` or `/admin/*` routes must be redirected to a `403 Forbidden` page or back to the `/` home feed.
- **Backend API Protection:**
  - Implement authorization middleware (`verifyAdmin`) on administrative API endpoints (e.g., `POST /api/movies`, `DELETE /api/movies/:id`, `GET /api/users`).

---

### 4.3 Feature 3: Navigation & UI Adjustments
- **Navigation Bar:**
  - **Unauthenticated:** Show "Log In" and "Sign Up" buttons.
  - **Authenticated (`USER`):** Show Profile icon, Watchlist, Settings, "Log Out".
  - **Authenticated (`ADMIN`):** Show standard nav items plus an explicit "Admin Dashboard" entry point in the navigation bar or dropdown menu.

---

## 5. Non-Functional Requirements
- **Security:** Passwords must never be stored in plain text. JWT secret keys must be kept in secure environment variables.
- **Performance:** Auth checks must execute quickly with minimal latency impact on protected routes (<50ms processing time for token validation).
- **Usability:** Provide clear error messages for failed sign-ups (e.g., "Email already in use", "Passwords do not match").

---

## 6. Acceptance Criteria

| ID | Scenario | Expected Outcome |
| :--- | :--- | :--- |
| **AC-1** | New user fills out sign-up form with valid details | Account is created with role `USER`, saved to DB, and user is redirected to home page. |
| **AC-2** | User attempts sign-up with existing email | System displays an error: "Email is already registered." |
| **AC-3** | Regular `USER` attempts to navigate to `/admin` | Access denied; user redirected to home page or shown `403 Access Denied`. |
| **AC-4** | `ADMIN` user logs in | UI renders "Admin Dashboard" option; full access granted to `/admin` routes and admin APIs. |
| **AC-5** | Non-admin user calls Admin API directly | Backend middleware rejects request with HTTP status `403 Forbidden`. |