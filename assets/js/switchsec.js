

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

// Wait until DOM fully loads
document.addEventListener('DOMContentLoaded', () => {
    // Add your button listeners for opening/joining game here if needed

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
});

