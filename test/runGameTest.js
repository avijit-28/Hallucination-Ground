import handler from '../dist/functions/game.mjs';

async function callFunction(payload) {
  const req = new Request('https://hallucination-ground.netlify.app/.netlify/functions/game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const res = await handler(req);
  const json = await res.json();
  if (json.error) {
    throw new Error(`Function error for action [${payload.action}]: ${json.error}`);
  }
  return json;
}

async function run() {
  console.log('====================================================');
  console.log('🧪 Starting 3-Round Automated Multiplayer Game Test');
  console.log('====================================================');

  const p1 = 'player_host_01';
  const p2 = 'player_guest_02';

  // 1. Host creates room
  console.log('\n[1] Creating room...');
  const createRes = await callFunction({ action: 'create_room', playerId: p1 });
  const roomCode = createRes.code;
  console.log(`✓ Room created with code: ${roomCode}`);

  // 2. Host joins
  console.log('\n[2] Host joining room...');
  const joinHostRes = await callFunction({
    action: 'join_room',
    code: roomCode,
    playerId: p1,
    name: 'Maverick',
    avatar: '🦁'
  });
  console.log(`✓ Host joined: ${joinHostRes.state.players[0].name}`);

  // 3. Player 2 joins
  console.log('\n[3] Player 2 joining room...');
  const joinGuestRes = await callFunction({
    action: 'join_room',
    code: roomCode,
    playerId: p2,
    name: 'Cipher',
    avatar: '🦊'
  });
  console.log(`✓ Player 2 joined: ${joinGuestRes.state.players[1].name}`);
  console.log(`✓ Total players in lobby: ${joinGuestRes.state.players.length}`);

  // 4. Host starts game
  console.log('\n[4] Host starting game...');
  const startRes = await callFunction({
    action: 'start_game',
    code: roomCode,
    playerId: p1
  });
  console.log(`✓ Game started! Phase: ${startRes.state.state}`);

  // Play through all 7 questions (Rounds 1, 2, and 3)
  for (let q = 1; q <= 7; q++) {
    console.log(`\n----------------------------------------------------`);
    console.log(`▶ QUESTION ${q} OF 7`);
    console.log(`----------------------------------------------------`);

    // Poll to get current question
    const stateQ = await callFunction({ action: 'get_state', code: roomCode, playerId: p1 });
    console.log(`Prompt: "${stateQ.state.currentQuestion.prompt}"`);
    console.log(`Round: ${stateQ.state.round} (${stateQ.state.roundMultiplier}x points)`);

    // Submit bluff for Player 1
    const p1Bluff = `Fake answer by Maverick #${q}`;
    await callFunction({
      action: 'submit_bluff',
      code: roomCode,
      playerId: p1,
      text: p1Bluff
    });
    console.log(`✓ Player 1 submitted bluff: "${p1Bluff}"`);

    // Submit bluff for Player 2 (should auto-advance to VOTING when all submitted)
    const p2Bluff = `Deceptive lie by Cipher #${q}`;
    const votingState = await callFunction({
      action: 'submit_bluff',
      code: roomCode,
      playerId: p2,
      text: p2Bluff
    });
    console.log(`✓ Player 2 submitted bluff: "${p2Bluff}"`);
    console.log(`✓ Phase advanced to: ${votingState.state.state}`);

    if (votingState.state.state !== 'VOTING') {
      throw new Error(`Expected VOTING phase, got ${votingState.state.state}`);
    }

    // Players cast votes
    // Player 1 votes for the REAL TRUTH (choice 'truth')
    console.log('\nSubmitting votes...');
    await callFunction({
      action: 'submit_vote',
      code: roomCode,
      playerId: p1,
      choiceId: 'truth'
    });
    console.log('✓ Player 1 voted for THE TRUTH!');

    // Player 2 gets fooled and votes for Player 1's bluff!
    const revealState = await callFunction({
      action: 'submit_vote',
      code: roomCode,
      playerId: p2,
      choiceId: 'bluff_' + p1
    });
    console.log(`✓ Player 2 was deceived and voted for Player 1's bluff!`);
    console.log(`✓ Phase advanced to: ${revealState.state.state}`);

    if (revealState.state.state !== 'REVEAL') {
      throw new Error(`Expected REVEAL phase, got ${revealState.state.state}`);
    }

    // Print Round Results & Scoring
    const results = revealState.state.results;
    console.log(`\nReveal Results:`);
    console.log(`- Real Answer: ${results.displayAnswer}`);
    console.log(`- Player 1 gained: +${results.playerGains[p1]?.totalGained} pts (New total: ${results.playerGains[p1]?.newTotal})`);
    console.log(`- Player 2 gained: +${results.playerGains[p2]?.totalGained} pts (New total: ${results.playerGains[p2]?.newTotal})`);

    // Advance to next stage
    const nextRes = await callFunction({
      action: 'next_stage',
      code: roomCode,
      playerId: p1
    });

    if (q < 7) {
      console.log(`✓ Transitioned to next question: Phase is now ${nextRes.state.state}`);
    } else {
      console.log(`✓ Final Question completed! Phase is now: ${nextRes.state.state}`);
    }
  }

  // 5. Verify Game Over & Podium
  console.log('\n====================================================');
  console.log('🏆 FINAL GAME OVER & PODIUM VERIFICATION');
  console.log('====================================================');

  const finalState = await callFunction({ action: 'get_state', code: roomCode, playerId: p1 });
  if (finalState.state.state !== 'GAMEOVER') {
    throw new Error(`Expected GAMEOVER phase, got ${finalState.state.state}`);
  }

  const podium = finalState.state.podium;
  console.log(`Winner: 👑 ${podium.winner.name} with ${podium.winner.score} pts!`);
  console.log(`Runner-up: 🥈 ${podium.second.name} with ${podium.second.score} pts!`);

  console.log('\nBadges awarded:');
  if (podium.badges.masterDeceiver) {
    console.log(`- 🎭 Master Deceiver: ${podium.badges.masterDeceiver.player} (fooled ${podium.badges.masterDeceiver.count} players)`);
  }
  if (podium.badges.sharpEye) {
    console.log(`- 🎯 Sharp Eye: ${podium.badges.sharpEye.player} (spotted ${podium.badges.sharpEye.count} truths)`);
  }

  console.log('\nFinal Leaderboard:');
  podium.leaderboard.forEach((p, idx) => {
    console.log(`  #${idx + 1} ${p.name}: ${p.score} pts`);
  });

  if (podium.winner.id !== p1) {
    throw new Error('Test failed: Player 1 should have won!');
  }

  console.log('\n✅ ALL 3 ROUNDS & 7 QUESTIONS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
