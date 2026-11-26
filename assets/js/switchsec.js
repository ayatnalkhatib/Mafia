// switchsec.js
// Single responsibility: switching which .mafiagame section is visible,
// plus the room-code generator used when the "create" section is shown.

// Remembers whether the opening screen has already played its intro once.
let openingShownOnce = false;

function hidesection(sectiongameid) {
  const sections = document.querySelectorAll('.mafiagame');
  sections.forEach(sec => {
    sec.style.display = 'none';
  });

  const target = document.getElementById(sectiongameid);
  if (!target) return;

  target.classList.remove('hidden');

  // First visit plays the full animated intro. Coming back via Back skips it,
  // otherwise the Join / Create buttons stay invisible for ~9 seconds.
  if (sectiongameid === 'opening') {
    if (openingShownOnce) target.classList.add('returned');
    openingShownOnce = true;
  }
  // Let the stylesheet decide the layout: the opening, join, create and lobby
  // screens are flex-centred in CSS. Only fall back to block for sections
  // that have no display rule of their own (showtime, gamestart, ...).
  target.style.removeProperty('display');
  if (getComputedStyle(target).display === 'none') {
    target.style.display = 'block';
  }

  // Generate a fresh room code whenever the create section is shown
  if (sectiongameid === 'create') {
    const codegenerate = document.getElementById('createcode');
    if (codegenerate) {
      codegenerate.value = generateroomcode();
    }
  }

  target.style.zIndex = '9999';
  target.style.position = 'relative';
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function generateroomcode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}


// ---------------------------------------------------------------
// Navigation wiring (Join / Create / Back).
// Lives here, in a plain script with no imports, so these buttons keep
// working even if main.js or Firebase fails to load.
// ---------------------------------------------------------------
function wireNavigation() {
  const joinBtn = document.querySelector('.joinbutton');
  const createBtn = document.querySelector('.createbutton');
  if (joinBtn) joinBtn.addEventListener('click', () => hidesection('join'));
  if (createBtn) createBtn.addEventListener('click', () => hidesection('create'));

  document.querySelectorAll('.backbutton').forEach((btn) => {
    btn.addEventListener('click', () => hidesection('opening'));
  });

  // Every screen is visible at page load (their CSS display rules beat
  // .mafiagame {display:none}), which is why the Back buttons of Join and
  // Create showed up on the main screen. Show only the opening screen.
  hidesection('opening');

  console.log('switchsec.js loaded: navigation buttons are wired');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireNavigation);
} else {
  wireNavigation();
}