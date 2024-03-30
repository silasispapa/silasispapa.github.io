let darkMode = false;

function setup() {
  noCanvas();
}

function toggleMode() {
  darkMode = !darkMode;
  updateColors();
}

function updateColors() {
  const body = document.body;
  const button = document.getElementById('modebutton');
  const facebut = document.getElementById('faceemoji');
  // Select all elements on the page
  const allElements = document.querySelectorAll('*');

  if (darkMode) {
    body.style.backgroundColor = '#222';
    body.style.color = '#fff';
    button.innerHTML = '🌙';
    facebut.innerHTML = '😴';
    allElements.forEach(element => {
      element.classList.add('dark-mode'); // Replace 'yourClassName' with the desired class name
    });
  } 
  else 
  {
    body.style.backgroundColor = '#fff';
    body.style.color = '#000';
    button.innerHTML = '☀️';
    facebut.innerHTML = '😎';
    allElements.forEach(element => {
      element.classList.remove('dark-mode'); // Replace 'yourClassName' with the desired class name
    });
  }
}
