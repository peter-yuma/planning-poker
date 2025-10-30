# Planning Poker - Fibonacci Sequence (P2P)

A real-time peer-to-peer planning poker application for agile teams to estimate story points using the Fibonacci sequence. No server required!

## Features

- **Peer-to-Peer**: Direct browser-to-browser communication using WebRTC
- **No Server Needed**: Host and join rooms without any backend
- **Fibonacci Sequence**: 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?
- **Real-time Updates**: Instant synchronization across all participants
- **Vote Reveal/Hide**: Control when estimates are shown
- **Reset Rounds**: Start new voting sessions
- **Voting Statistics**: Average, range, and distribution
- **Responsive Design**: Works on mobile and desktop
- **GitHub Pages Compatible**: Deploy for free on GitHub Pages

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **P2P Communication**: PeerJS (WebRTC wrapper)
- **Deployment**: GitHub Pages (or any static host)

## Quick Start

### Option 1: Use it Live

1. **Host**: Open the app and click "Create Room"
2. **Share**: Copy the room link and send it to your team
3. **Join**: Others click the link and enter their names
4. **Vote**: Everyone selects their estimate
5. **Reveal**: Click "Reveal Votes" to see results

### Option 2: Local Development

Simply open `index.html` in your browser - no build step required!

Or use a simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

## How to Use

### Creating a Room (Host)

1. Click **"Create Room"**
2. Enter your name
3. Click **"Create & Host"**
4. Copy the room link or Room ID
5. Share with your team
6. Click **"Continue to Room"**

**Important**: As the host, keep your browser tab open. If you close it, the room will disconnect for everyone.

### Joining a Room (Participant)

1. Click **"Join Room"**
2. Enter your name
3. Paste the Room ID or use the shared link
4. Click **"Join Room"**

### Voting

1. Click any Fibonacci card to vote
2. Your vote is hidden until revealed
3. Green dot shows who has voted
4. Click **"Reveal Votes"** to show everyone's estimates
5. Click **"Reset"** to start a new round

## Deployment to GitHub Pages

### Quick Deploy (Easiest)

1. Push this repo to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to **Settings** → **Pages** on GitHub
3. Under **Source**, select branch (e.g., `main`) and folder `/` (root)
4. Click **Save**
5. Your app will be live at `https://[username].github.io/[repo-name]/`

Done! Share the URL with your team.

### Alternative: GitHub Actions (Custom Domain)

For custom domains or more control, use GitHub Actions with a deploy workflow.

## How It Works

### Architecture

```
┌─────────────┐
│   Host      │ ← Creates room, manages state
│  (Browser)  │ ← Must stay connected
└──────┬──────┘
       │
       ├──── WebRTC P2P ────┐
       │                    │
┌──────▼─────┐      ┌──────▼─────┐
│  Peer 1    │      │  Peer 2    │
│ (Browser)  │      │ (Browser)  │
└────────────┘      └────────────┘
```

- **Host**: First person to create the room becomes the host
- **PeerJS Cloud**: Free TURN/STUN servers for NAT traversal
- **Direct P2P**: All communication is browser-to-browser
- **No Database**: State is held in the host's browser
- **Room Lifespan**: Room exists as long as host keeps tab open

### Connection Flow

1. Host creates a Peer with unique ID
2. Peers connect to Host using that ID
3. WebRTC establishes direct P2P connection
4. Host broadcasts game state to all peers
5. Peers send votes/actions to Host
6. Host updates state and re-broadcasts

## Limitations

- **Host Dependency**: If host closes their browser, room ends
- **Connection Success Rate**: ~95% (NAT/firewall issues in ~5% of cases)
- **Scalability**: Works well for 2-15 participants
- **No Persistence**: State is lost when host disconnects

## Troubleshooting

### "Failed to connect to room"
- Check if Room ID is correct
- Ensure host's browser tab is still open
- Try creating a new room

### Votes not updating
- Check your internet connection
- Ensure you haven't lost connection to host
- Check browser console for errors

### Connection issues behind corporate firewall
- Some corporate networks block WebRTC
- Try using a different network or VPN
- PeerJS uses free STUN/TURN servers which may be blocked

## Browser Compatibility

Works in all modern browsers:
- Chrome 56+
- Firefox 44+
- Safari 11+
- Edge 79+

Requires WebRTC support.

## Privacy & Security

- **No Server Storage**: All data is in browser memory only
- **P2P Only**: Data flows directly between browsers
- **No Analytics**: No tracking or data collection
- **Ephemeral**: All data is lost when host closes tab

## License

MIT

## Contributing

Contributions welcome! Please open an issue or pull request.

## Credits

- **PeerJS**: Simplified WebRTC wrapper
- **PeerJS Cloud**: Free STUN/TURN servers
