import { Question, fallbackBluffs, getSevenFreshQuestions } from './questions.js';

export type GameState = 'LOBBY' | 'BLUFFING' | 'VOTING' | 'REVEAL' | 'GAMEOVER';

export interface PlayerStats {
  fooledCount: number;
  foundTruthCount: number;
  fastBuzzerCount: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isHost: boolean;
  isBot: boolean;
  submittedBluff: string | null;
  votedChoiceId: string | null;
  buzzTime: number | null;
  stats: PlayerStats;
}

export interface VoterInfo {
  id: string;
  name: string;
  avatar: string;
  buzzTime: number | null;
}

export interface BluffChoice {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  isTruth: boolean;
  voters: VoterInfo[];
}

export interface RoundResults {
  prompt: string;
  displayAnswer: string;
  funFact: string;
  round: number;
  bluffs: Array<{
    id: string;
    text: string;
    isTruth: boolean;
    authorName: string;
    authorId: string;
    voters: VoterInfo[];
  }>;
  playerGains: Record<string, {
    truthPoints: number;
    deceptionPoints: number;
    speedBonus: number;
    totalGained: number;
    newTotal: number;
  }>;
}

export interface Podium {
  winner: Player | null;
  second: Player | null;
  third: Player | null;
  leaderboard: Array<{
    id: string;
    name: string;
    avatar: string;
    score: number;
    stats: PlayerStats;
  }>;
  badges: {
    masterDeceiver: { player: string; count: number } | null;
    sharpEye: { player: string; count: number } | null;
    lightningBuzzer: { player: string; count: number } | null;
  };
}

export interface Room {
  code: string;
  hostSocketId: string;
  state: GameState;
  round: number;
  totalRounds: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: Question[];
  currentQuestion: Question | null;
  players: Record<string, Player>;
  bluffs: BluffChoice[];
  votingStartTime: number;
  phaseStartTime: number;
  phaseEndTime: number;
  roundResults: RoundResults | null;
  leaderboard: Array<{ id: string; name: string; avatar: string; score: number; gained: number }>;
  podium: Podium | null;
  createdAt: number;
}

export const BOT_NAMES = ['Captain Bluff', 'Sir Fibsalot', 'Tricky Fox', 'Clever Bot'];

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRoundMultiplier(round: number): number {
  if (round === 1) return 1;
  if (round === 2) return 2;
  return 3;
}

export function createNewRoom(hostId: string): Room {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const selectedQuestions = getSevenFreshQuestions();

  return {
    code,
    hostSocketId: hostId,
    state: 'LOBBY',
    round: 1,
    totalRounds: 3,
    currentQuestionIndex: 0,
    totalQuestions: 7,
    questions: selectedQuestions,
    currentQuestion: null,
    players: {},
    bluffs: [],
    votingStartTime: 0,
    phaseStartTime: Date.now(),
    phaseEndTime: 0,
    roundResults: null,
    leaderboard: [],
    podium: null,
    createdAt: Date.now()
  };
}

export function startQuestionPhase(room: Room) {
  if (room.currentQuestionIndex >= room.questions.length) {
    room.questions = getSevenFreshQuestions();
    room.currentQuestionIndex = 0;
  }

  room.currentQuestion = room.questions[room.currentQuestionIndex];
  room.currentQuestionIndex++; // 1 to 7

  if (room.currentQuestionIndex === 7) {
    room.round = 3;
  } else if (room.currentQuestionIndex >= 4) {
    room.round = 2;
  } else {
    room.round = 1;
  }

  // Reset player per-question flags
  Object.values(room.players).forEach(p => {
    p.submittedBluff = null;
    p.votedChoiceId = null;
    p.buzzTime = null;
  });
  room.bluffs = [];

  // Generate bot bluffs right away
  let fallbackPool = shuffle(fallbackBluffs);
  let poolIdx = 0;
  Object.values(room.players).forEach(p => {
    if (p.isBot) {
      p.submittedBluff = fallbackPool[poolIdx++] || 'A giant turnip';
    }
  });

  room.state = 'BLUFFING';
  room.phaseStartTime = Date.now();
  room.phaseEndTime = Date.now() + 35000; // 35 seconds to submit lies
}

export function startVotingPhase(room: Room) {
  room.state = 'VOTING';

  const list: BluffChoice[] = [];

  // True answer
  list.push({
    id: 'truth',
    text: room.currentQuestion!.displayAnswer,
    authorId: 'system_truth',
    authorName: 'The Real Truth',
    isTruth: true,
    voters: []
  });

  // Player bluffs
  Object.values(room.players).forEach(p => {
    list.push({
      id: 'bluff_' + p.id,
      text: p.submittedBluff || 'A mystery object',
      authorId: p.id,
      authorName: p.name,
      isTruth: false,
      voters: []
    });
  });

  room.bluffs = shuffle(list);
  room.votingStartTime = Date.now();
  room.phaseStartTime = Date.now();
  room.phaseEndTime = Date.now() + 20000; // 20s fast buzzing

  // Simulate bot votes immediately
  const nonBotChoices = room.bluffs;
  Object.values(room.players).forEach(p => {
    if (p.isBot && !p.votedChoiceId) {
      const validChoices = nonBotChoices.filter(c => c.authorId !== p.id);
      const pick = validChoices[Math.floor(Math.random() * validChoices.length)];
      if (pick) {
        p.votedChoiceId = pick.id;
        p.buzzTime = 3000 + Math.floor(Math.random() * 8000);
        pick.voters.push({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          buzzTime: p.buzzTime
        });
      }
    }
  });
}

export function startRevealPhase(room: Room) {
  room.state = 'REVEAL';

  const mult = getRoundMultiplier(room.round);
  const TRUTH_POINTS = 1000 * mult;
  const DECEPTION_POINTS = 500 * mult;
  const MAX_SPEED_BONUS = 250 * mult;

  const roundResults: RoundResults = {
    prompt: room.currentQuestion!.prompt,
    displayAnswer: room.currentQuestion!.displayAnswer,
    funFact: room.currentQuestion!.funFact,
    round: room.round,
    bluffs: [],
    playerGains: {}
  };

  Object.values(room.players).forEach(p => {
    roundResults.playerGains[p.id] = {
      truthPoints: 0,
      deceptionPoints: 0,
      speedBonus: 0,
      totalGained: 0,
      newTotal: p.score
    };
  });

  room.bluffs.forEach(b => {
    const bluffResult = {
      id: b.id,
      text: b.text,
      isTruth: b.isTruth,
      authorName: b.isTruth ? 'The Real Truth' : b.authorName,
      authorId: b.authorId,
      voters: b.voters
    };

    if (b.isTruth) {
      b.voters.forEach(v => {
        const p = room.players[v.id];
        if (p) {
          const elapsedSec = (v.buzzTime || 10000) / 1000;
          const speedFraction = Math.max(0, (20 - elapsedSec) / 20);
          const speedBonus = Math.round(speedFraction * MAX_SPEED_BONUS);

          p.score += TRUTH_POINTS + speedBonus;
          p.stats.foundTruthCount++;
          if (speedBonus > MAX_SPEED_BONUS * 0.7) p.stats.fastBuzzerCount++;

          const gain = roundResults.playerGains[p.id];
          if (gain) {
            gain.truthPoints += TRUTH_POINTS;
            gain.speedBonus += speedBonus;
            gain.totalGained += TRUTH_POINTS + speedBonus;
            gain.newTotal = p.score;
          }
        }
      });
    } else {
      const author = room.players[b.authorId];
      if (author) {
        const fooledOthers = b.voters.filter(v => v.id !== author.id);
        const deceptionTotal = fooledOthers.length * DECEPTION_POINTS;
        author.score += deceptionTotal;
        author.stats.fooledCount += fooledOthers.length;

        const gain = roundResults.playerGains[author.id];
        if (gain) {
          gain.deceptionPoints += deceptionTotal;
          gain.totalGained += deceptionTotal;
          gain.newTotal = author.score;
        }
      }
    }

    roundResults.bluffs.push(bluffResult);
  });

  room.roundResults = roundResults;

  room.leaderboard = Object.values(room.players)
    .map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      gained: roundResults.playerGains[p.id]?.totalGained || 0
    }))
    .sort((a, b) => b.score - a.score);

  room.phaseStartTime = Date.now();
  room.phaseEndTime = Date.now() + 14000; // 14 seconds to read reveal
}

export function endGame(room: Room) {
  room.state = 'GAMEOVER';

  const playersArr = Object.values(room.players).sort((a, b) => b.score - a.score);

  let topBluffer: Player | null = null;
  let topTruthSeeker: Player | null = null;
  let topSpeedy: Player | null = null;

  playersArr.forEach(p => {
    if (!topBluffer || p.stats.fooledCount > topBluffer.stats.fooledCount) topBluffer = p;
    if (!topTruthSeeker || p.stats.foundTruthCount > topTruthSeeker.stats.foundTruthCount) topTruthSeeker = p;
    if (!topSpeedy || p.stats.fastBuzzerCount > topSpeedy.stats.fastBuzzerCount) topSpeedy = p;
  });

  room.podium = {
    winner: playersArr[0] || null,
    second: playersArr[1] || null,
    third: playersArr[2] || null,
    leaderboard: playersArr.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      stats: p.stats
    })),
    badges: {
      masterDeceiver: (topBluffer && (topBluffer as Player).stats.fooledCount > 0)
        ? { player: (topBluffer as Player).name, count: (topBluffer as Player).stats.fooledCount }
        : null,
      sharpEye: (topTruthSeeker && (topTruthSeeker as Player).stats.foundTruthCount > 0)
        ? { player: (topTruthSeeker as Player).name, count: (topTruthSeeker as Player).stats.foundTruthCount }
        : null,
      lightningBuzzer: (topSpeedy && (topSpeedy as Player).stats.fastBuzzerCount > 0)
        ? { player: (topSpeedy as Player).name, count: (topSpeedy as Player).stats.fastBuzzerCount }
        : null
    }
  };
}

/**
 * Serverless state resolution: checks timeouts or completion conditions and transitions state
 * Returns true if room was modified
 */
export function evaluateAndAdvanceRoom(room: Room): boolean {
  const now = Date.now();

  if (room.state === 'BLUFFING') {
    // Check if time expired OR all players submitted bluffs
    const allSubmitted = Object.values(room.players).every(p => !!p.submittedBluff);
    if (now >= room.phaseEndTime || allSubmitted) {
      // Fill missing player bluffs
      let missingPool = shuffle(fallbackBluffs);
      let mIdx = 0;
      Object.values(room.players).forEach(p => {
        if (!p.submittedBluff) {
          p.submittedBluff = missingPool[mIdx++] || 'A mystery object';
        }
      });
      startVotingPhase(room);
      return true;
    }
  } else if (room.state === 'VOTING') {
    // Check if time expired OR all players voted
    const allVoted = Object.values(room.players).every(p => !!p.votedChoiceId);
    if (now >= room.phaseEndTime || allVoted) {
      startRevealPhase(room);
      return true;
    }
  } else if (room.state === 'REVEAL') {
    // Check if reveal timer expired
    if (now >= room.phaseEndTime) {
      if (room.currentQuestionIndex >= 7) {
        endGame(room);
      } else {
        startQuestionPhase(room);
      }
      return true;
    }
  }

  return false;
}

/**
 * Sanitizes room state before returning to a player
 */
export function sanitizeRoomForClient(room: Room, playerId: string) {
  const playersList = Object.values(room.players).map(p => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    score: p.score,
    isHost: p.isHost,
    isBot: p.isBot,
    hasSubmittedBluff: !!p.submittedBluff,
    hasVoted: !!p.votedChoiceId
  }));

  const now = Date.now();
  const timeLeft = room.phaseEndTime > 0 ? Math.max(0, Math.ceil((room.phaseEndTime - now) / 1000)) : 0;

  // Sanitize choices during voting (don't show truth or author)
  let choices: Array<{ id: string; text: string }> | null = null;
  if (room.state === 'VOTING') {
    choices = room.bluffs.map(b => ({ id: b.id, text: b.text }));
  }

  return {
    code: room.code,
    hostSocketId: room.hostSocketId,
    state: room.state,
    round: room.round,
    totalRounds: room.totalRounds,
    questionNumber: room.currentQuestionIndex,
    totalQuestions: room.totalQuestions,
    currentQuestion: room.currentQuestion ? {
      id: room.currentQuestion.id,
      prompt: room.currentQuestion.prompt
    } : null,
    choices,
    timeLeft,
    phaseEndTime: room.phaseEndTime,
    roundMultiplier: getRoundMultiplier(room.round),
    players: playersList,
    results: room.state === 'REVEAL' ? room.roundResults : null,
    leaderboard: room.state === 'REVEAL' || room.state === 'GAMEOVER' ? room.leaderboard : null,
    podium: room.state === 'GAMEOVER' ? room.podium : null,
    myBluff: room.players[playerId]?.submittedBluff || null,
    myVote: room.players[playerId]?.votedChoiceId || null
  };
}
