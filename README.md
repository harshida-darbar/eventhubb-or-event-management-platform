# EventHub - Event Management Platform

A comprehensive event management platform built with React, Firebase, and modern web technologies. EventHub allows users to discover, book, and manage events while providing organizers with powerful tools to create and manage their events.

##  Features

### For Users
- **Event Discovery**: Browse events by categories (Music, Dance, Conference, Sports, etc.)
- **Event Booking**: Secure ticket booking with QR code generation
- **Profile Management**: Manage personal profile and preferences
- **Wishlist**: Save favorite events for later
- **My Tickets**: View and manage booked tickets with QR codes
- **Real-time Chat**: Chat with event organizers and other attendees
- **Group Chats**: Join event-specific group discussions
- **QR Scanner**: Scan tickets for event entry
- **Ratings & Reviews**: Rate and review events

### For Organizers
- **Event Creation**: Create and manage events with detailed information
- **Booking Management**: Track and manage event bookings
- **Organizer Dashboard**: Comprehensive dashboard for event analytics
- **Chat System**: Communicate with attendees
- **Rating System**: View event ratings and feedback

### For Administrators
- **User Management**: Manage user accounts and permissions
- **Event Management**: Oversee all events on the platform
- **Organizer Management**: Manage event organizers
- **Booking Management**: Monitor all bookings and transactions
- **Analytics Dashboard**: View platform-wide statistics

##  Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Routing**: React Router DOM
- **Forms**: Formik + Yup validation
- **UI Components**: React Icons, Swiper
- **QR Code**: QR code generation and scanning
- **PDF Generation**: jsPDF for ticket generation
- **Notifications**: React Toastify

##  Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eventhubb.git
   cd eventhubb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore Database, and Storage
   - Copy your Firebase config and update `src/firebase.js`

4. **Environment Setup**
   - Update Firebase configuration in `src/firebase.js` with your project credentials

5. **Run the development server**
   ```bash
   npm run dev
   ```


##  Configuration

### Firebase Configuration
Update the Firebase configuration in `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

##  Usage

### Getting Started
1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Browse Events**: Explore events by categories or search
3. **Book Events**: Select events and book tickets
4. **Manage Profile**: Update your profile information
5. **Chat**: Engage with organizers and other attendees

### For Event Organizers
1. **Create Events**: Add new events with details, images, and pricing
2. **Manage Bookings**: Track attendee registrations
3. **Communicate**: Chat with attendees and answer questions
4. **Analytics**: View event performance and ratings

##  Project Structure

```
eventhubb/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and icons
│   ├── Components/        # Reusable components
│   │   ├── ButtonComponent.jsx
│   │   ├── CardComponent.jsx
│   │   └── PrivateRoute.jsx
│   ├── Pages/             # Page components
│   │   ├── Admin.jsx      # Admin dashboard
│   │   ├── BookEvent.jsx  # Event booking
│   │   ├── Chat.jsx       # Chat functionality
│   │   ├── Dashboard.jsx  # User dashboard
│   │   ├── Login.jsx      # Authentication
│   │   └── ...
│   ├── App.jsx           # Main app component
│   ├── firebase.js       # Firebase configuration
│   └── main.jsx         # App entry point
├── package.json
└── README.md
```

##  Security Features

- Firebase Authentication for secure user management
- Private routes protection
- Input validation with Formik and Yup
- Secure Firebase rules for data access
