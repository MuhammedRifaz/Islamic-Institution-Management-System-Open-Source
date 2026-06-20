# Community Digital Community Hub (IIMS)

An open-source Islamic Institution Management System built for the Islamic Community Center community.  
This platform acts as a digital hub for managing educational courses, community census data, attendance, and student portals.

## Screenshots

<p align="center">
  <img width="48%" alt="Screenshot 2026-06-20 134640" src="https://github.com/user-attachments/assets/ca338614-5998-423f-9d6e-eb32730d7788" />
  <img width="48%" alt="Screenshot 2026-06-20 134616" src="https://github.com/user-attachments/assets/6b16c97c-bf81-4c6e-af8f-9b2db2f3d7e1" />
</p>

<p align="center">
  <img width="48%" alt="Screenshot 2026-06-20 134543" src="https://github.com/user-attachments/assets/cfb8c92f-1ea3-418f-8877-b86c6a0d83df" />
  <img width="48%" alt="Screenshot 2026-06-20 134522" src="https://github.com/user-attachments/assets/f85de73f-a706-496f-8711-7a6522dfca3c" />
</p>

<p align="center">
  <img width="48%" alt="Screenshot 2026-06-20 134410" src="https://github.com/user-attachments/assets/b4d52c3c-c97e-4019-a1fa-e9dd65470c95" />
  <img width="48%" alt="Screenshot 2026-06-20 134814" src="https://github.com/user-attachments/assets/9704ae43-54ee-411f-9eb7-72806b06f7d0" />
</p>

<p align="center">
  <img width="70%" alt="Screenshot 2026-06-20 134654" src="https://github.com/user-attachments/assets/0f9a259c-bd23-42f5-8b42-64e8bbd05f08" />
</p>

## Features

- **Student & Staff Portals:** Role-based access control for Admins, Khatheebs, Treasurers, Presidents, and Students.
- **Attendance Tracking:** Real-time attendance logging and reporting for classes.
- **Community Census:** Digital census tracking for the local community, managed by enumerators.
- **Course Management:** View, enroll, and manage public and private community classes.
- **Samaja Dashboard:** Manage weekly session roles, speeches, and prayers.
- **PWA Ready:** Installable as an app on Android, iOS, and Windows.

## Tech Stack
- **Frontend:** React, Vite, TailwindCSS, React Router
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)
- **Hosting:** Vercel

---

## 🚀 Setup & Installation

### 1. Database Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the entire contents of `schema.sql` and run it. This will create all the necessary tables, enums, triggers, and Row Level Security (RLS) rules.
4. Ensure Email Authentication is enabled in your Auth settings.

### 2. Frontend Local Setup
1. Clone this repository.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
3. Rename `.env.example` to `.env.local` and add your Supabase project keys:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Hosting Deployment (Vercel)
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. Ensure the **Framework Preset** is set to `Vite`.
4. In the Environment Variables section, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Click **Deploy**. Your app will be live and auto-updating!

---
*Created for the community. Released under the MIT License.*
