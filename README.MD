# BlogHub


BlogHub is a full-stack blog platform built with the MERN stack. It allows users to create, like, and comment on posts, reply to comments, search for content with autocomplete, sign in with Google or email/password, and update their profiles. The project is currently in development, with additional features and improvements planned.

## You can check it out here: https://blog-hub-e.vercel.app/

# Features

## Post Management: 
Create, view, like, and delete blog posts.
## Comments & Replies: 
Add comments to posts and reply to existing comments.
## Search: 
Search for posts by keywords or tags and users by name with autocomplete.
## Authentication: 
Sign in with Google OAuth or email/password.
## User Profiles: 
Update personal profile information, including name, bio, and profile picture.
## Responsive Design: 
Accessible on both desktop and mobile devices.

# Tech Stack

Frontend: React, React Router, Axios, Tailwind CSS
Backend: Node.js, Express.js
Database: MongoDB with Mongoose
Authentication: Google OAuth, JWT for email/password login
Deployment: Not yet deployed

# Installation

Follow these steps to set up the project locally:

## Prerequisites

Node.js (v16 or higher)
MongoDB (local or MongoDB Atlas)
Google OAuth credentials (for Google sign-in)

## Steps

Clone the Repository:
git clone https://github.com/eul523/blogHub
cd blogHub

### Install Dependencies:

#### For the backend:
cd Backend
npm install

#### For the frontend:
cd Frontend
npm install



### Set Up Environment Variables:

Create a .env file in the backend directory with the following:

MONGODBURI
PORT
TOKENSECRET
NOD_ENV=dev
BACKEND_URL=<back-end-url (without slash at the end)>
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
FRONTEND_URL=<front-end-url (without slash at the end)>

Create a .env file in the frontend directory for API URLs or other configs:

VITE_BACKEND_URL=<backend-url (without slash at the end)>


Run the Application:

Start the backend server:
cd backend
npm start

Start the frontend development server:
cd frontend
npm run dev


# Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

Please ensure your code follows the project's coding style and includes relevant tests.