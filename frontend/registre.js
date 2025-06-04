// register.js
document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();

  const username = e.target.username.value.trim();
  const password = e.target.password.value.trim();
  const errorEl = document.getElementById('register-error');
  errorEl.textContent = '';

  try {
    const res = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || 'Erro no cadastro';
      return;
    }

    alert('Cadastro realizado com sucesso! Faça login.');
    window.location.href = 'index.html';
  } catch (err) {
    errorEl.textContent = 'Erro de conexão com o servidor.';
  }
});
