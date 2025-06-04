let clickCount = 0;

function abrirDoom() {
  clickCount++; 
  if (clickCount >= 5) { 
    clickCount = 0; 
  }
}
