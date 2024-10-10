// Variáveis de status
let popularity = 50;
let influence = 50;
let military = 50;
let wealth = 50;

// Capítulos e finais carregados do JSON
let chapters = {};
let endings = {};
let visitedChapters = [];  // Armazenar os capítulos já visitados
let unlockedEndings = [];  // Armazenar os finais já desbloqueados

// Função para carregar os capítulos e finais do JSON
function loadChapters() {
    fetch('history.json')  // Certifique-se que o JSON esteja na mesma pasta do script
        .then(response => response.json())
        .then(data => {
            chapters = data.chapters;  // Guardando os capítulos carregados do JSON
            endings = data.endings;  // Guardando os finais carregados do JSON
            loadChapter(1);  // Inicia o jogo no capítulo 1
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));
}

// Função para atualizar os status
function updateStats(effects) {
    if (effects.popularity) {
        popularity = Math.min(Math.max(popularity + effects.popularity, 0), 100);
    }
    if (effects.influence) {
        influence = Math.min(Math.max(influence + effects.influence, 0), 100);
    }
    if (effects.military) {
        military = Math.min(Math.max(military + effects.military, 0), 100);
    }
    if (effects.wealth) {
        wealth = Math.min(Math.max(wealth + effects.wealth, 0), 100);
    }

    // Atualizando os valores de status na interface
    document.getElementById('popularity').innerText = popularity;
    document.getElementById('influence').innerText = influence;
    document.getElementById('military').innerText = military;
    document.getElementById('wealth').innerText = wealth;
}

// Função para mostrar o final com base na pontuação e exibir o botão "Jogar Novamente"
function showEnding() {
    let finalEnding;

    if (popularity > 70 && influence > 70) {
        finalEnding = endings.find(end => end.id === 1);  // Fim para um príncipe amado e influente
    } else if (military > 70) {
        finalEnding = endings.find(end => end.id === 2);  // Fim para um regime de ferro com força militar
    } else if (influence > 50) {
        finalEnding = endings.find(end => end.id === 3);  // Fim para alguém que desmantelou conspirações
    } else if (popularity < 50 && wealth > 70) {
        finalEnding = endings.find(end => end.id === 5);  // Fim com riquezas sombrias
    } else {
        finalEnding = endings.find(end => end.id === 6);  // Fim para um comércio legalizado
    }

    // Verificar se o final já foi desbloqueado
    if (!unlockedEndings.includes(finalEnding.id)) {
        unlockedEndings.push(finalEnding.id);  // Adicionar à lista de finais desbloqueados
        updateUnlockedEndings();  // Atualizar a exibição dos finais desbloqueados
    }

    // Exibir o final na tela
    document.getElementById('chapterTitle').innerText = finalEnding.title;
    document.getElementById('chapterText').innerText = finalEnding.text;
    document.getElementById('choices').innerHTML = '';  // Limpar as escolhas após o final

    // Adicionar o botão "Jogar Novamente"
    const playAgainButton = document.createElement('button');
    playAgainButton.innerText = "Jogar Novamente";
    playAgainButton.onclick = resetGame;  // Chama a função para reiniciar o jogo
    document.getElementById('choices').appendChild(playAgainButton);
}

// Função para carregar o capítulo
function loadChapter(chapterId) {
    // Verifica se o capítulo já foi visitado
    if (visitedChapters.includes(chapterId)) {
        showEnding();  // Se já foi visitado, mostrar o ending
        return;
    }
    
    visitedChapters.push(chapterId);  // Adiciona o capítulo ao histórico de visitados
    const chapter = chapters.find(chap => chap.id === chapterId);  // Encontrar o capítulo pelo ID
    document.getElementById('chapterTitle').innerText = chapter.title;
    document.getElementById('chapterText').innerText = chapter.text;

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';  // Limpar as escolhas anteriores

    chapter.choices.forEach(choice => {
        const button = document.createElement('button');
        button.innerText = choice.text;
        button.onclick = () => {
            // Verifica se o próximo capítulo já foi visitado
            if (visitedChapters.includes(choice.nextChapter)) {
                showEnding();  // Se o próximo capítulo já foi visitado, mostrar o ending
            } else {
                updateStats(choice.effects);  // Atualizar os status com base nos efeitos
                loadChapter(choice.nextChapter);  // Carregar o próximo capítulo
            }
        };
        choicesDiv.appendChild(button);
    });
}

// Função para atualizar a lista de finais desbloqueados na aba "Finais Desbloqueados"
function updateUnlockedEndings() {
    const unlockedEndingsDiv = document.getElementById('unlockedEndings');
    unlockedEndingsDiv.innerHTML = '';  // Limpa a lista de finais desbloqueados

    unlockedEndings.forEach(endingId => {
        const ending = endings.find(end => end.id === endingId);
        const endingElement = document.createElement('p');
        endingElement.innerText = `${ending.title}: ${ending.text}`;
        unlockedEndingsDiv.appendChild(endingElement);
    });
}

// Função para reiniciar o jogo e os status
function resetGame() {
    popularity = 50;
    influence = 50;
    military = 50;
    wealth = 50;
    visitedChapters = [];  // Resetar capítulos visitados

    // Resetar os valores de status na interface
    document.getElementById('popularity').innerText = popularity;
    document.getElementById('influence').innerText = influence;
    document.getElementById('military').innerText = military;
    document.getElementById('wealth').innerText = wealth;

    loadChapter(1);  // Recomeçar do capítulo 1
}

// Inicializar o jogo ao carregar a página
window.onload = () => {
    loadChapters();  // Carregar os capítulos do JSON
};
