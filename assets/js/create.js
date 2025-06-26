document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createform');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form from refreshing the page

    // Get values from form
    const accessCode = document.getElementById('createcode')?.value.trim();
    const gameType = document.querySelector('input[name="gameType"]:checked')?.value;
    const playerInput = document.getElementById('howmanyplayers');
    const numPlayers = parseInt(playerInput?.value, 10);
    const storyline = document.querySelector('input[name="gameTypestory"]:checked')?.value;

    // Validate selections
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

    // Store game data
    const gameData = {
      accessCode,
      gameType,
      numPlayers,
      storyline,
    };

    console.log("✅ Game Created:", gameData);

    // Show the lobby and pass in access code
    const lobbyCode = document.getElementById('lobbyCode');
    if (lobbyCode) {
      lobbyCode.textContent = accessCode;
    }

    hidesection('lobby');
  });
});

// Utility to switch visible section
function hidesection(sectionId) {
  const sections = document.querySelectorAll('.mafiagame');
  sections.forEach(section => {
    section.style.display = 'none';
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = 'block';
  }
}
