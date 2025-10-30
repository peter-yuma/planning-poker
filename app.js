const fibonacciSequence = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];

// UI Elements
const initialScreen = document.getElementById('initialScreen');
const createScreen = document.getElementById('createScreen');
const joinScreen = document.getElementById('joinScreen');
const waitingScreen = document.getElementById('waitingScreen');
const roomLinkScreen = document.getElementById('roomLinkScreen');
const pokerRoom = document.getElementById('pokerRoom');

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const backFromCreateBtn = document.getElementById('backFromCreateBtn');
const backFromJoinBtn = document.getElementById('backFromJoinBtn');

const hostNameInput = document.getElementById('hostNameInput');
const startHostBtn = document.getElementById('startHostBtn');

const peerNameInput = document.getElementById('peerNameInput');
const roomIdInput = document.getElementById('roomIdInput');
const joinBtn = document.getElementById('joinBtn');

const roomLinkInput = document.getElementById('roomLinkInput');
const roomIdDisplay = document.getElementById('roomIdDisplay');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const continueAsHostBtn = document.getElementById('continueAsHostBtn');

const cardsContainer = document.getElementById('cardsContainer');
const participantsList = document.getElementById('participantsList');
const participantCount = document.getElementById('participantCount');
const roleIndicator = document.getElementById('roleIndicator');
const revealBtn = document.getElementById('revealBtn');
const resetBtn = document.getElementById('resetBtn');
const resultsSection = document.getElementById('resultsSection');
const votingResults = document.getElementById('votingResults');
const connectionStatus = document.getElementById('connectionStatus');

// State
let peer = null;
let isHost = false;
let hostConnection = null;
let peerConnections = {}; // For host: map of peerId -> connection
let users = {}; // For host: map of peerId -> user data
let votes = {}; // For host: map of peerId -> vote
let votesRevealed = false;
let myId = null;
let myName = null;
let myVote = null;

// UI Navigation
function showScreen(screen) {
    [initialScreen, createScreen, joinScreen, waitingScreen, roomLinkScreen, pokerRoom].forEach(s => {
        s.classList.add('hidden');
    });
    screen.classList.remove('hidden');
}

createRoomBtn.addEventListener('click', () => {
    showScreen(createScreen);
    hostNameInput.focus();
});

joinRoomBtn.addEventListener('click', () => {
    showScreen(joinScreen);
    peerNameInput.focus();
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
        peerNameInput.focus();
    }
});

// Host: Create Room
startHostBtn.addEventListener('click', () => {
    const name = hostNameInput.value.trim();
    if (!name) return;

    myName = name;
    isHost = true;

    showScreen(waitingScreen);

    // Set timeout for connection
    const connectionTimeout = setTimeout(() => {
        if (peer && !myId) {
            peer.destroy();
            alert('Connection timed out. The PeerJS server might be slow or unavailable. Please try again.');
            showScreen(createScreen);
        }
    }, 15000); // 15 second timeout

    // Create peer with PeerJS cloud server with config
    peer = new Peer({
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });

    peer.on('open', (id) => {
        clearTimeout(connectionTimeout);
        myId = id;
        console.log('Host peer created with ID:', id);

        // Add self to users
        users[id] = { id, name, vote: null };
        votes[id] = null;

        // Generate room link
        const roomLink = `${window.location.origin}${window.location.pathname}?room=${id}`;
        roomLinkInput.value = roomLink;
        roomIdDisplay.textContent = id;

        showScreen(roomLinkScreen);
    });

    peer.on('connection', (conn) => {
        console.log('Peer connecting:', conn.peer);
        handlePeerConnection(conn);
    });

    peer.on('error', (err) => {
        clearTimeout(connectionTimeout);
        console.error('Peer error:', err);
        let errorMsg = 'Connection error. ';

        if (err.type === 'network') {
            errorMsg += 'Network issue detected. Check your internet connection.';
        } else if (err.type === 'server-error') {
            errorMsg += 'PeerJS server unavailable. Please try again in a moment.';
        } else if (err.type === 'browser-incompatible') {
            errorMsg += 'Your browser does not support WebRTC.';
        } else {
            errorMsg += `Error: ${err.type}`;
        }

        alert(errorMsg);
        showScreen(createScreen);
    });

    peer.on('disconnected', () => {
        console.log('Peer disconnected, attempting to reconnect...');
        if (!peer.destroyed) {
            peer.reconnect();
        }
    });
});

// Host: Handle incoming peer connections
function handlePeerConnection(conn) {
    peerConnections[conn.peer] = conn;

    conn.on('open', () => {
        console.log('Connection opened with:', conn.peer);
    });

    conn.on('data', (data) => {
        console.log('Received from', conn.peer, ':', data);
        handleHostMessage(conn, data);
    });

    conn.on('close', () => {
        console.log('Peer disconnected:', conn.peer);
        delete peerConnections[conn.peer];
        delete users[conn.peer];
        delete votes[conn.peer];
        broadcastGameState();
    });

    conn.on('error', (err) => {
        console.error('Connection error with', conn.peer, ':', err);
    });
}

// Host: Handle messages from peers
function handleHostMessage(conn, data) {
    const peerId = conn.peer;

    switch (data.type) {
        case 'join':
            users[peerId] = { id: peerId, name: data.name, vote: null };
            votes[peerId] = null;
            // Send current game state to new peer
            conn.send({
                type: 'gameState',
                users: Object.values(users),
                votes: votesRevealed ? votes : null,
                revealed: votesRevealed
            });
            // Broadcast to all peers
            broadcastGameState();
            break;

        case 'vote':
            users[peerId].vote = data.value;
            votes[peerId] = data.value;
            broadcastGameState();
            break;

        case 'reveal':
            votesRevealed = true;
            broadcastGameState();
            break;

        case 'reset':
            Object.keys(users).forEach(id => {
                users[id].vote = null;
                votes[id] = null;
            });
            votesRevealed = false;
            broadcastGameState();
            break;
    }
}

// Host: Broadcast game state to all peers
function broadcastGameState() {
    const state = {
        type: 'gameState',
        users: Object.values(users),
        votes: votesRevealed ? votes : null,
        revealed: votesRevealed
    };

    Object.values(peerConnections).forEach(conn => {
        if (conn.open) {
            conn.send(state);
        }
    });

    // Update own UI
    updateUI(state);
}

// Copy room link
copyLinkBtn.addEventListener('click', () => {
    roomLinkInput.select();
    document.execCommand('copy');
    copyLinkBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyLinkBtn.textContent = 'Copy Link';
    }, 2000);
});

// Host: Continue to room
continueAsHostBtn.addEventListener('click', () => {
    showScreen(pokerRoom);
    roleIndicator.textContent = 'HOST';
    initializeCards();
    broadcastGameState();
});

// Peer: Join Room
joinBtn.addEventListener('click', () => {
    const name = peerNameInput.value.trim();
    const roomId = roomIdInput.value.trim();

    if (!name || !roomId) return;

    myName = name;
    isHost = false;

    showScreen(waitingScreen);
    document.querySelector('#waitingScreen .status-text').textContent = 'Connecting to room...';

    // Set timeout for connection
    const connectionTimeout = setTimeout(() => {
        if (peer && !hostConnection?.open) {
            peer.destroy();
            alert('Connection timed out. The host might be offline or the Room ID is incorrect. Please check and try again.');
            showScreen(joinScreen);
        }
    }, 20000); // 20 second timeout for joining

    // Create peer with config
    peer = new Peer({
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });

    peer.on('open', (id) => {
        myId = id;
        console.log('Peer created with ID:', id);

        // Connect to host with timeout
        hostConnection = peer.connect(roomId, {
            reliable: true
        });

        const hostConnectTimeout = setTimeout(() => {
            if (!hostConnection.open) {
                clearTimeout(connectionTimeout);
                peer.destroy();
                alert('Could not connect to host. The Room ID may be incorrect or the host is offline.');
                showScreen(joinScreen);
            }
        }, 15000);

        hostConnection.on('open', () => {
            clearTimeout(connectionTimeout);
            clearTimeout(hostConnectTimeout);
            console.log('Connected to host');
            connectionStatus.classList.remove('hidden');
            connectionStatus.classList.add('connected');
            connectionStatus.querySelector('.status-text').textContent = 'Connected';

            // Send join message
            hostConnection.send({
                type: 'join',
                name: myName
            });

            showScreen(pokerRoom);
            roleIndicator.textContent = 'PARTICIPANT';
            initializeCards();
        });

        hostConnection.on('data', (data) => {
            console.log('Received from host:', data);
            handlePeerMessage(data);
        });

        hostConnection.on('close', () => {
            console.log('Disconnected from host');
            connectionStatus.classList.remove('connected');
            connectionStatus.classList.add('error');
            connectionStatus.querySelector('.status-text').textContent = 'Disconnected from host';
            alert('Connection to host lost. The host may have closed the room.');
        });

        hostConnection.on('error', (err) => {
            clearTimeout(connectionTimeout);
            clearTimeout(hostConnectTimeout);
            console.error('Connection error:', err);
            alert(`Failed to connect to room. The Room ID may be incorrect or the host is unavailable.`);
            showScreen(joinScreen);
        });
    });

    peer.on('error', (err) => {
        clearTimeout(connectionTimeout);
        console.error('Peer error:', err);
        let errorMsg = 'Connection error. ';

        if (err.type === 'peer-unavailable') {
            errorMsg += 'Room not found. Please check the Room ID.';
        } else if (err.type === 'network') {
            errorMsg += 'Network issue detected. Check your internet connection.';
        } else if (err.type === 'server-error') {
            errorMsg += 'PeerJS server unavailable. Please try again in a moment.';
        } else {
            errorMsg += `Error: ${err.type}`;
        }

        alert(errorMsg);
        showScreen(joinScreen);
    });

    peer.on('disconnected', () => {
        console.log('Peer disconnected, attempting to reconnect...');
        if (!peer.destroyed) {
            peer.reconnect();
        }
    });
});

// Peer: Handle messages from host
function handlePeerMessage(data) {
    if (data.type === 'gameState') {
        updateUI(data);
    }
}

// Initialize voting cards
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

// Select a card
function selectCard(cardElement, value) {
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected');
    });

    cardElement.classList.add('selected');
    myVote = value;

    if (isHost) {
        // Host votes directly
        users[myId].vote = value;
        votes[myId] = value;
        broadcastGameState();
    } else {
        // Peer sends vote to host
        if (hostConnection && hostConnection.open) {
            hostConnection.send({
                type: 'vote',
                value: value
            });
        }
    }
}

// Update UI with game state
function updateUI(data) {
    const { users: usersList, votes: votesList, revealed } = data;

    participantCount.textContent = `${usersList.length} participant${usersList.length !== 1 ? 's' : ''}`;

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
        if (user.id === myId) {
            nameSpan.textContent += ' (You)';
        }

        const voteSpan = document.createElement('span');

        if (revealed && votesList && votesList[user.id] !== null) {
            voteSpan.className = 'participant-vote';
            voteSpan.textContent = votesList[user.id];
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

    votesRevealed = revealed;

    if (revealed) {
        showResults(usersList, votesList);
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

// Show results
function showResults(usersList, votesList) {
    resultsSection.classList.remove('hidden');
    votingResults.innerHTML = '';

    const voteCounts = {};
    const voteValues = [];

    usersList.forEach(user => {
        const vote = votesList[user.id];
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
            divider.style.borderTop = '2px solid #667eea';
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

// Reveal votes
revealBtn.addEventListener('click', () => {
    if (isHost) {
        votesRevealed = true;
        broadcastGameState();
    } else {
        if (hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'reveal' });
        }
    }
});

// Reset voting
resetBtn.addEventListener('click', () => {
    myVote = null;
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected');
    });

    if (isHost) {
        Object.keys(users).forEach(id => {
            users[id].vote = null;
            votes[id] = null;
        });
        votesRevealed = false;
        broadcastGameState();
    } else {
        if (hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'reset' });
        }
    }
});
