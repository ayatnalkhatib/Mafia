// main.js
// Owns: player name generation/storage, page wiring, form validation,
// Firebase room create/join, and game-start / role-assignment logic.
// Depends on hidesection() and generateroomcode() from switchsec.js.

import { db } from './firebase-config.js';
console.log('main.js loaded: Firebase connected');
import { ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// All narrator text for the Harry Potter storyline, in one place so it's
// easy to find and edit without hunting through game logic.
const storylines = {
  story1: {
    title: "Hogwarts Under Shadow",
    intro: "Welcome, students, to another magical term at Hogwarts! I'm Albus, Head of the Wizards' Room. This year's competition for the Wizard's Cup promises to be intense. Before we begin, kindly introduce yourselves — just your name and a fun fact (but don't reveal your role!).",
    nightBegins: "The stars shine over the castle as everyone returns to their dormitories. The halls of Hogwarts fall silent…",
    mafiaWake: "The Shadow, wake up.. You belong to a secret group seeking to take control of Hogwarts from the shadows. Work together and select one target for tonight. Keep it quiet. Hogwarts is always listening... Now, The Shadow — return to your chambers.",
    doctorWake: "Healer, awaken. Someone's life may be in danger. Use your knowledge of protective charms to shield a student tonight. You may choose yourself — but choose wisely. Thank you, Healer. Please return to your dormitory.",
    policeWake: "Guard, awaken. Dark activity stirs in Hogwarts. Use your enchanted tools to investigate one student quietly. We'll let you know if you've sensed hidden allegiance. Thank you. Please return to your office quietly.",
    morning: "A new day dawns over Hogwarts. Strange things may have happened overnight… everyone, gather in the Great Hall.",
    deathMessages: [
      "{playerName} was found unconscious near the Forbidden Forest. A duel gone wrong, perhaps?",
      "The Whomping Willow thrashed violently last night — and sadly, {playerName} was caught in its path.",
      "A broken wand and a scorch mark were all that remained where {playerName} was last seen.",
      "{playerName} never returned from Astronomy class… only their bag was found on the tower steps.",
      "{playerName} left for a late-night broom ride and vanished into the clouds.",
      "Hagrid's dog, Fang, barked all night — he was guarding something… it was {playerName}'s scarf.",
      "An enchanted message was found: 'One has fallen.' Sadly, it was {playerName}.",
      "The Marauder's Map lost a dot. {playerName} is missing — and presumed out of the game."
    ],
    noDeath: "Excellent news! The school is safe tonight thanks to quick thinking and well-placed protective charms.",
    votingPrompt: "Now it's time to discuss. Who among us is hiding secrets? You have 5 minutes to share suspicions and cast your votes. Trust your instincts — but remember, mistakes can cost us friends.",
    votedWasMafia: "Bravo! We've caught a secret saboteur — {playerName} was working against Hogwarts all along!",
    votedNotMafia: "Oh no… {playerName} was not working against us. We've lost one of our own.",
    mafiaWinMsg: "The secret group has overpowered the guardians of Hogwarts. The castle has fallen into unrest… and the Wizard's Cup is lost to darkness.",
    villagerWinMsg: "Hogwarts stands strong! Thanks to your courage and teamwork, those working in the shadows have been uncovered and expelled. Peace returns to the castle."
  }
};

// Fills a role list to match the number of players.
// Ratio: ~1 Shadow (mafia) per 4 players, exactly 1 Healer, 1 Guard,
// everyone else is a plain Wizard (the villager/filler role).
function buildRoleList(numPlayers) {
  const numMafia = Math.max(1, Math.floor(numPlayers / 4));
  const roles = [];
  for (let i = 0; i < numMafia; i++) roles.push('The Shadow');
  roles.push('Healer');
  roles.push('Guard');
  while (roles.length < numPlayers) roles.push('Wizard');
  return roles;
}

// Fisher-Yates shuffle — standard way to randomize an array in place
// without bias toward any particular ordering.
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------
// Database layout (what lives where)
//   rooms/{code}            public: host, phase, players{name,alive}, morning
//   roles/{code}/{id}       each player's secret role (only the host reads all)
//   actions/{code}/...      night choices (shadow votes, healer, guard)
//   results/{code}/{id}     private night results (the Guard's investigation)
// Players only listen to the public room node plus their own role/result,
// so nobody's screen ever receives anyone else's role.
// ---------------------------------------------------------------

let myRole = null;
let revealShown = false;
let lastRenderedPhase = null;
let latestRoom = null;
let latestResult = null;
let resolvingNight = false;

// Host-only: assigns one role per player, then moves to night after the reveal.
async function assignRolesAndStart(roomCode) {
  try {
    const snapshot = await get(ref(db, `rooms/${roomCode}/players`));
    const players = snapshot.val() || {};
    const playerIds = Object.keys(players);

    if (playerIds.length < 3) {
      alert("You need at least 3 players to start (Shadow, Healer, Guard).");
      return;
    }

    const roles = shuffleArray(buildRoleList(playerIds.length));

    const updates = {};
    playerIds.forEach((id, index) => {
      updates[`roles/${roomCode}/${id}`] = roles[index];
      updates[`rooms/${roomCode}/players/${id}/alive`] = true;
    });
    updates[`actions/${roomCode}`] = null;
    updates[`results/${roomCode}`] = null;
    updates[`rooms/${roomCode}/morning`] = null;
    updates[`rooms/${roomCode}/phase`] = 'reveal';
    await update(ref(db), updates);

    // Give everyone time to read their role, then start the first night.
    setTimeout(() => {
      update(ref(db, `rooms/${roomCode}`), { phase: 'night' });
    }, 10000);
  } catch (error) {
    console.error("Failed to assign roles:", error);
    alert("Something went wrong starting the game.");
  }
}

// Each client listens to only its own role.
function listenForOwnRole(roomCode) {
  const myId = loadName();

  onValue(ref(db, `roles/${roomCode}/${myId}`), (snapshot) => {
    const role = snapshot.val();
    if (!role) return;
    myRole = role;
    if (revealShown) return;
    revealShown = true;

    const story = storylines.story1;
    const playerRoleEl = document.getElementById('playerRole');
    if (playerRoleEl) playerRoleEl.textContent = role;
    const storyInfoEl = document.getElementById('storylineDisplay');
    if (storyInfoEl) storyInfoEl.textContent = story.title;
    const msgEl = document.getElementById('gameMessage');
    if (msgEl) msgEl.textContent = story.intro;

    hidesection('showtime');
  });
}

// Private night results (the Guard's investigation answer).
function listenForResults(roomCode) {
  const myId = loadName();
  onValue(ref(db, `results/${roomCode}/${myId}`), (snapshot) => {
    latestResult = snapshot.val();
    const resultEl = document.getElementById('nightResult');
    if (resultEl && latestResult) resultEl.textContent = latestResult;
  });
}

// Everyone listens to the public room node and reacts when the phase changes.
function listenForRoom(roomCode) {
  onValue(ref(db, `rooms/${roomCode}`), (snapshot) => {
    const room = snapshot.val();
    if (!room) return;
    latestRoom = room;

    if (room.phase === lastRenderedPhase) return;
    lastRenderedPhase = room.phase;

    if (room.phase === 'night') renderNight(roomCode, room);
    if (room.phase === 'morning') renderMorning(room);
  });
}

function makeEl(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderNight(roomCode, room) {
  const story = storylines.story1;
  const myId = loadName();
  const me = (room.players || {})[myId];
  const container = document.getElementById('gamestart');
  container.innerHTML = '';

  container.appendChild(makeEl('h2', 'Night falls'));

  if (!me || !me.alive) {
    container.appendChild(makeEl('p', 'You are out of the game. Stay silent and watch the night unfold…'));
    hidesection('gamestart');
    return;
  }

  const actions = {
    'The Shadow': { wake: story.mafiaWake, path: `actions/${roomCode}/shadow/${myId}`, canTargetSelf: false },
    'Healer': { wake: story.doctorWake, path: `actions/${roomCode}/healer`, canTargetSelf: true },
    'Guard': { wake: story.policeWake, path: `actions/${roomCode}/guard`, canTargetSelf: false }
  };
  const myAction = actions[myRole];

  if (!myAction) {
    container.appendChild(makeEl('p', story.nightBegins));
    container.appendChild(makeEl('p', 'Close your eyes. Wait for morning…'));
    hidesection('gamestart');
    return;
  }

  container.appendChild(makeEl('p', myAction.wake));
  const list = makeEl('div', null, 'targetlist');

  Object.entries(room.players || {})
    .filter(([id, p]) => p.alive && (myAction.canTargetSelf || id !== myId))
    .forEach(([id, p]) => {
      const btn = makeEl('button', p.name, 'targetbtn');
      btn.type = 'button';
      btn.addEventListener('click', () => {
        set(ref(db, myAction.path), id).then(() => {
          list.querySelectorAll('.targetbtn').forEach(b => { b.disabled = true; });
          btn.classList.add('selected');
          container.appendChild(makeEl('p', 'Choice locked in. Wait for morning…'));
        });
      });
      list.appendChild(btn);
    });

  container.appendChild(list);
  hidesection('gamestart');
}

function renderMorning(room) {
  const story = storylines.story1;
  const container = document.getElementById('gamestart');
  container.innerHTML = '';

  container.appendChild(makeEl('h2', 'Morning'));
  container.appendChild(makeEl('p', story.morning));

  const m = room.morning || {};
  const outcome = m.victimName
    ? story.deathMessages[m.msgIndex % story.deathMessages.length].replace('{playerName}', m.victimName)
    : story.noDeath;
  container.appendChild(makeEl('p', outcome));

  const resultEl = makeEl('p', latestResult || '', 'nightresult');
  resultEl.id = 'nightResult';
  container.appendChild(resultEl);

  hidesection('gamestart');
}

// Host-only: watches the night actions and resolves the night once every
// living special role has chosen.
function listenForActionsAsHost(roomCode) {
  onValue(ref(db, `actions/${roomCode}`), async (snapshot) => {
    if (!latestRoom || latestRoom.phase !== 'night' || resolvingNight) return;

    const actions = snapshot.val() || {};
    const rolesSnap = await get(ref(db, `roles/${roomCode}`));
    const roles = rolesSnap.val() || {};
    const players = latestRoom.players || {};

    const alive = Object.keys(players).filter(id => players[id].alive);
    const aliveWith = (r) => alive.filter(id => roles[id] === r);

    const shadows = aliveWith('The Shadow');
    const guards = aliveWith('Guard');
    const healers = aliveWith('Healer');

    const shadowVotes = Object.entries(actions.shadow || {})
      .filter(([id]) => shadows.includes(id))
      .map(([, target]) => target);

    if (shadowVotes.length < shadows.length) return;
    if (healers.length && !actions.healer) return;
    if (guards.length && !actions.guard) return;

    resolvingNight = true;
    try {
      // Most-voted target wins; ties are broken at random.
      const tally = {};
      shadowVotes.forEach(t => { tally[t] = (tally[t] || 0) + 1; });
      const top = Math.max(...Object.values(tally));
      const tied = Object.keys(tally).filter(t => tally[t] === top);
      const victim = tied[Math.floor(Math.random() * tied.length)];
      const saved = actions.healer === victim;

      const updates = {};
      if (!saved) updates[`rooms/${roomCode}/players/${victim}/alive`] = false;

      if (guards.length && actions.guard) {
        const suspect = actions.guard;
        const verdict = roles[suspect] === 'The Shadow' ? 'is' : 'is not';
        updates[`results/${roomCode}/${guards[0]}`] =
          `Your enchanted tools reveal that ${players[suspect].name} ${verdict} one of The Shadow.`;
      }

      updates[`rooms/${roomCode}/morning`] = {
        victimName: saved ? null : players[victim].name,
        msgIndex: Math.floor(Math.random() * storylines.story1.deathMessages.length)
      };
      updates[`actions/${roomCode}`] = null;
      updates[`rooms/${roomCode}/phase`] = 'morning';

      await update(ref(db), updates);
    } catch (error) {
      console.error("Failed to resolve the night:", error);
    } finally {
      resolvingNight = false;
    }
  });
}

const NAME_ADJECTIVES = ["Mystic", "Endeavor", "Candor", "Cogent", "Brood", "Comely", "Elegant", "Incognito", "Bucolic", "Cognizant", "Claggy", "Epitome", "Tectonic", "Delicacy", "Vicinal", "Boffola", "Nougat", "Rigorous", "Vortex", "Scrupulous", "Languish", "Elicit", "Whimsical", "Argute", "Vehement", "Fipple", "Ortanique", "Panacea", "Tranquility", "Galactic", "Ethereal", "Orectic", "Fankle", "Canorous", "Elixir", "Neon", "Glitter", "Petals", "Cherish", "Lavender", "Spirit", "Blossom", "Shine", "Fantasy", "Crew", "Breeze", "Lavish", "Peach", "Pear", "Velvet", "Gem", "Bliss", "Toffee", "Pearl", "Splash", "Cherub", "Maven", "Fern", "Venus", "Dew", "Diva", "Lime", "Titan", "Aurora", "Magma", "Optimal", "Tango", "Dazzle", "Mighty", "Stellar", "Bingo", "Everly", "Dulcet", "Palette", "Vintage", "Raw", "Lad", "Revive", "Musing", "Scintilla", "Opulent", "Squidgy", "Zenith", "Vista", "Rejoice", "Eva", "Dimple", "Soothe", "Alluring", "Armor", "Beatific", "Ignite", "Classic", "Blaze", "Jazz", "Amigo", "Nugget", "Dawn", "Twilight", "Flora", "Harmony", "Acme", "Blush", "Tinge", "Hue", "Crimson", "Bloom", "Crest", "Burgeon", "Aquiver", "Aesthetic", "Mellifluous", "Pavonine", "Nesh", "Luculent", "Effable", "Demure", "Lissome", "Loquacious", "Petrichor", "Eloquence", "Languor", "Renaissance", "Elision", "Deasil", "Vivacious", "Epoch", "Limerence", "Kylie", "Ineffable", "Epiphany", "Pristine", "Radiant", "Sublime", "Brisk", "Vellichor", "Euphoria", "Agility", "Evanescent", "Symphony", "Alacrity", "Astonish", "Caprice", "Classy", "Ecstasy", "Tenacity", "Flowing", "Juvenescent", "Dazzling", "Efflorescence", "Feisty", "Kindred", "Jovial", "Hilarity", "Mellow", "Pacify", "Serendipity", "Phosphenes", "Quietude", "Ravel", "Quaint", "Cuddle", "Quadrivium", "Susurrous", "Piquancy", "Spellbound", "Saunter", "Ripple", "Gossamer", "Lagniappe", "Wafture", "Harbinger", "Lagoon", "Supine", "Lilt", "Scenic", "Wherewithal", "Sibilance", "Redolent", "Tender", "Moiety", "Cynosure", "Vestigial", "Offing", "Endearing", "Captivate", "Adorable", "Intrepid", "Audacious", "Lovable", "Spellbind", "Lovely", "Appealing", "Bonzer", "Delight", "Winsome", "Charm", "Valiant", "Enrapture", "Enchant", "Engross", "Dinky", "Bonny", "Tweet", "Supreme", "Sunshine", "Pretty", "Beautify", "Adorn", "Embellish", "Smarten", "Prink", "Endear", "Alpha", "Success", "Intense", "Zen", "Angelic", "Epic", "Bright", "Gentle", "Avian", "Little", "Royal", "Aerial", "Cool", "Fresh", "Real", "Terrific", "Superior", "Swaggy", "Magnificent", "Luminous", "Brilliant", "Stylish", "Ideal", "Ace", "Exemplary", "Utopian", "Glory", "Pleasing", "Astounding", "Superb", "Wondrous", "Bracing", "Ravish", "Frosty", "Scenic"];

function generatename() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const randWord = NAME_ADJECTIVES[Math.floor(Math.random() * NAME_ADJECTIVES.length)];
  const randSuffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return randWord + randSuffix;
}

function saveName(name) {
  localStorage.setItem('playerName', name);
}

function loadName() {
  return localStorage.getItem('playerName') || generatename();
}

function setupNameInput() {
  const nameInput = document.getElementById('name');
  if (!nameInput) return;

  const name = loadName();
  saveName(name); // persist it so later loadName() calls return the same ID
  nameInput.value = name;
  nameInput.addEventListener('input', () => saveName(nameInput.value));
}

// Keeps the lobby's player list updated live for everyone in the room
function listenForPlayers(roomCode) {
  const playersRef = ref(db, `rooms/${roomCode}/players`);

  onValue(playersRef, (snapshot) => {
    const players = snapshot.val() || {};
    const playerList = document.getElementById('playerList');
    if (!playerList) return;

    playerList.innerHTML = '';
    Object.values(players).forEach((player) => {
      const li = document.createElement('li');
      li.textContent = player.name;
      playerList.appendChild(li);
    });
  });
}

// Tracks which room this browser is currently in, set once
// Create or Join succeeds. Needed so the Start Game button knows
// which room to assign roles for.
let currentRoomCode = null;

document.addEventListener('DOMContentLoaded', () => {
  setupNameInput();

  const nameDisplay = document.getElementById('lobbyName');
  if (nameDisplay) nameDisplay.textContent = loadName();

  // Join / Create / Back navigation is wired in switchsec.js
  // (no Firebase dependency), so it is intentionally not repeated here.

  // Create-game button
  // NOTE: this is a plain <button>, not inside a <form> that submits,
  // so we listen for 'click', not 'submit'.
  const createButton = document.getElementById('createButton');
  if (createButton) {
    createButton.addEventListener('click', (e) => {
      e.preventDefault();

      const accessCode = document.getElementById('createcode')?.value.trim();
      const gameType = document.querySelector('input[name="gameType"]:checked')?.value;
      const numPlayers = parseInt(document.getElementById('howmanyplayers')?.value, 10);
      const storyline = document.querySelector('input[name="storyline"]:checked')?.value;

      if (!gameType) {
        alert("Please select Public or Private.");
        return;
      }
      if (isNaN(numPlayers) || numPlayers < 7 || numPlayers > 20) {
        alert("Please enter a number of players between 7 and 20.");
        return;
      }
      if (!storyline) {
        alert("Please choose a storyline.");
        return;
      }

      console.log("Create clicked:", { accessCode, gameType, numPlayers, storyline });

      if (!accessCode) {
        alert("No room code was generated. Go back and press Create again.");
        return;
      }

      // If Firebase never answers (wrong databaseURL, database not created),
      // set() just waits forever with no error, so warn after 8 seconds.
      const dbTimeout = setTimeout(() => {
        alert("Can’t reach the database. Check that the Realtime Database exists and that databaseURL in firebase-config.js is correct.");
      }, 8000);

      // Write the room to Firebase, then add the host as the first player
      const roomRef = ref(db, 'rooms/' + accessCode);

      set(roomRef, {
        gameType: gameType,
        numPlayers: numPlayers,
        storyline: storyline,
        phase: "lobby",
        host: loadName(),
        players: {}
      }).then(() => {
        const hostId = loadName();
        return update(ref(db, `rooms/${accessCode}/players/${hostId}`), {
          name: hostId,
          role: null,
          alive: true
        });
      }).then(() => {
        clearTimeout(dbTimeout);
        console.log("Room created in Firebase:", accessCode);
        currentRoomCode = accessCode;
        hidesection('lobby');
        listenForPlayers(accessCode);
        listenForOwnRole(accessCode);
        listenForResults(accessCode);
        listenForRoom(accessCode);
        listenForActionsAsHost(accessCode);
      }).catch((error) => {
        clearTimeout(dbTimeout);
        console.error("Failed to create room:", error);
        alert("Something went wrong creating the room.");
      });
    });
  }

  // Start game button — host only, in practice, since only whoever is
  // looking at the lobby with the button visible will click it.
  const startBtn = document.getElementById('startGameBtn');
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      if (!currentRoomCode) {
        alert("You’re not in a room yet.");
        return;
      }
      const hostSnap = await get(ref(db, `rooms/${currentRoomCode}/host`));
      if (hostSnap.val() !== loadName()) {
        alert("Only the host can start the game.");
        return;
      }
      assignRolesAndStart(currentRoomCode);
    });
  }

  // Join a private room by code
  // A native Enter keypress inside this form already fires 'submit',
  // so this one listener handles both the button click and Enter.
  const privateForm = document.getElementById('privateForm');
  if (privateForm) {
    privateForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const enteredCode = document.getElementById('roomcode')?.value.trim();
      if (!enteredCode) {
        alert("Please enter a room code.");
        return;
      }

      const roomRef = ref(db, 'rooms/' + enteredCode);

      get(roomRef).then((snapshot) => {
        if (!snapshot.exists()) {
          alert("Room not found. Check the code and try again.");
          return;
        }

        const playerId = loadName();
        return update(ref(db, `rooms/${enteredCode}/players/${playerId}`), {
          name: playerId,
          role: null,
          alive: true
        }).then(() => {
          currentRoomCode = enteredCode;
          hidesection('lobby');
          listenForPlayers(enteredCode);
          listenForOwnRole(enteredCode);
          listenForResults(enteredCode);
          listenForRoom(enteredCode);
        });
      }).catch((error) => {
        console.error("Failed to join room:", error);
        alert("Something went wrong joining the room.");
      });
    });
  }
});