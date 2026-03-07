# Study Group Finder & Collaboration Platform  
React • Spring Boot • MySQL • Java • JWT

## Milestone 1 & 2 – Authentication, Course Management & Study Group Creation

A full-stack web application that helps students connect with peers taking the same courses to form effective study groups. The platform enables users to create profiles, manage enrolled courses, discover other students studying the same subjects, and create or join study groups for collaborative learning.

---

# 👥 Team Members

- Member 1 – Backend Developer  
- Member 2 – Frontend Developer  
- Member 3 – Backend Developer  
- Member 4 – Frontend Developer  
- Member 5 – Tester  

---

# 📋 Table of Contents

- Problem Statement  
- Milestone 1 Features  
- Milestone 2 Features  
- Tech Stack  
- Prerequisites  
- Installation  
- Database Setup  
- Running the Application  
- Project Structure  
- Security Features  
- Backlog  

---

# 🎯 Problem Statement

Students often face difficulty finding peers studying the same subjects, coordinating study sessions, and forming effective study groups. Existing communication tools lack structured academic collaboration features.

The **Study Group Finder & Collaboration Platform** solves this problem by allowing students to:

- Create academic profiles  
- Manage enrolled courses  
- Discover peers studying the same courses  
- Create and join study groups  
- Coordinate group collaboration easily  

This platform improves academic networking and simplifies group study coordination.

---

# 🚀 Milestone 1 (Week 1–2)

## Authentication & Course Management

### Implemented

- User Registration & Login with JWT authentication  
- Secure user profile creation  
- Profile management with academic details  
- Add and manage enrolled courses  
- Course-based peer discovery  
- Dashboard displaying joined groups and suggested peers  

### Outcomes

- Login & Registration pages  
- Profile setup and editing page  
- Course management interface  
- User dashboard  

---

# 🚀 Milestone 2 (Week 3–4)

## Study Group Creation & Discovery

### Implemented

- Create study groups associated with courses  
- Add group description and privacy settings  
- Search and filter study groups by course  
- Join public groups instantly  
- Request access to private groups  
- View group member list  

### Outcomes

- Study group creation form  
- Group search with filters  
- Group member management page  

---

# 🛠️ Tech Stack

## Frontend

- React.js  
- JavaScript / TypeScript  
- Tailwind CSS  
- REST API integration  

## Backend

- Spring Boot  
- Spring Security  
- JWT Authentication  
- Spring Data JPA  

## Database

- MySQL  

---

# 📦 Prerequisites

Make sure the following tools are installed:

- Java 17+  
- Node.js 18+  
- npm  
- MySQL 8+  
- Maven  
- Git  

---

# 🚀 Installation

Clone the repository:

```bash
git clone <your-repository-link>
cd study-group-finder

## 🗄️ Database Setup

Open MySQL and create a database:

```sql
CREATE DATABASE study_group_platform;

Update the database credentials in:

backend/src/main/resources/application.properties

Example configuration:

spring.datasource.url=jdbc:mysql://localhost:3306/study_group_platform
spring.datasource.username=root
spring.datasource.password=your_password
