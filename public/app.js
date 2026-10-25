// Netlify Functions Endpoint
const API_URL = '/.netlify/functions/game';

// Audio Synthesizer (Zero asset dependencies, instant Web Audio API)
class SoundFx {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, delay = 0, gainVal = 0.15) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio error silent fallback
      }
    }, delay);
  }

  click() {
    this.playTone(800, 'sine', 0.05, 0, 0.1);
  }

  buzz() {
    this.playTone(400, 'triangle', 0.12, 0, 0.2);
    this.playTone(600, 'sine', 0.15, 60, 0.2);
  }

  correct() {
    this.playTone(523.25, 'sine', 0.15, 0, 0.2);
    this.playTone(659.25, 'sine', 0.15, 120, 0.2);
    this.playTone(783.99, 'sine', 0.3, 240, 0.25);
  }

  revealLie() {
    this.playTone(320, 'sawtooth', 0.2, 0, 0.15);
    this.playTone(280, 'sawtooth', 0.3, 150, 0.15);
  }

  fanfare() {
    const notes = [440, 554, 659, 880];
    notes.forEach((n, i) => {
      this.playTone(n, 'triangle', 0.3, i * 140, 0.25);
    });
  }

  error() {
    this.playTone(180, 'square', 0.18, 0, 0.2);
  }
}

const sfx = new SoundFx();

// Global App State
let myPlayerId = localStorage.getItem('hg_player_id') || ('p_' + Math.random().toString(36).substring(2, 9));
localStorage.setItem('hg_player_id', myPlayerId);

let currentRoomCode = null;
let isHostScreen = false;
let selectedAvatar = '🦊';
let myBluff = null;
let votedChoiceId = null;
let currentRoomState = null;
let pollInterval = null;
let localTimerInterval = null;
let lastKnownState = null;
let lastKnownQuestionIndex = -1;

// DOM Elements
const screens = {
  landing: document.getElementById('screen-landing'),
  lobby: document.getElementById('screen-lobby'),
  bluff: document.getElementById('screen-bluff'),
  voting: document.getElementById('screen-voting'),
  reveal: document.getElementById('screen-reveal'),
  gameover: document.getElementById('screen-gameover')
};

const toastEl = document.getElementById('toast');
const headerRoomPill = document.getElementById('header-room-pill');
const headerRoomCode = document.getElementById('header-room-code');
const soundBtn = document.getElementById('sound-btn');

function showScreen(screenKey) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  if (screens[screenKey]) {
    screens[screenKey].classList.add('active');
  }
}

function showToast(message, isError = true) {
  toastEl.textContent = message;
  toastEl.style.backgroundColor = isError ? '#dc2626' : '#10b981';
  toastEl.classList.remove('hidden');
  sfx.error();
  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 3500);
}

// Sound toggle
soundBtn.addEventListener('click', () => {
  sfx.enabled = !sfx.enabled;
  soundBtn.textContent = sfx.enabled ? '🔊' : '🔇';
});

// Auto-fill room code from URL params (e.g. ?room=ABCD)
const urlParams = new URLSearchParams(window.location.search);
const roomParam = urlParams.get('room');
if (roomParam) {
  const roomInput = document.getElementById('room-code-input');
  if (roomInput) {
    roomInput.value = roomParam.toUpperCase();
  }
}

// Direct Netlify Function API Client
async function apiCall(action, extraPayload = {}) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        code: currentRoomCode,
        playerId: myPlayerId,
        ...extraPayload
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Server error occurred');
    }
    return data;
  } catch (err) {
    showToast(err.message || 'Network request failed');
    throw err;
  }
}

// Tabs on Landing Screen
const tabJoin = document.getElementById('tab-join');
const tabHost = document.getElementById('tab-host');
const joinSection = document.getElementById('join-section');
const hostSection = document.getElementById('host-section');

tabJoin.addEventListener('click', () => {
  tabJoin.classList.add('active');
  tabHost.classList.remove('active');
  joinSection.classList.add('active');
  hostSection.classList.remove('active');
  sfx.click();
});

tabHost.addEventListener('click', () => {
  tabHost.classList.add('active');
  tabJoin.classList.remove('active');
  hostSection.classList.add('active');
  joinSection.classList.remove('active');
  sfx.click();
});

// Avatar selection
const avatarOptions = document.querySelectorAll('.avatar-option');
avatarOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    avatarOptions.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedAvatar = btn.getAttribute('data-avatar');
    sfx.click();
  });
});

// 1. Create Room (Host)
const btnCreateRoom = document.getElementById('btn-create-room');
btnCreateRoom.addEventListener('click', async () => {
  sfx.init();
  sfx.click();
  isHostScreen = true;

  try {
    btnCreateRoom.disabled = true;
    const res = await apiCall('create_room');
    currentRoomCode = res.code;
    myPlayerId = res.hostSocketId;

    // Auto-join host
    await apiCall('join_room', {
      code: currentRoomCode,
      name: 'Host',
      avatar: '👑'
    });

    setupRoomHeader(currentRoomCode);
    startStateSync();
  } catch (e) {
    btnCreateRoom.disabled = false;
  }
});

// 2. Join Room (Player)
const btnJoin = document.getElementById('btn-join');
btnJoin.addEventListener('click', async () => {
  sfx.init();
  const code = document.getElementById('room-code-input').value.trim().toUpperCase();
  const name = document.getElementById('player-name-input').value.trim();

  if (!code) return showToast('Please enter the 4-letter room code!');
  if (!name) return showToast('Please enter your nickname!');

  sfx.click();
  btnJoin.disabled = true;

  try {
    currentRoomCode = code;
    const res = await apiCall('join_room', {
      code,
      name,
      avatar: selectedAvatar
    });

    setupRoomHeader(code);
    startStateSync();
  } catch (e) {
    btnJoin.disabled = false;
  }
});

function setupRoomHeader(code) {
  headerRoomPill.classList.remove('hidden');
  headerRoomCode.textContent = code;
  document.getElementById('display-room-code').textContent = code;

  const joinUrl = `${window.location.origin}/?room=${code}`;
  document.getElementById('join-url-text').textContent = joinUrl;
  renderQrSvg(joinUrl);
  showScreen('lobby');
}

// 3. Add Bot (Host Only)
const btnAddBot = document.getElementById('btn-add-bot');
btnAddBot.addEventListener('click', async () => {
  sfx.click();
  try {
    await apiCall('add_bot');
    pollRoomState();
  } catch (e) {}
});

// 4. Start Game (Host Only)
const btnStartGame = document.getElementById('btn-start-game');
btnStartGame.addEventListener('click', async () => {
  sfx.click();
  try {
    btnStartGame.disabled = true;
    await apiCall('start_game');
    pollRoomState();
  } catch (e) {
    btnStartGame.disabled = false;
  }
});

// Copy Join URL
const btnCopyUrl = document.getElementById('btn-copy-url');
btnCopyUrl.addEventListener('click', () => {
  const url = document.getElementById('join-url-text').textContent;
  navigator.clipboard.writeText(url).then(() => {
    btnCopyUrl.textContent = 'Copied! ✓';
    sfx.click();
    setTimeout(() => { btnCopyUrl.textContent = 'Copy Link'; }, 2000);
  });
});

// 5. Submit Bluff
const btnSubmitBluff = document.getElementById('btn-submit-bluff');
const bluffInput = document.getElementById('bluff-input');

async function submitBluff() {
  const text = bluffInput.value.trim();
  if (!text) return showToast('Please type a lie before submitting!');

  sfx.click();
  btnSubmitBluff.disabled = true;

  try {
    const res = await apiCall('submit_bluff', { text });
    myBluff = res.bluff;
    document.getElementById('submitted-bluff-preview').textContent = `"${myBluff}"`;
    document.getElementById('bluff-input-container').classList.add('hidden');
    document.getElementById('bluff-submitted-msg').classList.remove('hidden');
    pollRoomState();
  } catch (e) {
    btnSubmitBluff.disabled = false;
  }
}

btnSubmitBluff.addEventListener('click', submitBluff);
bluffInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitBluff();
});

// 6. Next Question (Manual Skip)
const btnNextQuestion = document.getElementById('btn-next-question');
btnNextQuestion.addEventListener('click', async () => {
  sfx.click();
  try {
    await apiCall('next_stage');
    pollRoomState();
  } catch (e) {}
});

// 7. Play Again
const btnPlayAgain = document.getElementById('btn-play-again');
btnPlayAgain.addEventListener('click', async () => {
  sfx.click();
  try {
    await apiCall('play_again');
    pollRoomState();
  } catch (e) {}
});

// Polling & Real-time State Synchronization
function startStateSync() {
  if (pollInterval) clearInterval(pollInterval);
  if (localTimerInterval) clearInterval(localTimerInterval);

  pollRoomState();

  // Poll serverless function every 1.2s for high responsiveness
  pollInterval = setInterval(pollRoomState, 1200);

  // Local second-by-second countdown for ultra-smooth UI timers
  localTimerInterval = setInterval(() => {
    if (!currentRoomState || !currentRoomState.phaseEndTime) return;
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((currentRoomState.phaseEndTime - now) / 1000));
    updateTimerDisplays(remaining);

    // If countdown hits zero, trigger immediate poll to fetch next serverless phase
    if (remaining === 0 && currentRoomState.state !== 'LOBBY' && currentRoomState.state !== 'GAMEOVER') {
      pollRoomState();
    }
  }, 1000);
}

async function pollRoomState() {
  if (!currentRoomCode) return;
  try {
    const res = await apiCall('get_state');
    if (res && res.state) {
      applyRoomState(res.state);
    }
  } catch (e) {
    // Retry silently on intermittent poll failure
  }
}

function applyRoomState(room) {
  currentRoomState = room;

  // 1. Host vs Player Lobby Authority
  const amIHost = isHostScreen || (room.hostSocketId && room.hostSocketId === myPlayerId);
  const hostActions = document.getElementById('host-actions-container');
  const botBtn = document.getElementById('btn-add-bot');
  const waitingNotice = document.getElementById('player-waiting-notice');

  if (hostActions && waitingNotice) {
    if (amIHost) {
      hostActions.classList.remove('hidden');
      if (botBtn) botBtn.classList.remove('hidden');
      waitingNotice.classList.add('hidden');
    } else {
      hostActions.classList.add('hidden');
      if (botBtn) botBtn.classList.add('hidden');
      waitingNotice.classList.remove('hidden');
    }
  }

  // 2. State-specific transitions
  const stateChanged = room.state !== lastKnownState;
  const questionChanged = room.questionNumber !== lastKnownQuestionIndex;

  if (room.state === 'LOBBY') {
    renderLobbyPlayers(room.players);
    showScreen('lobby');
  } else if (room.state === 'BLUFFING') {
    if (stateChanged || questionChanged) {
      myBluff = room.myBluff;
      votedChoiceId = null;

      const formattedPrompt = room.currentQuestion?.prompt?.replace('________', '<span class="blank-highlight">__________</span>') || '';
      document.getElementById('bluff-prompt-text').innerHTML = formattedPrompt;
      document.getElementById('bluff-round-tag').textContent = `ROUND ${room.round}`;
      document.getElementById('bluff-mult-tag').textContent = `${room.roundMultiplier}x POINTS`;

      const progressText = room.questionNumber === room.totalQuestions
        ? `FINAL QUESTION ${room.questionNumber} OF ${room.totalQuestions}`
        : `QUESTION ${room.questionNumber} OF ${room.totalQuestions}`;
      document.getElementById('bluff-progress-tag').textContent = progressText;

      bluffInput.value = '';
      btnSubmitBluff.disabled = false;

      if (room.myBluff) {
        document.getElementById('submitted-bluff-preview').textContent = `"${room.myBluff}"`;
        document.getElementById('bluff-input-container').classList.add('hidden');
        document.getElementById('bluff-submitted-msg').classList.remove('hidden');
      } else {
        document.getElementById('bluff-input-container').classList.remove('hidden');
        document.getElementById('bluff-submitted-msg').classList.add('hidden');
      }

      showScreen('bluff');
      sfx.buzz();
    }
    renderBluffStatusChips(room.players);
  } else if (room.state === 'VOTING') {
    if (stateChanged) {
      const formattedPrompt = room.currentQuestion?.prompt?.replace('________', '<span class="blank-highlight">__________</span>') || '';
      document.getElementById('voting-prompt-text').innerHTML = formattedPrompt;

      const progressText = room.questionNumber === room.totalQuestions
        ? `FINAL QUESTION ${room.questionNumber} OF ${room.totalQuestions}`
        : `QUESTION ${room.questionNumber} OF ${room.totalQuestions}`;
      document.getElementById('voting-progress-tag').textContent = progressText;

      votedChoiceId = room.myVote;
      renderChoices(room.choices, room.myBluff);

      if (room.myVote) {
        document.getElementById('voted-feedback').classList.remove('hidden');
      } else {
        document.getElementById('voted-feedback').classList.add('hidden');
      }

      showScreen('voting');
    }
  } else if (room.state === 'REVEAL') {
    if (stateChanged) {
      if (room.results) {
        renderReveal(room.results, room.leaderboard || []);
      }
      showScreen('reveal');
    }
  } else if (room.state === 'GAMEOVER') {
    if (stateChanged) {
      if (room.podium) {
        renderGameOver(room.podium);
      }
      showScreen('gameover');
    }
  }

  lastKnownState = room.state;
  lastKnownQuestionIndex = room.questionNumber;
  updateTimerDisplays(room.timeLeft);
}

function updateTimerDisplays(seconds) {
  const bTimer = document.getElementById('bluff-timer');
  const vTimer = document.getElementById('voting-timer');
  const rTimer = document.getElementById('reveal-timer');
  if (bTimer) bTimer.textContent = seconds;
  if (vTimer) vTimer.textContent = seconds;
  if (rTimer) rTimer.textContent = seconds;

  if (seconds <= 5 && seconds > 0) {
    sfx.click();
  }
}

function renderChoices(choices, currentBluff) {
  const grid = document.getElementById('choices-grid');
  grid.innerHTML = '';
  if (!choices) return;

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  choices.forEach((c, idx) => {
    const letter = optionLetters[idx] || (idx + 1);
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.setAttribute('data-id', c.id);

    const isOwn = currentBluff && c.text.trim().toLowerCase() === currentBluff.trim().toLowerCase();

    if (isOwn) {
      btn.classList.add('own-bluff');
      btn.innerHTML = `
        <div class="choice-content">
          <span class="choice-letter">${letter}</span>
          <span class="choice-text">${escapeHtml(c.text)}</span>
        </div>
        <span class="own-badge">YOUR LIE</span>
      `;
      btn.disabled = true;
    } else {
      if (votedChoiceId === c.id) btn.classList.add('selected');

      btn.innerHTML = `
        <div class="choice-content">
          <span class="choice-letter">${letter}</span>
          <span class="choice-text">${escapeHtml(c.text)}</span>
        </div>
      `;

      btn.addEventListener('click', async () => {
        if (votedChoiceId) return;
        votedChoiceId = c.id;
        document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('voted-feedback').classList.remove('hidden');
        sfx.buzz();

        try {
          await apiCall('submit_vote', { choiceId: c.id });
          pollRoomState();
        } catch (e) {
          votedChoiceId = null;
          btn.classList.remove('selected');
          document.getElementById('voted-feedback').classList.add('hidden');
        }
      });
    }

    grid.appendChild(btn);
  });
}

function renderReveal(results, leaderboard) {
  document.getElementById('reveal-prompt-text').innerHTML = results.prompt.replace('________', `<strong style="color:var(--gold-spotlight);">${escapeHtml(results.displayAnswer)}</strong>`);
  document.getElementById('fun-fact-text').textContent = results.funFact;

  const container = document.getElementById('reveal-cards-container');
  container.innerHTML = '';

  let hasPlayerFoundTruth = false;

  results.bluffs.forEach(b => {
    const card = document.createElement('div');
    card.className = `reveal-card-item ${b.isTruth ? 'is-truth' : ''}`;

    let votersHtml = '';
    if (b.voters && b.voters.length > 0) {
      votersHtml = b.voters.map(v => {
        if (b.isTruth && v.id === myPlayerId) hasPlayerFoundTruth = true;
        return `<span class="voter-tag ${b.isTruth ? 'correct' : 'fooled'}">${v.avatar || '👤'} ${escapeHtml(v.name)}</span>`;
      }).join('');
    } else {
      votersHtml = '<span style="font-size:0.8rem; color:var(--text-secondary);">No one fell for this</span>';
    }

    card.innerHTML = `
      <div class="reveal-card-top">
        <span class="reveal-text">${escapeHtml(b.text)}</span>
        <span class="reveal-author-tag ${b.isTruth ? 'truth-tag' : ''}">
          ${b.isTruth ? '★ THE REAL TRUTH' : 'Lie by ' + escapeHtml(b.authorName)}
        </span>
      </div>
      <div class="reveal-voters">${votersHtml}</div>
    `;

    container.appendChild(card);
  });

  if (hasPlayerFoundTruth) {
    sfx.correct();
  } else {
    sfx.revealLie();
  }

  // Mini Leaderboard
  const lbContainer = document.getElementById('reveal-leaderboard-list');
  lbContainer.innerHTML = '';
  leaderboard.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = 'leaderboard-row';
    row.innerHTML = `
      <div class="leaderboard-left">
        <span class="leaderboard-rank">#${idx + 1}</span>
        <span class="player-avatar">${p.avatar}</span>
        <span class="player-name">${escapeHtml(p.name)}</span>
      </div>
      <div>
        <span class="leaderboard-score">${p.score.toLocaleString()}</span>
        ${p.gained > 0 ? `<span class="score-gain">+${p.gained.toLocaleString()}</span>` : ''}
      </div>
    `;
    lbContainer.appendChild(row);
  });
}

function renderGameOver(podium) {
  sfx.fanfare();

  const pod = document.getElementById('podium-display');
  pod.innerHTML = '';

  if (podium.second) {
    pod.innerHTML += `
      <div class="podium-pillar second">
        <span class="podium-avatar">${podium.second.avatar}</span>
        <span class="podium-name">${escapeHtml(podium.second.name)}</span>
        <span class="podium-score">${podium.second.score.toLocaleString()} pts</span>
        <div class="podium-block">2</div>
      </div>
    `;
  }

  if (podium.winner) {
    pod.innerHTML += `
      <div class="podium-pillar first">
        <div style="font-size:1.8rem; margin-bottom:-8px;">👑</div>
        <span class="podium-avatar">${podium.winner.avatar}</span>
        <span class="podium-name">${escapeHtml(podium.winner.name)}</span>
        <span class="podium-score">${podium.winner.score.toLocaleString()} pts</span>
        <div class="podium-block">1</div>
      </div>
    `;
  }

  if (podium.third) {
    pod.innerHTML += `
      <div class="podium-pillar third">
        <span class="podium-avatar">${podium.third.avatar}</span>
        <span class="podium-name">${escapeHtml(podium.third.name)}</span>
        <span class="podium-score">${podium.third.score.toLocaleString()} pts</span>
        <div class="podium-block">3</div>
      </div>
    `;
  }

  // Badges
  const bContainer = document.getElementById('badges-container');
  bContainer.innerHTML = '';

  if (podium.badges.masterDeceiver) {
    bContainer.innerHTML += `
      <div class="badge-card">
        <div class="badge-icon">🎭</div>
        <div class="badge-title">MASTER DECEIVER</div>
        <div class="badge-recipient">${escapeHtml(podium.badges.masterDeceiver.player)}</div>
        <div class="badge-desc">Fooled ${podium.badges.masterDeceiver.count} players!</div>
      </div>
    `;
  }

  if (podium.badges.sharpEye) {
    bContainer.innerHTML += `
      <div class="badge-card">
        <div class="badge-icon">🎯</div>
        <div class="badge-title">SHARP EYE</div>
        <div class="badge-recipient">${escapeHtml(podium.badges.sharpEye.player)}</div>
        <div class="badge-desc">Spotted ${podium.badges.sharpEye.count} truths!</div>
      </div>
    `;
  }

  if (podium.badges.lightningBuzzer) {
    bContainer.innerHTML += `
      <div class="badge-card">
        <div class="badge-icon">⚡</div>
        <div class="badge-title">LIGHTNING BUZZER</div>
        <div class="badge-recipient">${escapeHtml(podium.badges.lightningBuzzer.player)}</div>
        <div class="badge-desc">Fastest finger in the room</div>
      </div>
    `;
  }

  // Final Leaderboard
  const flb = document.getElementById('final-leaderboard-list');
  flb.innerHTML = '';
  podium.leaderboard.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = 'leaderboard-row';
    row.innerHTML = `
      <div class="leaderboard-left">
        <span class="leaderboard-rank">#${idx + 1}</span>
        <span class="player-avatar">${p.avatar}</span>
        <span class="player-name">${escapeHtml(p.name)}</span>
      </div>
      <span class="leaderboard-score">${p.score.toLocaleString()} pts</span>
    `;
    flb.appendChild(row);
  });
}

function renderLobbyPlayers(players) {
  const countEl = document.getElementById('player-count');
  const gridEl = document.getElementById('players-grid');
  if (!countEl || !gridEl) return;

  countEl.textContent = players.length;
  gridEl.innerHTML = '';

  players.forEach(p => {
    const card = document.createElement('div');
    card.className = 'player-card';

    let tag = '';
    if (p.isHost) tag = '<span class="player-tag host">HOST</span>';
    else if (p.isBot) tag = '<span class="player-tag bot">BOT</span>';

    card.innerHTML = `
      <span class="player-avatar">${p.avatar}</span>
      <span class="player-name">${escapeHtml(p.name)}</span>
      ${tag}
    `;
    gridEl.appendChild(card);
  });

  const startBtn = document.getElementById('btn-start-game');
  if (startBtn) {
    startBtn.disabled = players.length < 2;
    startBtn.textContent = players.length >= 2
      ? `START GAME (${players.length} Players)`
      : `START GAME (Need ${2 - players.length} more)`;
  }
}

function renderBluffStatusChips(players) {
  const container = document.getElementById('bluff-players-status');
  if (!container) return;

  container.innerHTML = players.map(p => `
    <span class="status-chip ${p.hasSubmittedBluff ? 'done' : ''}">
      ${p.avatar} ${escapeHtml(p.name)} ${p.hasSubmittedBluff ? '✓' : '...'}
    </span>
  `).join('');
}

function renderQrSvg(url) {
  const container = document.getElementById('qrcode-container');
  if (!container) return;

  const encoded = encodeURIComponent(url);
  container.innerHTML = `
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encoded}&bgcolor=ffffff&color=101323&margin=6"
         alt="Join QR Code"
         class="qrcode-svg"
         width="140"
         height="140"
         onerror="this.style.display='none'">
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
