document.addEventListener('DOMContentLoaded', () => {


// Section switching buttons

  const joinBtn = document.querySelector('.joinbutton');
  const createBtn = document.querySelector('.createbutton');

  if (joinBtn) {
    joinBtn.addEventListener('click', () => hidesection('join'));
  }

  if (createBtn) {
    createBtn.addEventListener('click', () => hidesection('create'));
  }

// Create Game form handling

  const createFormBtn = document.getElementById('createButton');
  if (createFormBtn) {
    createFormBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const accessCode = document.getElementById('createcode')?.value.trim();
      const gameType = document.querySelector('input[name="gameType"]:checked')?.value;
      const playerInput = document.getElementById('howmanyplayers');
      const numPlayers = parseInt(playerInput?.value, 10);
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

      const gameData = { accessCode, gameType, numPlayers, storyline };
      console.log("✅ Game Created:", gameData);

      const lobbyCode = document.getElementById('lobbyCode');
      if (lobbyCode) lobbyCode.textContent = accessCode;

      hidesection('lobby');
    });
  }

  
  // Start Game button

  const startBtn = document.getElementById('startGameBtn');
  if (startBtn) {
    startBtn.addEventListener('click', startGame);
  }

});


// Utility: switch visible section

function hidesection(sectionId) {
  const sections = document.querySelectorAll('.mafiagame');
  sections.forEach(sec => sec.style.display = 'none');

  const target = document.getElementById(sectionId);
  if (target) target.style.display = 'block';
}


// Start Game logic

function startGame() {
  console.log("Get Ready to be betrayed...");
  const storyline = document.querySelector('input[name="storyline"]:checked')?.value;

  let role = [];
  switch (storyline) {
    case 'story1':
      role = ['The Shadow', 'Healer', 'Guard', 'Wizard'];
      break;
    default:
      role = ['Villager', 'Detective', 'Traitor']; // fallback roles
  }

  const assignRole = role[Math.floor(Math.random() * role.length)];
  const playerrole = document.getElementById('playerRole');
  if (playerrole) playerrole.textContent = assignRole;

  const storyInfo = document.getElementById('storylineDisplay');
  if (storyInfo) storyInfo.textContent = storyline;

  const msg = document.getElementById('gameMessage');
  if (msg) msg.textContent = "Get Ready to be betrayed...";

  hidesection('showtime');
}