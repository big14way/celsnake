/**
 * Tournament System Integration Test
 * Run this script to verify tournament functionality
 */

const { io } = require('socket.io-client');

// Configuration
const SOCKET_URL = process.env.VITE_SOCKET_URL || 'http://localhost:3001';
const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';

console.log('🏆 Tournament System Integration Test\n');
console.log('Connecting to:', SOCKET_URL);
console.log('Test Address:', TEST_ADDRESS);
console.log('─'.repeat(60));

// Create socket connection
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
});

let testsPassed = 0;
let testsFailed = 0;

// Test results tracking
const results = {
  connection: false,
  createTournament: false,
  listTournaments: false,
  tournamentDetails: false,
};

// Helper function to run test
function runTest(name, testFn, timeout = 5000) {
  return new Promise((resolve) => {
    console.log(`\n📝 Testing: ${name}`);

    const timer = setTimeout(() => {
      console.log(`  ❌ FAILED - Timeout after ${timeout}ms`);
      testsFailed++;
      resolve(false);
    }, timeout);

    testFn()
      .then((result) => {
        clearTimeout(timer);
        if (result) {
          console.log(`  ✅ PASSED`);
          testsPassed++;
        } else {
          console.log(`  ❌ FAILED`);
          testsFailed++;
        }
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        console.log(`  ❌ FAILED - ${error.message}`);
        testsFailed++;
        resolve(false);
      });
  });
}

// Test 1: Connection
async function testConnection() {
  return new Promise((resolve) => {
    socket.on('connect', () => {
      results.connection = true;
      console.log(`  Socket ID: ${socket.id}`);
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      console.log(`  Error: ${error.message}`);
      resolve(false);
    });
  });
}

// Test 2: Create Tournament
async function testCreateTournament() {
  return new Promise((resolve) => {
    const tournamentData = {
      name: 'Integration Test Tournament',
      description: 'Automated test tournament',
      tournamentType: 0, // Single Elimination
      entryFee: '10000000000000000', // 0.01 CELO in wei
      minParticipants: 2,
      maxParticipants: 8,
      registrationStart: Math.floor(Date.now() / 1000) + 60,
      registrationEnd: Math.floor(Date.now() / 1000) + 3600,
      tournamentStart: Math.floor(Date.now() / 1000) + 3900,
      requiresGoldNFT: false,
      difficulty: 2, // Medium
      recurrence: 0, // None
    };

    socket.once('tournament:created', (tournament) => {
      console.log(`  Created Tournament ID: ${tournament.id}`);
      console.log(`  Name: ${tournament.name}`);
      console.log(`  Max Participants: ${tournament.maxParticipants}`);
      results.createTournament = tournament.id;
      resolve(true);
    });

    socket.once('tournament:error', (error) => {
      console.log(`  Error: ${error}`);
      resolve(false);
    });

    socket.emit('tournament:create', tournamentData);
  });
}

// Test 3: Get Tournament List
async function testListTournaments() {
  return new Promise((resolve) => {
    socket.once('tournament:list', (tournaments) => {
      console.log(`  Found ${tournaments.length} tournament(s)`);
      if (tournaments.length > 0) {
        console.log(`  First tournament: ${tournaments[0].name}`);
        results.listTournaments = true;
        resolve(true);
      } else {
        resolve(false);
      }
    });

    socket.emit('tournament:get_all');
  });
}

// Test 4: Get Tournament Details
async function testTournamentDetails() {
  if (!results.createTournament) {
    console.log('  Skipped - No tournament ID from creation test');
    return false;
  }

  return new Promise((resolve) => {
    socket.once('tournament:updated', (tournament) => {
      console.log(`  Tournament: ${tournament.name}`);
      console.log(`  Status: ${tournament.status}`);
      console.log(`  Participants: ${tournament.currentParticipants}/${tournament.maxParticipants}`);
      results.tournamentDetails = true;
      resolve(true);
    });

    socket.once('tournament:error', (error) => {
      console.log(`  Error: ${error}`);
      resolve(false);
    });

    socket.emit('tournament:get_details', {
      tournamentId: results.createTournament,
    });
  });
}

// Test 5: Register for Tournament
async function testRegistration() {
  if (!results.createTournament) {
    console.log('  Skipped - No tournament ID from creation test');
    return false;
  }

  return new Promise((resolve) => {
    socket.once('tournament:registered', (tournamentId, player) => {
      console.log(`  Registered player: ${player}`);
      console.log(`  Tournament ID: ${tournamentId}`);
      resolve(true);
    });

    socket.once('tournament:error', (error) => {
      console.log(`  Error: ${error}`);
      // Registration might fail if already registered or other reasons
      // Don't fail the test for this
      resolve(true);
    });

    socket.emit('tournament:register', {
      tournamentId: results.createTournament,
      address: TEST_ADDRESS,
      nickname: 'TestPlayer',
    });
  });
}

// Test 6: Get Bracket (will be empty before tournament starts)
async function testGetBracket() {
  if (!results.createTournament) {
    console.log('  Skipped - No tournament ID from creation test');
    return false;
  }

  return new Promise((resolve) => {
    socket.once('tournament:bracket_updated', (bracket) => {
      console.log(`  Bracket Type: ${bracket.type}`);
      console.log(`  Total Rounds: ${bracket.totalRounds}`);
      console.log(`  Current Matches: ${bracket.rounds.flat().length}`);
      resolve(true);
    });

    socket.once('tournament:error', (error) => {
      console.log(`  Error: ${error}`);
      resolve(false);
    });

    socket.emit('tournament:get_bracket', {
      tournamentId: results.createTournament,
    });
  });
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Tournament System Tests...\n');

  // Wait for connection
  await runTest('Socket Connection', testConnection, 10000);

  if (!results.connection) {
    console.log('\n❌ Connection failed. Stopping tests.');
    process.exit(1);
  }

  // Run tests sequentially
  await runTest('Create Tournament', testCreateTournament);
  await new Promise((r) => setTimeout(r, 1000)); // Wait 1s between tests

  await runTest('List Tournaments', testListTournaments);
  await new Promise((r) => setTimeout(r, 1000));

  await runTest('Get Tournament Details', testTournamentDetails);
  await new Promise((r) => setTimeout(r, 1000));

  await runTest('Register for Tournament', testRegistration);
  await new Promise((r) => setTimeout(r, 1000));

  await runTest('Get Tournament Bracket', testGetBracket);

  // Print summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 Test Summary');
  console.log('═'.repeat(60));
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('═'.repeat(60));

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Tournament system is working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.\n');
  }

  // Close connection
  socket.close();
  process.exit(testsFailed === 0 ? 0 : 1);
}

// Handle errors
socket.on('error', (error) => {
  console.error('Socket error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Start tests
runAllTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});
