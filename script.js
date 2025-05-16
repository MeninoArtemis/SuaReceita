const input = document.querySelector('.pesquisa-input');
const form = document.querySelector('.pesquisa-form');
const listaDeReceitas = document.querySelector('.lista-receitas');
const detalhesDaReceita = document.querySelector('.receita-detalhada');

let receitasAtuais =[]
let paginaAtual = []
const receitasPorPagina = 10;

form.addEventListener('submit', function (event) {
    event.preventDefault();
    const inputValue = event.target[0].value.trim();

    if (inputValue) {
        pesquisaReceita(inputValue);
    } else {
        listaDeReceitas.innerHTML = '<p>Digite um ingrediente para buscar receitas.</p>';
    }
});

async function pesquisaReceita(ingrediente) {
    try {
        const resposta = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingrediente}`);
        const data = await resposta.json();

        if (data.meals) {
            mostraReceitas(data.meals);
        } else {
            listaDeReceitas.innerHTML = `<p>Nenhuma receita encontrada para "<strong>${ingrediente}</strong>".</p>`;
        }
    } catch (error) {
        listaDeReceitas.innerHTML = '<p>Ocorreu um erro ao buscar as receitas. Tente novamente.</p>';
        console.error('Erro na requisição:', error);
    }
}

function mostraReceitas(receitas, pagina = 1) {
    receitasAtuais = receitas;
    paginaAtual = pagina;

    const inicio = (pagina - 1) * receitasPorPagina;
    const fim = inicio + receitasPorPagina;
    const receitasPaginadas = receitas.slice(inicio, fim);

    listaDeReceitas.innerHTML = receitasPaginadas.map((item) => `
        <div class="card" onclick="getReceitaDetalhes(${item.idMeal})">
            <img src="${item.strMealThumb}" alt="${item.strMeal}" />
            <h1>${item.strMeal}</h1>
        </div>
    `).join('');

    renderizaPaginacao();
}

function renderizaPaginacao() {
    const paginacaoContainer = document.createElement("div");
    paginacaoContainer.className = "paginacao"

    const totalPaginas = Math.ceil(receitasAtuais.length / receitasPorPagina);

    // Botão "Anterior
    const btnPrev = document.createElement("button");
    btnPrev.textContent = "Previous"
    btnPrev.disabled = paginaAtual === 1;
    btnPrev.onclick = () => mostraReceitas(receitasAtuais, paginaAtual - 1);
    paginacaoContainer.appendChild(btnPrev);


    // Botões de Página
    const criarBotao = (num) => {
        const btn = document.createElement("button");
        btn.textContent = num;
        if (num === paginaAtual) btn.style.backgroundColor = "#ff6a28";
        btn.onclick = () => mostraReceitas(receitasAtuais, num);
        paginacaoContainer.appendChild(btn);
    };

    if (totalPaginas <= 7) {
        for (let i = 1; i <= totalPaginas; i++) criarBotao(i);

    } else {
        criarBotao(1);
        if (paginaAtual > 3) paginacaoContainer.appendChild(document.createTextNode("..."));

        const start = Math.max(2, paginaAtual - 1);
        const end = Math.min(totalPaginas - 1, paginaAtual +1);
        for (let i = start; i <= end; i++) criarBotao(i);

        if (paginaAtual < totalPaginas - 2) paginacaoContainer.appendChild(document.createTextNode("..."));
        criarBotao(totalPaginas);
    }

    // Botão Próximo
    const btnNext = document.createElement("button");
    btnNext.textContent = "Next";
    btnNext.disabled = paginaAtual === totalPaginas;
    btnNext.onclick = () => mostraReceitas(receitasAtuais, paginaAtual + 1);
    paginacaoContainer.appendChild(btnNext);

    listaDeReceitas.appendChild(paginacaoContainer);    
}

async function getReceitaDetalhes(id) {
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
            <textarea placeholder="Deixe seu comentário..."></textarea>
            <button>Enviar Comentário</button>
            </div>   
        `;
         detalhesDaReceita.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        detalhesDaReceita.innerHTML = '<p>Erro ao carregar os detalhes da receita.</p>';
        console.error('Erro nos detalhes:', error);
    }
}
const loading = document.querySelector('.loading');
document.querySelector(".loading").style.display = "block"; // aparecer loading ao buscar ou carregar
document.querySelector(".loading").style.display = "none";

async function carregarPorCategoria(categoria) {
    const resposta = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`);
    const data = await resposta.json();
    mostraReceitas(data.meals);
  }
  
  window.onload = () => carregarPorCategoria('Beef');