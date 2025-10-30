# Planning Poker - Fibonacci Sequence

A real-time planning poker application for agile teams to estimate story points using the Fibonacci sequence.

## Features

- Real-time collaboration using WebSockets (Socket.io)
- Fibonacci sequence voting: 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?
- Single room for all participants
- Vote reveal/hide functionality
- Reset voting rounds
- Voting statistics (average, range, distribution)
- Responsive design for mobile and desktop
- Beautiful gradient UI

## Tech Stack

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-time**: WebSocket communication

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd planning-poker
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## How to Use

1. Open the application in your browser
2. Enter your name and click "Join"
3. Select a card to vote (Fibonacci sequence: 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?)
4. Wait for all participants to vote
5. Click "Reveal Votes" to show everyone's estimates
6. View the voting statistics (average, range, distribution)
7. Click "Reset" to start a new voting round

## Usage Tips

- Multiple people can join the same room by opening the app in different browsers/devices
- All users connect to the same room automatically
- Your vote is hidden until someone clicks "Reveal Votes"
- The "?" card is for "I don't know" or "Too complex to estimate"
- Statistics are calculated automatically when votes are revealed

## Deployment

To deploy to production:

1. Set the PORT environment variable:
```bash
export PORT=3000
```

2. Run the application:
```bash
npm start
```

For cloud deployment (Heroku, Railway, etc.), make sure to:
- Set the `PORT` environment variable
- Use `npm start` as the start command
- Ensure all dependencies are in `package.json`

## License

MIT
