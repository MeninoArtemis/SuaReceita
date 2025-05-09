let clickCount = 0;

function abrirDoom() {
  clickCount++; // Aumenta o contador a cada clique
  if (clickCount >= 5) {  // Se o número de cliques for 5 ou mais
    window.location.href = 'doom.html';  // Redireciona para o jogo DOOM
    clickCount = 0; // Reseta o contador
  }
}
