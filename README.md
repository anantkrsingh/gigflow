# GigFlow - Freelance Marketplace Platform

A full-stack freelance marketplace platform where clients can post jobs (Gigs) and freelancers can apply for them (Bids).

## Features

- **User Authentication**: Secure sign-up and login with JWT and HttpOnly cookies
- **Gig Management**: Create, browse, and search gigs
- **Bidding System**: Freelancers can place bids on open gigs
- **Hiring Logic**: Clients can hire freelancers with transactional integrity
- **Real-time Notifications**: Socket.io integration for instant notifications when hired
- **Race Condition Prevention**: MongoDB transactions ensure atomic hiring operations

## Tech Stack

### Frontend
- React.js with Vite
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Redux Toolkit for state management
- Socket.io client for real-time updates
- React Router for navigation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication with HttpOnly cookies
- Socket.io for real-time communication
- Express Validator for input validation

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user

### Gigs
- `GET /api/gigs?search=query` - Get all open gigs (with optional search)
- `POST /api/gigs` - Create a new gig (protected)

### Bids
- `POST /api/bids` - Create a bid (protected)
- `GET /api/bids/:gigId` - Get all bids for a gig (owner only, protected)
- `PATCH /api/bids/:bidId/hire` - Hire a freelancer (protected)

## Project Structure

```
gigflow/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── lib/            # Utilities and API config
│   │   └── App.tsx         # Main app component
│   └── package.json
├── server/                 # Backend Express application
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── middlewares/        # Custom middlewares
│   └── index.js            # Server entry point
└── README.md
```

## Key Features Implementation

### Transactional Integrity (Bonus 1)
The hiring logic uses MongoDB transactions to ensure atomicity. When a client hires a freelancer:
1. The gig status changes from "open" to "assigned"
2. The selected bid status becomes "hired"
3. All other pending bids for that gig are marked as "rejected"

All these operations happen within a single transaction, preventing race conditions.

### Real-time Updates (Bonus 2)
Socket.io is integrated to provide real-time notifications. When a client hires a freelancer:
- The freelancer receives an instant notification without page refresh
- The notification appears as a toast message in the UI

## Usage

1. **Register/Login**: Create an account or login to access the platform
2. **Post a Gig**: As a client, create a new job posting with title, description, and budget
3. **Browse Gigs**: View all open gigs on the home page
4. **Place a Bid**: As a freelancer, submit a bid with your message and price
5. **Review Bids**: As a client, view all bids for your gigs
6. **Hire Freelancer**: Select a bid and hire the freelancer
7. **Real-time Notifications**: Freelancers receive instant notifications when hired

## Notes

- All authentication uses HttpOnly cookies for security
- The platform supports fluid roles - any user can be both a client and freelancer
- Search functionality allows filtering gigs by title
- The UI follows a black and white design theme with shadcn/ui components

