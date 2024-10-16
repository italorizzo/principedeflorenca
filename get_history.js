let popularity = 50;
let influence = 50;
let military = 50;
let wealth = 50;

let chapters = {};
let endings = {};
let visitedChapters = [];  // Armazenar os capítulos já visitados
let unlockedEndings = [];  // Armazenar os finais já desbloqueados

// Carregar os capítulos do JSON
function loadChapters() {
    fetch('history.json')
        .then(response => response.json())
        .then(data => {
            chapters = data.chapters;  
            endings = data.endings;  
            loadChapter(1);  // Iniciar no capítulo 1
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));
}

// Atualizar as métricas do jogo
function updateStats(effects) {
    if (effects.popularity !== undefined) {
        popularity = Math.min(Math.max(popularity + effects.popularity, 0), 100);
    }
    if (effects.influence !== undefined) {
        influence = Math.min(Math.max(influence + effects.influence, 0), 100);
    }
    if (effects.military !== undefined) {
        military = Math.min(Math.max(military + effects.military, 0), 100);
    }
    if (effects.wealth !== undefined) {
        wealth = Math.min(Math.max(wealth + effects.wealth, 0), 100);
    }

    // Atualizar a interface com os novos valores
    document.getElementById('popularity').innerText = popularity;
    document.getElementById('influence').innerText = influence;
    document.getElementById('military').innerText = military;
    document.getElementById('wealth').innerText = wealth;
}

// Verificar e mostrar o final desbloqueado
function showEnding() {
    let finalEnding = determineEnding();

    // Verificar se o final já foi desbloqueado
    if (!unlockedEndings.includes(finalEnding.id)) {
        unlockedEndings.push(finalEnding.id);  
        updateUnlockedEndings();  // Atualizar a lista de finais desbloqueados
    }

    // Mostrar o final na interface
    document.getElementById('chapterTitle').innerText = finalEnding.title;
    document.getElementById('chapterText').innerText = finalEnding.text;
    document.getElementById('choices').innerHTML = '';  

    // Adicionar o botão "Jogar Novamente"
    const playAgainButton = document.createElement('button');
    playAgainButton.innerText = "Jogar Novamente";
    playAgainButton.onclick = resetGame;  
    document.getElementById('choices').appendChild(playAgainButton);
}

// Função para determinar o final baseado nas pontuações
function determineEnding() {
    let finalEnding;
    
    // Verificar cada condição para os finais e pular finais já desbloqueados
    if (popularity >= 50 && influence >= 50) {
        finalEnding = getNextAvailableEnding(1);  // Fim para um príncipe amado e influente
    } else if (military >= 50 && popularity < 50) {
        finalEnding = getNextAvailableEnding(2);  // Fim para um regime de ferro com força militar
    } else if (influence > 45 && popularity < 50) {
        finalEnding = getNextAvailableEnding(3);  // Fim para alguém que desmantelou conspirações
    } else if (military >= 40 && wealth >= 40) {
        finalEnding = getNextAvailableEnding(4);  // Fim para uma era de expansão econômica e militar
    } else if (popularity < 45 && wealth >= 50) {
        finalEnding = getNextAvailableEnding(5);  // Fim com riquezas sombrias
    } else {
        finalEnding = getNextAvailableEnding(6);  // Fim para um comércio legalizado
    }

    return finalEnding;
}

// Função auxiliar para verificar se o final já foi desbloqueado e pegar o próximo disponível
function getNextAvailableEnding(endId) {
    if (!unlockedEndings.includes(endId)) {
        return endings.find(end => end.id === endId);
    } else {
        // Se o final já foi desbloqueado, escolher o próximo final disponível
        for (let i = 1; i <= endings.length; i++) {
            if (!unlockedEndings.includes(i)) {
                return endings.find(end => end.id === i);
            }
        }
    }
}

// Carregar o capítulo com base no ID fornecido
function loadChapter(chapterId) {
    if (visitedChapters.includes(chapterId)) {
        showEnding();  // Mostrar final se o capítulo já foi visitado
        return;
    }
    
    visitedChapters.push(chapterId);  // Marcar o capítulo como visitado
    const chapter = chapters.find(chap => chap.id === chapterId);  // Encontrar o capítulo no JSON
    document.getElementById('chapterTitle').innerText = chapter.title;
    document.getElementById('chapterText').innerText = chapter.text;

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';  // Limpar as escolhas anteriores

    // Exibir escolhas do capítulo atual
    chapter.choices.forEach(choice => {
        const button = document.createElement('button');
        button.innerText = choice.text;
        button.onclick = () => {
            updateStats(choice.effects);  // Atualizar as métricas com base nos efeitos da escolha

            // Mostrar o histórico da decisão
            document.getElementById('chapterText').innerText = choice.history;

            // Adicionar botão "Continuar" para ir ao próximo capítulo
            choicesDiv.innerHTML = '';  // Limpar as escolhas anteriores
            const continueButton = document.createElement('button');
            continueButton.innerText = "Continuar";
            continueButton.onclick = () => {
                loadChapter(choice.nextChapter);  // Carregar o próximo capítulo
            };
            choicesDiv.appendChild(continueButton);
        };
        choicesDiv.appendChild(button);
    });
}

// Atualizar a lista de finais desbloqueados na interface
function updateUnlockedEndings() {
    const unlockedEndingsDiv = document.getElementById('unlockedEndings');
    unlockedEndingsDiv.innerHTML = '';  // Limpar os finais anteriores

    unlockedEndings.forEach(endingId => {
        const ending = endings.find(end => end.id === endingId);
        const endingElement = document.createElement('p');
        endingElement.innerText = `${ending.title}: ${ending.text}`;
        unlockedEndingsDiv.appendChild(endingElement);
    });
}

// Reiniciar o jogo
function resetGame() {
    popularity = 50;
    influence = 50;
    military = 50;
    wealth = 50;
    visitedChapters = [];  // Resetar capítulos visitados

    document.getElementById('popularity').innerText = popularity;
    document.getElementById('influence').innerText = influence;
    document.getElementById('military').innerText = military;
    document.getElementById('wealth').innerText = wealth;

    loadChapter(1);  // Recarregar o primeiro capítulo
}

// Carregar os capítulos ao carregar a página
window.onload = () => {
    loadChapters(); 
};
