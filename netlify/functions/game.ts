import {
  createNewRoom,
  startQuestionPhase,
  evaluateAndAdvanceRoom,
  sanitizeRoomForClient,
  BOT_NAMES,
  Room
} from '../../lib/gameLogic.js';
import {
  getRoomFromStore,
  setRoomInStore,
  atomicUpdateRoom
} from '../../lib/blobStore.js';

interface RequestPayload {
  action: string;
  code?: string;
  playerId?: string;
  name?: string;
  avatar?: string;
  text?: string;
  choiceId?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    let payload: Partial<RequestPayload> = {};

    if (req.method === 'POST') {
      const bodyText = await req.text();
      if (bodyText) {
        try {
          payload = JSON.parse(bodyText);
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: CORS_HEADERS
          });
        }
      }
    } else {
      const url = new URL(req.url);
      payload = {
        action: url.searchParams.get('action') || '',
        code: url.searchParams.get('code') || '',
        playerId: url.searchParams.get('playerId') || ''
      };
    }

    const { action, code, playerId } = payload;

    // 1. CREATE ROOM
    if (action === 'create_room') {
      const hostId = playerId || 'host_' + Math.random().toString(36).substring(2, 9);
      const room = createNewRoom(hostId);

      // Save using strong consistency
      await setRoomInStore(room.code, room);

      return new Response(JSON.stringify({
        success: true,
        code: room.code,
        hostSocketId: hostId,
        playerId: hostId
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing room code' }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const roomCode = code.toUpperCase().trim();

    // 2. JOIN ROOM
    if (action === 'join_room') {
      const joinerId = playerId || 'p_' + Math.random().toString(36).substring(2, 9);
      const playerName = (payload.name || 'Player').trim().substring(0, 14);
      const playerAvatar = payload.avatar || '🦊';

      const updatedRoom = await atomicUpdateRoom<Room>(roomCode, (current) => {
        if (current.state !== 'LOBBY' && !current.players[joinerId]) {
          throw new Error('Game has already started in this room!');
        }

        const count = Object.keys(current.players).length;
        if (count >= 8 && !current.players[joinerId]) {
          throw new Error('Room is full (maximum 8 players).');
        }

        if (!current.players[joinerId]) {
          current.players[joinerId] = {
            id: joinerId,
            name: playerName,
            avatar: playerAvatar,
            score: 0,
            isHost: joinerId === current.hostSocketId,
            isBot: false,
            submittedBluff: null,
            votedChoiceId: null,
            buzzTime: null,
            stats: { fooledCount: 0, foundTruthCount: 0, fastBuzzerCount: 0 }
          };
        }

        return current;
      });

      return new Response(JSON.stringify({
        success: true,
        code: roomCode,
        playerId: joinerId,
        state: sanitizeRoomForClient(updatedRoom, joinerId)
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    // 3. ADD BOT (Host Only)
    if (action === 'add_bot') {
      const updatedRoom = await atomicUpdateRoom<Room>(roomCode, (current) => {
        if (current.state !== 'LOBBY') return current;
        if (playerId !== current.hostSocketId) {
          throw new Error('Only the host can add test bots!');
        }

        const count = Object.keys(current.players).length;
        if (count >= 8) return current;

        const botId = 'bot_' + Math.random().toString(36).substring(2, 8);
        const botName = BOT_NAMES[count % BOT_NAMES.length] + ' (Bot)';
        const botAvatars = ['🤖', '👾', '🎩', '🦉'];

        current.players[botId] = {
          id: botId,
          name: botName,
          avatar: botAvatars[count % botAvatars.length],
          score: 0,
          isHost: false,
          isBot: true,
          submittedBluff: null,
          votedChoiceId: null,
          buzzTime: null,
          stats: { fooledCount: 0, foundTruthCount: 0, fastBuzzerCount: 0 }
        };

        return current;
      });

      return new Response(JSON.stringify({
        success: true,
        state: sanitizeRoomForClient(updatedRoom, playerId || '')
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    // 4. START GAME (Host Only)
    if (action === 'start_game') {
      const updatedRoom = await atomicUpdateRoom<Room>(roomCode, (current) => {
        if (playerId !== current.hostSocketId) {
          throw new Error('Only the host can start the game!');
        }
        if (Object.keys(current.players).length < 2) {
          throw new Error('Need at least 2 players to start! Click "+ Add Bot" to test.');
        }

        current.state = 'BLUFFING';
        current.round = 1;
        current.currentQuestionIndex = 0;
        startQuestionPhase(current);
        return current;
      });

      return new Response(JSON.stringify({
        success: true,
        state: sanitizeRoomForClient(updatedRoom, playerId || '')
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    // 5. SUBMIT BLUFF
    if (action === 'submit_bluff') {
      const bluffText = (payload.text || '').trim().substring(0, 80);
      if (!bluffText) {
        return new Response(JSON.stringify({ error: 'Please enter a bluff.' }), {
          status: 400,
          headers: CORS_HEADERS
        });
      }

      const updatedRoom = await atomicUpdateRoom<Room>(roomCode, (current) => {
        if (current.state !== 'BLUFFING') return current;

        const player = current.players[playerId || ''];
        if (!player) return current;

        const cleanInput = bluffText.toLowerCase();
        const cleanAnswer = (current.currentQuestion?.answer || '').toLowerCase();

        // Accidental truth check
        if (cleanInput === cleanAnswer || (cleanAnswer.includes(cleanInput) && cleanInput.length > 3)) {
          throw new Error('🚨 Shhh! That is the ACTUAL true answer! Submit a fake lie instead.');
        }

        player.submittedBluff = bluffText;

        // Auto-advance if all submitted
        evaluateAndAdvanceRoom(current);
        return current;
      });

      return new Response(JSON.stringify({
        success: true,
        bluff: bluffText,
        state: sanitizeRoomForClient(updatedRoom, playerId || '')
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    // 6. SUBMIT VOTE
    if (action === 'submit_vote') {
      const choiceId = payload.choiceId;

      const updatedRoom = await atomicUpdateRoom<Room>(roomCode, (current) => {
        if (current.state !== 'VOTING') return current;

        const player = current.players[playerId || ''];
        if (!player || player.votedChoiceId) return current;

        const chosen = current.bluffs.find(b => b.id === choiceId);
        if (chosen && chosen.authorId === player.id) {
          throw new Error("You can't vote for your own lie!");
        }

        player.votedChoiceId = choiceId || null;
        player.buzzTime = Date.now() - current.votingStartTime;

        if (chosen) {
          chosen.voters.push({
            id: player.id,
            name: player.name,
            avatar: player.avatar,
            buzzTime: player.buzzTime
          });
        }

        // Auto-advance if all voted
        evaluateAndAdvanceRoom(current);
        return current;
      });

      return new Response(JSON.stringify({
        success: true,
        state: sanitizeRoomForClient(updatedRoom, playerId || '')
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    // 7. GET STATE (Polling & Serverless Timer Auto-Advancement)
    if (action === 'get_state') {
      const stored = await getRoomFromStore<Room>(roomCode);
      if (!stored) {
        return new Response(JSON.stringify({ error: 'Room not found' }), {
          status: 404,
          headers: CORS_HEADERS
        });
      }

      let current = stored.data;
      const changed = evaluateAndAdvanceRoom(current);

      if (changed) {
        // Save the advanced state conditionally using etag
        try {
          await setRoomInStore(roomCode, current, stored.etag);
        } catch (e) {
          // If concurrent write happened, refresh
          const refreshed = await getRoomFromStore<Room>(roomCode);
          if (refreshed) current = refreshed.data;
        }
      }

      return new Response(JSON.stringify({
        success: true,
        state: sanitizeRoomForClient(current, playerId || '')
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    // 8. NEXT STAGE (Host manual skip during reveal)
    if (action === 'next_stage') {
      const updatedRoom = await atomicUpdateRoom<Room>(roomCode, (current) => {
        if (current.state === 'REVEAL') {
          current.phaseEndTime = Date.now() - 1000;
          evaluateAndAdvanceRoom(current);
        }
        return current;
      });

      return new Response(JSON.stringify({
        success: true,
        state: sanitizeRoomForClient(updatedRoom, playerId || '')
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    // 9. PLAY AGAIN
    if (action === 'play_again') {
      const updatedRoom = await atomicUpdateRoom<Room>(roomCode, (current) => {
        const resetRoom = createNewRoom(current.hostSocketId);
        resetRoom.code = current.code;
        resetRoom.players = current.players;

        Object.values(resetRoom.players).forEach(p => {
          p.score = 0;
          p.submittedBluff = null;
          p.votedChoiceId = null;
          p.buzzTime = null;
          p.stats = { fooledCount: 0, foundTruthCount: 0, fastBuzzerCount: 0 };
        });

        return resetRoom;
      });

      return new Response(JSON.stringify({
        success: true,
        state: sanitizeRoomForClient(updatedRoom, playerId || '')
      }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: CORS_HEADERS
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Serverless internal error' }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
};
