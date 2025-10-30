const socket = io();

const fibonacciSequence = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];

let currentUser = null;
let selectedVote = null;

const joinScreen = document.getElementById('joinScreen');
const pokerRoom = document.getElementById('pokerRoom');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const cardsContainer = document.getElementById('cardsContainer');
const participantsList = document.getElementById('participantsList');
const participantCount = document.getElementById('participantCount');
const revealBtn = document.getElementById('revealBtn');
const resetBtn = document.getElementById('resetBtn');
const resultsSection = document.getElementById('resultsSection');
const votingResults = document.getElementById('votingResults');

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
    selectedVote = value;
    socket.emit('vote', value);
}

function updateParticipants(data) {
    const { users, votes, revealed } = data;

    participantCount.textContent = `${users.length} participant${users.length !== 1 ? 's' : ''}`;

    participantsList.innerHTML = '';

    users.forEach(user => {
        const participantCard = document.createElement('div');
        participantCard.className = 'participant-card';

        if (user.vote !== null) {
            participantCard.classList.add('voted');
        }

        const nameSpan = document.createElement('span');
        nameSpan.className = 'participant-name';
        nameSpan.textContent = user.name;

        const voteSpan = document.createElement('span');

        if (revealed && votes && votes[user.id] !== null) {
            voteSpan.className = 'participant-vote';
            voteSpan.textContent = votes[user.id];
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

    if (revealed) {
        showResults(users, votes);
    } else {
        resultsSection.classList.add('hidden');
    }
}

function showResults(users, votes) {
    resultsSection.classList.remove('hidden');
    votingResults.innerHTML = '';

    const voteCounts = {};
    const voteValues = [];

    users.forEach(user => {
        const vote = votes[user.id];
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
        noVotes.textContent = 'No votes cast yet';
        votingResults.appendChild(noVotes);
    }
}

joinBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        socket.emit('join', username);
        joinScreen.classList.add('hidden');
        pokerRoom.classList.remove('hidden');
        initializeCards();
    }
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinBtn.click();
    }
});

revealBtn.addEventListener('click', () => {
    socket.emit('revealVotes');
});

resetBtn.addEventListener('click', () => {
    socket.emit('reset');
    selectedVote = null;
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected');
    });
});

socket.on('userUpdate', (data) => {
    updateParticipants(data);

    if (!data.revealed && selectedVote !== null) {
        const selectedCard = document.querySelector(`.card[data-value="${selectedVote}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    } else if (data.revealed) {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });
    }
});

window.addEventListener('load', () => {
    usernameInput.focus();
});
