// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================
//
// Replace this with your own Firebase configuration
// Get it from: https://console.firebase.google.com/
//
// Steps:
// 1. Create project at https://console.firebase.google.com/
// 2. Click "Add app" → Web (</> icon)
// 3. Copy the firebaseConfig object
// 4. Replace the config below
// 5. Go to "Build" → "Realtime Database" → "Create Database"
// 6. Choose location and start in "test mode"
//
const firebaseConfig = {
    // REPLACE WITH YOUR FIREBASE CONFIG
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    alert("⚠️ Firebase not configured!\n\nPlease add your Firebase configuration in app.js.\n\nSee README.md for setup instructions.");
}

let app, database;
try {
    app = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
} catch (error) {
    console.error("Firebase initialization error:", error);
    alert("Firebase configuration error. Please check your config in app.js");
}

// ============================================================================
// CONSTANTS & STATE
// ============================================================================

const fibonacciSequence = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];

// UI Elements
const initialScreen = document.getElementById('initialScreen');
const createScreen = document.getElementById('createScreen');
const joinScreen = document.getElementById('joinScreen');
const roomLinkScreen = document.getElementById('roomLinkScreen');
const pokerRoom = document.getElementById('pokerRoom');

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const backFromCreateBtn = document.getElementById('backFromCreateBtn');
const backFromJoinBtn = document.getElementById('backFromJoinBtn');

const createNameInput = document.getElementById('createNameInput');
const createRoomSubmitBtn = document.getElementById('createRoomSubmitBtn');

const joinNameInput = document.getElementById('joinNameInput');
const roomIdInput = document.getElementById('roomIdInput');
const joinRoomSubmitBtn = document.getElementById('joinRoomSubmitBtn');

const roomLinkInput = document.getElementById('roomLinkInput');
const roomIdDisplay = document.getElementById('roomIdDisplay');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const continueToRoomBtn = document.getElementById('continueToRoomBtn');

const cardsContainer = document.getElementById('cardsContainer');
const participantsList = document.getElementById('participantsList');
const participantCount = document.getElementById('participantCount');
const revealBtn = document.getElementById('revealBtn');
const resetBtn = document.getElementById('resetBtn');
const resultsSection = document.getElementById('resultsSection');
const votingResults = document.getElementById('votingResults');

// State
let currentRoomId = null;
let currentUserId = null;
let currentUserName = null;
let myVote = null;
let roomListener = null;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showScreen(screen) {
    [initialScreen, createScreen, joinScreen, roomLinkScreen, pokerRoom].forEach(s => {
        s.classList.add('hidden');
    });
    screen.classList.remove('hidden');
}

function generateRoomId() {
    // Generate a readable 6-character room ID
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================================================
// NAVIGATION HANDLERS
// ============================================================================

createRoomBtn.addEventListener('click', () => {
    showScreen(createScreen);
    createNameInput.focus();
});

joinRoomBtn.addEventListener('click', () => {
    showScreen(joinScreen);
    joinNameInput.focus();
});

backFromCreateBtn.addEventListener('click', () => {
    showScreen(initialScreen);
});

backFromJoinBtn.addEventListener('click', () => {
    showScreen(initialScreen);
});

// Check if joining via URL parameter
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId) {
        showScreen(joinScreen);
        roomIdInput.value = roomId;
        joinNameInput.focus();
    }
});

// ============================================================================
// ROOM MANAGEMENT
// ============================================================================

// Create Room
createRoomSubmitBtn.addEventListener('click', async () => {
    const name = createNameInput.value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }

    currentUserName = name;
    currentUserId = generateUserId();
    currentRoomId = generateRoomId();

    try {
        // Create room in Firebase
        await database.ref(`rooms/${currentRoomId}`).set({
            createdAt: Date.now(),
            revealed: false
        });

        // Add self to room
        await database.ref(`rooms/${currentRoomId}/users/${currentUserId}`).set({
            name: currentUserName,
            vote: null,
            joinedAt: Date.now()
        });

        // Show room link screen
        const roomLink = `${window.location.origin}${window.location.pathname}?room=${currentRoomId}`;
        roomLinkInput.value = roomLink;
        roomIdDisplay.textContent = currentRoomId;

        showScreen(roomLinkScreen);
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room. Please check your Firebase configuration.');
    }
});

// Join Room
joinRoomSubmitBtn.addEventListener('click', async () => {
    const name = joinNameInput.value.trim();
    const roomId = roomIdInput.value.trim().toUpperCase();

    if (!name) {
        alert('Please enter your name');
        return;
    }

    if (!roomId) {
        alert('Please enter a Room ID');
        return;
    }

    currentUserName = name;
    currentUserId = generateUserId();
    currentRoomId = roomId;

    try {
        // Check if room exists
        const roomSnapshot = await database.ref(`rooms/${currentRoomId}`).once('value');

        if (!roomSnapshot.exists()) {
            alert('Room not found. Please check the Room ID.');
            return;
        }

        // Add self to room
        await database.ref(`rooms/${currentRoomId}/users/${currentUserId}`).set({
            name: currentUserName,
            vote: null,
            joinedAt: Date.now()
        });

        // Go to poker room
        enterPokerRoom();
    } catch (error) {
        console.error('Error joining room:', error);
        alert('Failed to join room. Please try again.');
    }
});

// Continue to room (after creating)
continueToRoomBtn.addEventListener('click', () => {
    enterPokerRoom();
});

// Copy room link
copyLinkBtn.addEventListener('click', () => {
    roomLinkInput.select();
    document.execCommand('copy');
    copyLinkBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyLinkBtn.textContent = 'Copy Link';
    }, 2000);
});

// ============================================================================
// POKER ROOM
// ============================================================================

function enterPokerRoom() {
    showScreen(pokerRoom);
    initializeCards();
    listenToRoomChanges();
    setupPresence();
}

function setupPresence() {
    // Remove user from room when they disconnect
    const userRef = database.ref(`rooms/${currentRoomId}/users/${currentUserId}`);

    userRef.onDisconnect().remove();

    // Also clean up old rooms (optional)
    window.addEventListener('beforeunload', () => {
        userRef.remove();
    });
}

function listenToRoomChanges() {
    // Listen to all changes in the room
    roomListener = database.ref(`rooms/${currentRoomId}`).on('value', (snapshot) => {
        const roomData = snapshot.val();

        if (!roomData) {
            // Room was deleted
            alert('Room no longer exists.');
            leaveRoom();
            return;
        }

        updateUI(roomData);
    });
}

function updateUI(roomData) {
    const users = roomData.users || {};
    const revealed = roomData.revealed || false;
    const usersList = Object.keys(users).map(uid => ({
        id: uid,
        ...users[uid]
    }));

    // Update participant count
    participantCount.textContent = `${usersList.length} participant${usersList.length !== 1 ? 's' : ''}`;

    // Update participants list
    participantsList.innerHTML = '';

    usersList.forEach(user => {
        const participantCard = document.createElement('div');
        participantCard.className = 'participant-card';

        if (user.vote !== null) {
            participantCard.classList.add('voted');
        }

        const nameSpan = document.createElement('span');
        nameSpan.className = 'participant-name';
        nameSpan.textContent = user.name;
        if (user.id === currentUserId) {
            nameSpan.textContent += ' (You)';
        }

        const voteSpan = document.createElement('span');

        if (revealed && user.vote !== null) {
            voteSpan.className = 'participant-vote';
            voteSpan.textContent = user.vote;
        } else if (user.vote !== null) {
            const statusDot = document.createElement('span');
            statusDot.className = 'vote-status voted';
            voteSpan.appendChild(statusDot);
        } else {
            const statusDot = document.createElement('span');
            statusDot.className = 'vote-status';
            voteSpan.appendChild(statusDot);
        }

        participantCard.appendChild(nameSpan);
        participantCard.appendChild(voteSpan);
        participantsList.appendChild(participantCard);
    });

    // Update results
    if (revealed) {
        showResults(usersList);
    } else {
        resultsSection.classList.add('hidden');
        // Restore selected card if not revealed
        if (myVote !== null) {
            const selectedCard = document.querySelector(`.card[data-value="${myVote}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
        }
    }
}

function showResults(usersList) {
    resultsSection.classList.remove('hidden');
    votingResults.innerHTML = '';

    const voteCounts = {};
    const voteValues = [];

    usersList.forEach(user => {
        const vote = user.vote;
        if (vote !== null && vote !== '?') {
            voteValues.push(Number(vote));
            voteCounts[vote] = (voteCounts[vote] || 0) + 1;
        }
    });

    const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);

    if (sortedVotes.length > 0) {
        const voteSummary = document.createElement('div');
        voteSummary.className = 'statistics';

        sortedVotes.forEach(([vote, count]) => {
            const row = document.createElement('div');
            row.className = 'stat-row';

            const label = document.createElement('span');
            label.className = 'stat-label';
            label.textContent = `${vote} points`;

            const value = document.createElement('span');
            value.className = 'stat-value';
            value.textContent = `${count} vote${count !== 1 ? 's' : ''}`;

            row.appendChild(label);
            row.appendChild(value);
            voteSummary.appendChild(row);
        });

        if (voteValues.length > 0) {
            const avg = voteValues.reduce((a, b) => a + b, 0) / voteValues.length;
            const min = Math.min(...voteValues);
            const max = Math.max(...voteValues);

            const divider = document.createElement('div');
            divider.className = 'stat-row';
            divider.style.borderTop = '2px solid rgb(200, 184, 255)';
            divider.style.marginTop = '10px';
            divider.style.paddingTop = '10px';

            const avgLabel = document.createElement('span');
            avgLabel.className = 'stat-label';
            avgLabel.textContent = 'Average';

            const avgValue = document.createElement('span');
            avgValue.className = 'stat-value';
            avgValue.textContent = avg.toFixed(1);

            divider.appendChild(avgLabel);
            divider.appendChild(avgValue);
            voteSummary.appendChild(divider);

            const rangeRow = document.createElement('div');
            rangeRow.className = 'stat-row';

            const rangeLabel = document.createElement('span');
            rangeLabel.className = 'stat-label';
            rangeLabel.textContent = 'Range';

            const rangeValue = document.createElement('span');
            rangeValue.className = 'stat-value';
            rangeValue.textContent = `${min} - ${max}`;

            rangeRow.appendChild(rangeLabel);
            rangeRow.appendChild(rangeValue);
            voteSummary.appendChild(rangeRow);
        }

        votingResults.appendChild(voteSummary);
    } else {
        const noVotes = document.createElement('p');
        noVotes.style.textAlign = 'center';
        noVotes.style.color = '#999';
        noVotes.textContent = 'No numeric votes cast';
        votingResults.appendChild(noVotes);
    }
}

// ============================================================================
// VOTING
// ============================================================================

function initializeCards() {
    cardsContainer.innerHTML = '';
    fibonacciSequence.forEach(value => {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = value;
        card.dataset.value = value;

        card.addEventListener('click', () => {
            selectCard(card, value);
        });

        cardsContainer.appendChild(card);
    });
}

function selectCard(cardElement, value) {
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected');
    });

    cardElement.classList.add('selected');
    myVote = value;

    // Update vote in Firebase
    database.ref(`rooms/${currentRoomId}/users/${currentUserId}/vote`).set(value);
}

// Reveal votes
revealBtn.addEventListener('click', () => {
    database.ref(`rooms/${currentRoomId}/revealed`).set(true);
});

// Reset voting
resetBtn.addEventListener('click', async () => {
    myVote = null;
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected');
    });

    try {
        // Reset all votes and revealed status
        const updates = {};
        updates[`rooms/${currentRoomId}/revealed`] = false;

        // Get all users and reset their votes
        const usersSnapshot = await database.ref(`rooms/${currentRoomId}/users`).once('value');
        const users = usersSnapshot.val() || {};

        Object.keys(users).forEach(userId => {
            updates[`rooms/${currentRoomId}/users/${userId}/vote`] = null;
        });

        await database.ref().update(updates);
    } catch (error) {
        console.error('Error resetting votes:', error);
    }
});

// ============================================================================
// CLEANUP
// ============================================================================

function leaveRoom() {
    if (roomListener) {
        database.ref(`rooms/${currentRoomId}`).off('value', roomListener);
        roomListener = null;
    }

    if (currentUserId && currentRoomId) {
        database.ref(`rooms/${currentRoomId}/users/${currentUserId}`).remove();
    }

    currentRoomId = null;
    currentUserId = null;
    currentUserName = null;
    myVote = null;

    showScreen(initialScreen);
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (currentUserId && currentRoomId) {
        database.ref(`rooms/${currentRoomId}/users/${currentUserId}`).remove();
    }
});
