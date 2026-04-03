# Study Group Finder & Collaboration Platform  
React • Spring Boot • MySQL • Java • JWT

## Milestone 1 & 2 – Authentication, Course Management & Study Group Creation

A full-stack web application that helps students connect with peers taking the same courses to form effective study groups. The platform enables users to create profiles, manage enrolled courses, discover other students studying the same subjects, and create or join study groups for collaborative learning.

---

# 👥 Team Members

- Ananya – Backend Developer and Database
- Sourabh – Frontend Developer and Tester
- Chandra Deepika – Backend Developer and Tester
- Bhagyavathi – Frontend Developer  and Database
- Harsha Vardhan - Frontend Developer
---

# 📋 Table of Contents

- Problem Statement  
- Milestone 1 Features  
- Milestone 2 Features
- Milestone 3 Features  
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
# 🚀 Milestone 3 (Week 5–6)

## Communication & Collaboration (Real-Time Chat)

### Implemented

- Real-time group chat using WebSockets (STOMP protocol)  
- Chat message persistence using MySQL database  
- Secure messaging with JWT-based authentication  
- Group-based messaging (messages visible only to group members)  
- Chat history retrieval for each group  
- Pagination support for large message datasets  
- Message status tracking (Sent, Delivered, Read)  
- Soft delete for messages  
- Search messages within group chat  
- Unread message count functionality  
- Membership validation before sending messages  

### Outcomes

- Dedicated chat page for each study group  
- Real-time messaging widget  
- Live message updates without page refresh  
- Chat history display  
- User-friendly chat UI with message differentiation  
- Scalable backend architecture for real-time communication  

# 🚀 Milestone 4 (Week 7–8)
### Implemented
-Developed session scheduling system allowing users to create, update, and manage study sessions
-Integrated real-time notifications for session creation, updates, and reminders
-Implemented calendar integration to visualize -upcoming sessions in an organized manner
-Enabled automatic reminders before session start time to improve participation.

### Outcomes

# 🛠️ Tech Stack
-Improved user engagement through timely session reminders and notifications
-Reduced missed sessions with automated alert system
-Provided a seamless scheduling experience with calendar visualization
-Enhanced user productivity by organizing sessions effectively.

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
git clone <https://github.com/ChandraDeepika/Study-Group-Finder-Collaborative-Platform.git>
cd study-group-finder
```
## 🗄️ Database Setup

Open MySQL and create a database:

```sql
CREATE DATABASE study_group_platform;
```

Update the database credentials in:

```
backend/src/main/resources/application.properties
```

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/study_group_platform
spring.datasource.username=root
spring.datasource.password=your_password
```

---

## ▶ Running the Application

### Start Backend

```bash
cd backend
mvn clean
mvn spring-boot:run
```

Backend runs at:

```
http://localhost:8080
```

---

### Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at:

```
http://localhost:3000
```

---

## 📁 Project Structure

```
backend/
│
├── src/main/java/com/studygroup/backend/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── exception/
│   ├── model/
│   ├── repository/
│   ├── service/
│   ├── util/
│   └── StudyGroupApplication.java
│
frontend/
│
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── utils/
```

---

## 🔒 Security Features

- JWT-based authentication  
- Role-based access control  
- Password encryption using BCrypt  
- Secure API communication  
- Session validation  

---
## 🏆 Milestone 1, 2 & 3 Outcomes

- Fully functional authentication system with secure login and registration  
- User profile management and academic course handling  
- Peer discovery based on enrolled courses  
- Study group creation, joining, and member management  
- Course-based group search and filtering  
- Real-time group chat using WebSockets  
- Dedicated chat page and messaging widget  
- Live message updates without page refresh  
- Secure, group-based communication system  
- Improved collaboration and interaction among students  
---

## 📌 Upcoming Features (Next Milestones)
- Study session scheduling with calendar  
- Email / push notifications  
- File sharing within study groups  
- Group activity tracking  
