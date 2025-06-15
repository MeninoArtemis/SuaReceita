if (localStorage.getItem('logado') !== 'true') {
  window.location.href = 'index.html';
}

const username = localStorage.getItem('username');

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const listaDeReceitas = document.querySelector('.lista-receitas');
const detalhesDaReceita = document.querySelector('.receita-detalhada');
const loading = document.querySelector('.loading');

let receitasAtuais = [];
let paginaAtual = 1;
const receitasPorPagina = 10;

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const ingrediente = searchInput.value.trim();
  if (ingrediente) {
    pesquisaReceita(ingrediente);
  }
});

document.querySelectorAll('.categorias button').forEach(btn => {
  btn.addEventListener('click', () => {
    const categoria = btn.getAttribute('data-categoria');
    carregarPorCategoria(categoria);
  });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('logado');
  localStorage.removeItem('username');
  window.location.href = 'index.html';
});

async function pesquisaReceita(ingrediente) {
  loading.style.display = 'block';
  try {
    const resposta = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingrediente}`);
    const data = await resposta.json();

    if (data.meals) {
      mostraReceitas(data.meals);
    } else {
      listaDeReceitas.innerHTML = `<p>Nenhuma receita encontrada para "<strong>${ingrediente}</strong>".</p>`;
    }
  } catch (error) {
    listaDeReceitas.innerHTML = '<p>Erro ao buscar as receitas.</p>';
  }
  loading.style.display = 'none';
}

function mostraReceitas(receitas, pagina = 1) {
  receitasAtuais = receitas;
  paginaAtual = pagina;

  const inicio = (pagina - 1) * receitasPorPagina;
  const fim = inicio + receitasPorPagina;
  const receitasPaginadas = receitas.slice(inicio, fim);

  listaDeReceitas.innerHTML = receitasPaginadas
    .map(
      item => `
    <div class="card" onclick="getReceitaDetalhes('${item.idMeal}')">
      <img src="${item.strMealThumb}" alt="${item.strMeal}" />
      <h1>${item.strMeal}</h1>
    </div>
  `
    )
    .join('');

  renderizaPaginacao();
}

function renderizaPaginacao() {
  const paginacaoContainer = document.createElement('div');
  paginacaoContainer.className = 'paginacao';

  const totalPaginas = Math.ceil(receitasAtuais.length / receitasPorPagina);

  const btnPrev = document.createElement('button');
  btnPrev.textContent = 'Previous';
  btnPrev.disabled = paginaAtual === 1;
  btnPrev.onclick = () => mostraReceitas(receitasAtuais, paginaAtual - 1);
  paginacaoContainer.appendChild(btnPrev);

  const criarBotao = num => {
    const btn = document.createElement('button');
    btn.textContent = num;
    if (num === paginaAtual) btn.style.backgroundColor = '#ff6a28';
    btn.onclick = () => mostraReceitas(receitasAtuais, num);
    paginacaoContainer.appendChild(btn);
  };

  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) criarBotao(i);
  } else {
    criarBotao(1);
    if (paginaAtual > 3) paginacaoContainer.appendChild(document.createTextNode('...'));

    const start = Math.max(2, paginaAtual - 1);
    const end = Math.min(totalPaginas - 1, paginaAtual + 1);
    for (let i = start; i <= end; i++) criarBotao(i);

    if (paginaAtual < totalPaginas - 2) paginacaoContainer.appendChild(document.createTextNode('...'));
    criarBotao(totalPaginas);
  }

  const btnNext = document.createElement('button');
  btnNext.textContent = 'Next';
  btnNext.disabled = paginaAtual === totalPaginas;
  btnNext.onclick = () => mostraReceitas(receitasAtuais, paginaAtual + 1);
  paginacaoContainer.appendChild(btnNext);

  listaDeReceitas.appendChild(paginacaoContainer);
}

async function getReceitaDetalhes(id) {
  loading.style.display = 'block';
  try {
    const resposta = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await resposta.json();
    const receita = data.meals[0];

    let ingredientes = '';
    for (let i = 1; i <= 20; i++) {
      if (receita[`strIngredient${i}`]) {
        ingredientes += `<li>${receita[`strIngredient${i}`]} - ${receita[`strMeasure${i}`]}</li>`;
      } else {
        break;
      }
    }

    const comentariosRes = await fetch(`http://localhost:3000/api/comments/${id}`);
    const comentarios = await comentariosRes.json();

    const comentariosHtml = comentarios
      .map(
        (c, index) => `
        <div class="comentario">
          <p><strong>${c.username}</strong> (${new Date(c.date).toLocaleString()}):</p>
          <p id="texto-comentario-${index}">${c.text}</p>
          ${c.username === username ? `
            <button onclick="editarComentario('${id}', ${index})">Editar</button>
            <button onclick="deletarComentario('${id}', ${index})">Excluir</button>
          ` : ''}
        </div>
      `
      )
      .join('') || '<p>Seja o primeiro a comentar!</p>';

    detalhesDaReceita.innerHTML = `
      <h1 class="titulo-receita">${receita.strMeal}</h1>
      <img src="${receita.strMealThumb}" alt="${receita.strMeal}" class="img-receita" />
      <h3>Categoria: ${receita.strCategory}</h3>
      <h3>Origem: ${receita.strArea}</h3>
      <h3>Ingredientes:</h3>
      <ul>${ingredientes}</ul>
      <h3>Instruções:</h3>
      <p>${receita.strInstructions}</p>
      ${receita.strTags ? `<p><strong>Tags:</strong> ${receita.strTags}</p>` : ''}
      ${receita.strYoutube ? `<p><a href="${receita.strYoutube}" target="_blank">Vídeo do Preparo</a></p>` : ''}
      <div class="comentarios">
        <h3>Comentários:</h3>
        <div id="comentarios-container">${comentariosHtml}</div>
        <textarea id="comentario-texto" placeholder="Deixe seu comentário..."></textarea>
        <button id="enviar-comentario">Enviar Comentário</button>
      </div>
    `;
    detalhesDaReceita.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('enviar-comentario').onclick = async () => {
      const text = document.getElementById('comentario-texto').value.trim();
      if (!text) return alert('Digite um comentário.');

      try {
        const res = await fetch(`http://localhost:3000/api/comments/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, text }),
        });
        if (res.ok) {
          alert('Comentário enviado!');
          getReceitaDetalhes(id);
        } else {
          alert('Erro ao enviar comentário.');
        }
      } catch {
        alert('Erro de conexão ao enviar comentário.');
      }
    };
  } catch (error) {
    detalhesDaReceita.innerHTML = '<p>Erro ao carregar os detalhes da receita.</p>';
  }
  loading.style.display = 'none';
}

window.deletarComentario = async (recipeId, commentIndex) => {
  if (!confirm('Deseja realmente excluir este comentário?')) return;
  try {
    const res = await fetch(`http://localhost:3000/api/comments/${recipeId}/${commentIndex}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      alert('Comentário excluído!');
      getReceitaDetalhes(recipeId);
    } else {
      alert('Erro ao excluir comentário.');
    }
  } catch {
    alert('Erro de conexão ao excluir comentário.');
  }
};

window.editarComentario = (recipeId, commentIndex) => {
  const pTexto = document.getElementById(`texto-comentario-${commentIndex}`);
  const textoAtual = pTexto.textContent;

  // Substituir texto por textarea para edição
  pTexto.outerHTML = `
    <textarea id="textarea-editar-${commentIndex}">${textoAtual}</textarea>
    <button id="salvar-edicao-${commentIndex}">Salvar</button>
    <button id="cancelar-edicao-${commentIndex}">Cancelar</button>
  `;

  document.getElementById(`salvar-edicao-${commentIndex}`).onclick = async () => {
    const novoTexto = document.getElementById(`textarea-editar-${commentIndex}`).value.trim();
    if (!novoTexto) return alert('Comentário não pode ficar vazio.');

    try {
      const res = await fetch(`http://localhost:3000/api/comments/${recipeId}/${commentIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: novoTexto }),
      });
      if (res.ok) {
        alert('Comentário atualizado!');
        getReceitaDetalhes(recipeId);
      } else {
        alert('Erro ao atualizar comentário.');
      }
    } catch {
      alert('Erro de conexão ao atualizar comentário.');
    }
  };

  document.getElementById(`cancelar-edicao-${commentIndex}`).onclick = () => {
    getReceitaDetalhes(recipeId);
  };
};

async function carregarPorCategoria(categoria) {
  loading.style.display = 'block';
  try {
    const resposta = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`);
    const data = await resposta.json();
    mostraReceitas(data.meals);
  } catch {
    listaDeReceitas.innerHTML = '<p>Erro ao carregar receitas por categoria.</p>';
  }
  loading.style.display = 'none';
}

window.onload = () => carregarPorCategoria('Beef');
