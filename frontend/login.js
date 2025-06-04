// login.js
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();

  const username = e.target.username.value.trim();
  const password = e.target.password.value.trim();
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      errorEl.textContent = data.message || 'Erro no login';
      return;
    }

    localStorage.setItem('logado', 'true');
    localStorage.setItem('username', username);
    window.location.href = 'home.html';
  } catch (err) {
    errorEl.textContent = 'Erro de conexão com o servidor.';
  }
});
