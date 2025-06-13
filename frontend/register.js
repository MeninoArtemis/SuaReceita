// register.js
document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const username = form.querySelector('[name="username"]').value.trim();
  const password = form.querySelector('[name="password"]').value.trim();
  const errorEl = document.getElementById('register-error');
  errorEl.textContent = '';
  if (!username || !password) {
    errorEl.textContent = 'Usuário e senha são obrigatórios.';
    return;
  }
  try {
    const res = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.textContent = data.message || 'Erro no cadastro.';
      return;
    }
    alert('Cadastro realizado com sucesso! Faça login.');
    window.location.href = 'login.html';
  } catch (err) {
    console.error(err);
    errorEl.textContent = 'Erro de conexão com o servidor.';
  }
});