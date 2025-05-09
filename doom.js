    let clickCount = 0;

    function abrirDoom() {
      clickCount++; 
      if (clickCount >= 5) { 
 
        window.open("https://js-dos.com/games/doom.exe.html", "_blank");

  
        const popup = document.getElementById("instructionsPopup");
        popup.style.display = "block";

        clickCount = 0; 
      }
    }
    function fecharPopup() {
      const popup = document.getElementById("instructionsPopup");
      popup.style.display = "none";
    }