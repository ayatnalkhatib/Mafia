
function hidesection(sectiongameid){ //function created
    
    const sections = document.querySelectorAll('.mafiagame'); // we want to target the sections with the class of mafiagame
    sections.forEach(sec => { // it goes through the sections
        sec.style.display = 'none'; // hides the sections 
    });

    const target = document.getElementById(sectiongameid); // targets the section we want 
    if(target){ // checks the sections that is being targeted 
        target.style.display ='block'; // finds the section and displays it
    }
}