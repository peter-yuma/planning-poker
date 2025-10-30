# Planning Poker - Fibonacci Sequence

A real-time planning poker application for agile teams to estimate story points using the Fibonacci sequence. Powered by Firebase for reliable, real-time collaboration.

## ✨ Features

- **Real-time Sync**: Instant updates across all participants via Firebase
- **Fibonacci Sequence**: 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?
- **No Host Dependency**: Anyone can close their browser without affecting others
- **Vote Reveal/Hide**: Control when estimates are shown
- **Reset Rounds**: Start new voting sessions
- **Voting Statistics**: Average, range, and distribution
- **Responsive Design**: Works on mobile and desktop
- **GitHub Pages Compatible**: Deploy for free
- **99.9% Uptime**: Firebase's rock-solid infrastructure

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name (e.g., "planning-poker")
4. Disable Google Analytics (optional, not needed)
5. Click **"Create project"**

### Step 2: Get Firebase Configuration

1. In your new project, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: "Planning Poker Web"
3. **Don't check** "Firebase Hosting" (we'll use GitHub Pages)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxx"
};
```

### Step 3: Enable Realtime Database

1. In Firebase Console, go to **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Choose location (closest to your team)
4. Start in **"Test mode"** (we'll secure it later)
5. Click **"Enable"**

### Step 4: Add Config to Your Code

1. Open `app.js` in your code editor
2. Find the `firebaseConfig` object at the top (lines 16-24)
3. Replace it with YOUR config from Step 2
4. Save the file

```javascript
// In app.js, replace this:
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",  // ← Replace this
    // ... rest of config
};

// With YOUR actual config from Firebase Console
```

### Step 5: Deploy to GitHub Pages

1. Commit and push your changes:
```bash
git add app.js
git commit -m "Add Firebase configuration"
git push
```

2. Enable GitHub Pages:
   - Go to repository **Settings** → **Pages**
   - Source: Select your branch (e.g., `main`)
   - Folder: `/ (root)`
   - Click **Save**

3. Your app will be live at: `https://[username].github.io/planning-poker/`

**Done!** 🎉

## 🎮 How to Use

### Creating a Room

1. Open the app
2. Click **"Create New Room"**
3. Enter your name
4. Share the Room ID or link with your team

### Joining a Room

1. Open the app (or click shared link)
2. Click **"Join Existing Room"**
3. Enter your name and Room ID
4. Start voting!

### Voting

1. Click any Fibonacci card to vote
2. Your vote is hidden until revealed (green dot shows you voted)
3. Anyone can click **"Reveal Votes"** to show everyone's estimates
4. View statistics: average, range, distribution
5. Click **"Reset"** to start a new round

## 🔧 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase Realtime Database
- **Hosting**: GitHub Pages (or any static host)
- **Real-time**: Firebase WebSocket connections

## 🔐 Security (Important!)

Your database is currently in **test mode** (open to everyone). For production:

1. Go to **Realtime Database** → **Rules** tab
2. Replace rules with:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        "$userId": {
          ".validate": "newData.hasChildren(['name', 'vote'])"
        }
      }
    }
  }
}
```

3. Click **"Publish"**

This allows anyone to read/write rooms, but validates the data structure. For stricter security, implement Firebase Authentication.

## 🏗️ Architecture

```
Browser 1 ──┐
            ├──→ Firebase Realtime Database ←──┐
Browser 2 ──┘                                   │
                                                ├── Browser 3
                                                │
                                                └── Browser 4
```

- All users connect to Firebase
- Data syncs in real-time
- No host dependency
- Works behind firewalls

## 📁 Project Structure

```
planning-poker/
├── index.html          # Main HTML structure
├── style.css           # Styling
├── app.js              # Firebase + app logic
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

## 🐛 Troubleshooting

### "Firebase not configured" Alert

- You haven't added your Firebase config to `app.js`
- Follow **Step 4** above

### "Permission denied" Error

- Your database rules are too restrictive
- Check **Security** section above
- Make sure database is in "test mode" initially

### Room not found

- Check the Room ID is correct (case-sensitive)
- Room IDs are 6 characters: A-Z, 2-9 (no 0, 1, I, O)

### Not syncing in real-time

- Check your internet connection
- Open browser console (F12) for errors
- Verify Firebase configuration is correct

## 💰 Cost

**Completely FREE** for this use case!

Firebase Free Tier:
- **1 GB** stored data (you'll use <1 MB)
- **10 GB/month** downloads (you'll use <100 MB)
- **100 simultaneous connections** (perfect for teams)

You won't hit these limits unless you have hundreds of concurrent sessions.

## 🌟 Advantages Over WebRTC/PeerJS

| Feature | Firebase | WebRTC/PeerJS |
|---------|----------|---------------|
| Reliability | ⭐⭐⭐⭐⭐ 99.9% | ⭐⭐⭐ ~95% |
| Connection Speed | ⭐⭐⭐⭐⭐ Instant | ⭐⭐⭐ 5-15 sec |
| Firewall Issues | ⭐⭐⭐⭐⭐ Rare | ⭐⭐⭐ Common |
| Host Dependency | ✅ None | ❌ Required |
| Setup Complexity | ⭐⭐⭐ Medium | ⭐⭐ Easy |
| Persistence | ✅ Optional | ❌ None |

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or pull request.

## ❓ FAQ

### Do I need a credit card for Firebase?

No! The free tier doesn't require payment information.

### Can I use a custom domain?

Yes! Deploy to Firebase Hosting or configure GitHub Pages with your domain.

### How long do rooms persist?

Rooms persist until all users leave. Users are automatically removed when they close their browser.

### Can I add authentication?

Yes! Firebase supports Google, Email, and other auth providers. You'd need to modify the code to add auth.

### What if Firebase goes down?

Firebase has 99.9% uptime. If it's down, the app won't work until it's back up. For mission-critical use, consider adding a fallback or running your own backend.

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Realtime Database Guide](https://firebase.google.com/docs/database/web/start)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
