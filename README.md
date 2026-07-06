# Hospital Project

A full-stack hospital management website with a React frontend and a Node.js/Express backend.

## Features

- Patient, doctor, appointment, payment, and medical record management
- Authentication and role-based pages
- Responsive UI for public and dashboard views

## Project Structure

- hospital-frontend: React + Vite frontend
- hospital-backend: Node.js + Express + MongoDB backend

## Tech Stack

- Frontend: React, Vite, CSS
- Backend: Node.js, Express, MongoDB

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/hoangminh10724/Hospital_Project.git
cd Hospital_Project
```

### 2. Run the backend

```bash
cd hospital-backend
npm install
npm start
```

### 3. Run the frontend

```bash
cd ../hospital-frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173 by default.

## Notes

- Make sure MongoDB is running and configured in the backend environment file.
- The backend uses environment variables from the config folder.
