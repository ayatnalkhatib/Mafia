// for the opening section part


document.addEventListener('DOMContentLoaded', () => { // waits till the html page is full loaded 
    document.querySelector('.joinbutton').addEventListener('click', () => { // finds a button with that class name
        hidesection('join'); // selects it to reload the page 
    });

    document.querySelector('.createbutton').addEventListener('click', () => {
        hidesection('create');
    });

    document.getElementById('publicbutton').addEventListener('click', () => {
        hidesection('joinpublic');
    });

    document.getElementById('privatebutton').addEventListener('click', () => {
        hidesection('joinprivate');
    });
});

// create page

document.addEventListener('DOMContentLoaded', function () {
  const startBtn = document.getElementById('startGameBtn');
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      console.log('Game starting...');
    });
  }
});
