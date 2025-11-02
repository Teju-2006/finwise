# finwise
financial literacy assistance app
>>>>>>> ac1ebeb936f1eeea78498a588c3aa5c96665b6bb
=======
# FinWise AI Financial Assistant

A comprehensive financial literacy app built with React, TypeScript, and Firebase. Features include AI-powered financial advice, budget tracking, investment planning, and gamified learning experiences.

## Features

- **AI Chat Assistant**: Get personalized financial advice using Google's Gemini AI
- **Budget Builder**: Track income and expenses with visual analytics
- **Investment Plans**: Explore various investment options and schemes
- **Government Schemes**: Discover eligible financial schemes and benefits
- **Financial Literacy Hub**: Interactive learning modules and quests
- **User Authentication**: Secure login/signup with Firebase Auth and Google sign-in
- **Real-time Database**: User data persistence with Firestore

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore)
- **AI**: Google Gemini API
- **3D Graphics**: Three.js, React Three Fiber

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Teju-2006/finwise.git
   cd finwise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password and Google provider)
   - Enable Firestore Database
   - Copy your Firebase config and replace the placeholder in `services/firebase.ts`

4. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key: `VITE_GEMINI_API_KEY=your_api_key_here`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Configuration

Update `services/firebase.ts` with your Firebase project configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
=======
# finwise
financial literacy assistance app
>>>>>>> ac1ebeb936f1eeea78498a588c3aa5c96665b6bb
