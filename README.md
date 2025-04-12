# LinkShort - Advanced URL Shortener

A modern and feature-rich URL shortening application built with React, Node.js, Express, and MongoDB. This application allows users to create, manage, and track shortened links with detailed analytics.

## Features

- URL Shortening with custom slugs
- User Authentication
- QR Code generation for shortened links
- Detailed Analytics with charts
- Copy to clipboard functionality
- Responsive design
- GSAP animations for a modern UI experience

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- GSAP for animations
- Chart.js for analytics visualization
- Axios for API requests

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- CORS for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/ibrahimsohofi/link-shortener.git
cd link-shortener
```

2. Install dependencies for frontend
```bash
bun install
```

3. Install dependencies for backend
```bash
cd server
npm install
```

4. Create a `.env` file in the server directory with your MongoDB connection string and JWT secret
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BASE_URL=http://localhost:5000
```

5. Start the backend server
```bash
cd server
npm run dev
```

6. Start the frontend application in a new terminal
```bash
# From the project root
bun run dev
```

## Usage

1. Register a new account or login with existing credentials
2. Enter a long URL to shorten it
3. Optionally add a custom slug for your shortened URL
4. View your shortened links in the dashboard
5. Click on a link to view detailed analytics
6. Generate a QR code for easy sharing

## License

This project is licensed under the MIT License - see the LICENSE file for details.
