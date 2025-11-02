# FinWise AI - Financial Assistant

A React-based financial assistant application with AI-powered insights and gamification features.

## Features

- **AI Chat Assistant**: Get personalized financial advice
- **Budget Builder**: Create and manage your budget
- **Financial Literacy Quests**: Learn through interactive quests
- **Investment Plans**: Explore investment options
- **Savings Simulator**: Simulate savings scenarios
- **Loan Risk Lab**: Assess loan risks
- **Government Schemes**: Discover relevant government schemes
- **Hidden Cost Visualizer**: Identify hidden costs
- **Income Inflation Tracker**: Track income vs inflation
- **Monthly Analysis**: Analyze monthly expenses
- **User Profile**: Manage your profile and progress

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: JSON Server (for development)
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **3D Graphics**: Three.js, React Three Fiber
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI Integration**: Google Gemini AI

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd finwise-ai-financial-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Google Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the JSON Server (database):
   ```bash
   npx json-server --watch db.json --port 3001
   ```

5. In a new terminal, start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

The app uses a simple JSON Server-based authentication system for development:

- **Login**: Use `test@example.com` / `password`
- **Signup**: Create new accounts that persist in the JSON database

## Project Structure

```
src/
├── components/          # React components
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
├── index.tsx           # App entry point
├── index.css           # Global styles
db.json                 # JSON Server database
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npx json-server --watch db.json --port 3001` - Start JSON Server

## API Endpoints

JSON Server provides the following endpoints:

- `GET/POST/PUT/DELETE /users` - User management
- `GET/POST/PUT/DELETE /budgetEntries` - Budget entries
- `GET /schemes` - Government schemes
- `GET /cityCostData` - City cost data
- `GET /professionSalaries` - Profession salary data
- `GET /quests` - Game quests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
