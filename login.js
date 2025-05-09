document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
  
    const userDB = {
      username: "admin",
      password: "1234"
    };
  
    if (username === userDB.username && password === userDB.password) {
      localStorage.setItem("logado", "true");
      window.location.href = "home.html"; 
    } else {
      document.getElementById("login-error").innerText = "Usuário ou senha incorretos.";
    }
  });
  