

function hidesection(sectiongameid){ //function created
    
    const sections = document.querySelectorAll('.mafiagame'); // we want to target the sections with the class of mafiagame
    sections.forEach(sec => { // it goes through the sections
        sec.style.display = 'none'; // hides the sections 
    });

    const target = document.getElementById(sectiongameid); // targets the section we want 
    if(target){ // checks the sections that is being targeted 
        target.style.display ='block'; // finds the section and displays it
        // this is for code generate 
        if (sectiongameid  === 'create'){
        const codegenerate = document.getElementById('createcode');
        if (codegenerate){
            codegenerate.value = generateroomcode();
    }
}
    }
}

// gerateroomcode 

function generateroomcode(length = 6) {
    const char='ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let code = '';
    for (let i = 0; i < length; i++){
        code += char.charAt(Math.floor(Math.random() * char.length));
    } 
    return code; 
}

// generatename 
function generatename(length = 10){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'; 
    const adjectives = ["Mystic", "Endeavor", "Candor", "Cogent", "Brood", "Comely", "Elegant", "Incognito", "Bucolic", "Cognizant", "Claggy", "Epitome", "Tectonic", "Delicacy", "Vicinal", "Boffola", "Nougat", "Rigorous", "Vortex", "Scrupulous", "Languish", "Elicit", "Whimsical", "Argute", "Vehement", "Fipple", "Ortanique", "Panacea", "Tranquility", "Galactic", "Ethereal", "Orectic", "Fankle", "Canorous", "Elixir", "Neon", "Glitter", "Petals", "Cherish", "Lavender", "Spirit", "Blossom", "Shine", "Fantasy", "Crew", "Breeze", "Lavish", "Peach", "Pear", "Velvet", "Gem", "Bliss", "Toffee", "Pearl", "Splash", "Cherub", "Maven", "Fern", "Venus", "Dew", "Diva", "Lime", "Titan", "Aurora", "Magma", "Optimal", "Tango", "Dazzle", "Mighty", "Stellar", "Bingo", "Everly", "Dulcet", "Palette", "Vintage", "Raw", "Lad", "Revive", "Musing", "Scintilla", "Opulent", "Squidgy", "Zenith", "Vista", "Rejoice", "Eva", "Dimple", "Soothe", "Alluring", "Armor", "Beatific", "Ignite", "Classic", "Blaze", "Jazz", "Amigo", "Nugget", "Dawn", "Twilight", "Flora", "Harmony", "Acme", "Blush", "Tinge", "Hue", "Crimson", "Bloom", "Crest", "Burgeon", "Aquiver", "Aesthetic", "Mellifluous", "Pavonine", "Nesh", "Luculent", "Effable", "Demure", "Rejoice", "Lissome", "Loquacious", "Petrichor", "Eloquence", "Cherish", "Languor", "Renaissance", "Elision", "Deasil", "Vivacious", "Epoch", "Limerence", "Stellar", "Kylie", "Ineffable", "Epiphany", "Pristine", "Radiant", "Sublime", "Brisk", "Vellichor", "Euphoria", "Agility", "Evanescent", "Symphony", "Alacrity", "Astonish", "Caprice", "Classy", "Ecstasy", "Tenacity", "Flowing", "Juvenescent", "Dazzling", "Efflorescence", "Feisty", "Kindred", "Jovial", "Hilarity", "Mellow", "Pacify", "Serendipity", "Phosphenes", "Quietude", "Ravel", "Quaint", "Cuddle", "Quadrivium", "Susurrous", "Piquancy", "Spellbound", "Saunter", "Ripple", "Gossamer", "Lagniappe", "Wafture", "Harbinger", "Lagoon", "Supine", "Lilt", "Scenic", "Wherewithal", "Sibilance", "Redolent", "Tender", "Moiety", "Cynosure", "Vestigial", "Offing", "Endearing", "Captivate", "Adorable", "Intrepid", "Audacious", "Lovable", "Spellbind", "Lovely", "Appealing", "Bonzer", "Delight", "Winsome", "Charm", "Valiant", "Enrapture", "Enchant", "Engross", "Dinky", "Bonny", "Tweet", "Supreme", "Comely", "Sunshine", "Pretty", "Beautify", "Adorn", "Embellish", "Smarten", "Prink", "Endear", "Alpha", "Success", "Intense", "Zen", "Angelic", "Epic", "Bright", "Gentle", "Avian", "Little", "Royal", "Aerial", "Cool", "Fresh", "Fantasy", "Real", "Terrific", "Superior", "Vivacious", "Tender", "Swaggy", "Magnificent", "Luminous", "Brilliant", "Stylish", "Ideal", "Ace", "Exemplary", "Utopian", "Glory", "Pleasing", "Astounding", "Superb", "Wondrous", "Lovely", "Bracing", "Winsome", "Ravish", "Frosty", "Scenic"];
   // const number = Math.floor(Math.random()*100);
    const randWord = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randSuffix = Array.from(
    { length: 4 }, 
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
    return randWord + randSuffix;

}
//saves the name a storage where able to be accesed 
function saveName(name) {
  localStorage.setItem('playerName', name);
}

// finds the name and gets the name 
function loadName() {
  const storedName = localStorage.getItem('playerName');

  return storedName || generatename();
}

// sets the text box to be able to view as well to change name 

function setupNameInput() {
  const nameInput = document.getElementById('name');
  if (!nameInput) return;

  const playerName = loadName();
  nameInput.value = playerName;

// saves the new input if enetred by the user 
  nameInput.addEventListener('input', () => {
    saveName(nameInput.value);
  });
}
// loads the page 
document.addEventListener('DOMContentLoaded', () => {
  setupNameInput();

  const nameDisplay = document.getElementById('lobbyName');
  if (nameDisplay) {
    nameDisplay.textContent = loadName();
  }

  // Handle the create game form submission
  const form = document.getElementById('createform');
  if (!form) {
    console.error("Create form not found (id=createform)");
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();  // Prevent page reload

    // Grab values
    const accessCode = document.getElementById('createcode')?.value.trim();
    const gameType = document.querySelector('input[name="gameType"]:checked')?.value;
    const playerInput = document.getElementById('howmanyplayers');
    const numPlayers = parseInt(playerInput?.value, 10);
    const storyline = document.querySelector('input[name="gameTypestory"]:checked')?.value;

    // Validation
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

    // Log or handle the game creation data
    const gameData = {
      accessCode,
      gameType,
      numPlayers,
      storyline,
    };
    console.log("Game Created:", gameData);

    // Show the lobby and update access code display
    const lobbyCode = document.getElementById('lobbyCode');
    if (lobbyCode) {
      lobbyCode.textContent = accessCode;
    }

    hidesection('lobby');
  });

  // Also move your Enter-key listener in here
  const textbox = document.getElementById("roomcode");
  if (textbox) {
    textbox.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("myForm")?.submit();
      }
    });
  }
});




// create page 
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.slider-container');
  let currentSlide = 0;

  const updateSlide = () => {
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
  };

  document.getElementById('next1')?.addEventListener('click', () => {
    currentSlide = 1;
    updateSlide();
  });

  document.getElementById('next2')?.addEventListener('click', () => {
    currentSlide = 2;
    updateSlide();
  });

  document.getElementById('next3')?.addEventListener('click', () => {
    // Go to next or finalize
  });

  document.getElementById('prev2')?.addEventListener('click', () => {
    currentSlide = 0;
    updateSlide();
  });

  document.getElementById('prev3')?.addEventListener('click', () => {
    currentSlide = 1;
    updateSlide();
  });
});


  // start the game loading

  
function startGame (){
  console.log("Get Ready to be betrayed... ")
  const storyline = document.querySelector('input[name="gameTypestory"]:checked')?.value;


  let role = [];

  switch(storyline){
    case 'harrypotterstoryline':
      role = ['The Shadow', 'Healer', 'Guard', 'Wizard'];
    break; 
  }

  const assignRole = roles[Math.floor(Math.random() * role.length)];

  const playerrole = document.getElementById('playerRole');
  if (playerrole) playerrole.textContent = assignRole;

  const storyInfo = document.getElementById('storylineDisplay');
  if (storyInfo) storyInfo.textContent = storyline;

  hidesection('showtime');
  
  

}

