let popularity = 50;
let influence = 50;
let military = 50;
let wealth = 50;

let chapters = {};
let endings = {};
let visitedChapters = [];  // Armazenar os capítulos já visitados
let unlockedEndings = [];  // Armazenar os finais já desbloqueados
let currentChapter = 1;  // Variável para controlar o capítulo atual

// Carregar os capítulos do JSON
function loadChapters() {
    fetch('history.json')
        .then(response => response.json())
        .then(data => {
            chapters = data.chapters;  
            endings = data.endings;  
            loadChapter(currentChapter);  // Iniciar no capítulo atual
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

    document.querySelector('#popularity-bar .stat-bar-inner').style.width = popularity + '%';
    document.querySelector('#influence-bar .stat-bar-inner').style.width = influence + '%';
    document.querySelector('#military-bar .stat-bar-inner').style.width = military + '%';
    document.querySelector('#wealth-bar .stat-bar-inner').style.width = wealth + '%';
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

    // Verificar se todos os finais foram desbloqueados
    if (unlockedEndings.length === endings.length) {
        // Se todos os finais foram desbloqueados, mostrar a tela de fim de jogo
        const endGameButton = document.createElement('button');
        endGameButton.innerText = "Fim do Jogo";
        endGameButton.onclick = showEndScreen;  // Mostrar tela de fim de jogo
        document.getElementById('choices').appendChild(endGameButton);
    } else {
        // Adicionar o botão "Jogar Novamente" ou "Continuar"
        const playAgainButton = document.createElement('button');
        playAgainButton.innerText = "Jogar Novamente";
        playAgainButton.onclick = resetGame;  
        document.getElementById('choices').appendChild(playAgainButton);
    }
}

// Mostrar a tela de fim de jogo
function showEndScreen() {
    document.getElementById('tabs').style.display = 'none';  // Esconder as abas do jogo
    const gameOverDiv = document.createElement('div');
    gameOverDiv.id = 'endScreen';
    gameOverDiv.innerHTML = `
        <h2>Parabéns!</h2>
        <p>Você desbloqueou todos os finais de Lorenzo.</p>
        <p>Ao longo da jornada, você tomou decisões que moldaram o destino de Florença e seu príncipe, Lorenzo. Cada escolha representou um equilíbrio entre poder, responsabilidade e compaixão, refletindo os desafios enfrentados por governantes de todos os tempos.</p>
        <h3>Sobre os Finais:</h3>
        <ul>
            <li><strong>O Regime de Ferro</strong>: Um final onde Lorenzo decidiu manter o poder absoluto, sacrificando a paz e a satisfação popular para garantir a ordem e a força militar.</li>
            <li><strong>A Revolução Vitoriosa</strong>: Um final que representou a escolha de Lorenzo por compartilhar o poder e promover o bem-estar geral, com Florença prosperando graças ao apoio popular.</li>
            <li><strong>Conspiração Desmantelada</strong>: Um final onde Lorenzo, com sua habilidade política, desmantelou conspirações e manteve a ordem interna, demonstrando sua habilidade para lidar com ameaças ao seu governo.</li>
            <li><strong>A Era da Expansão</strong>: Um final de equilíbrio entre força militar e prosperidade econômica, onde Florença se tornou um centro de poder e respeito na região, temida por seus inimigos e respeitada por seus aliados.</li>
            <li><strong>Riqueza Sombria</strong>: Um final em que Lorenzo escolheu priorizar as riquezas de Florença, mas ao custo de alianças duvidosas e um futuro incerto para o principado.</li>
            <li><strong>Comércio Legalizado</strong>: Um final onde Lorenzo abandonou o controle sobre o mercado negro, optando por uma Florença mais justa e segura através da legalização do comércio.</li>
        </ul>
        <p>Agradecemos por jogar <strong>A Aventura do Príncipe de Florença</strong>. Suas escolhas trouxeram à tona os dilemas da liderança e mostraram como o poder pode moldar o destino de um governante e de seu povo. Esperamos que tenha gostado da experiência!</p>
        <button onclick="location.reload()">Jogar Novamente</button>
    `;
    document.body.appendChild(gameOverDiv);
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
    currentChapter = chapterId;  // Atualizar o capítulo atual
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
    currentChapter = 1;  // Resetar o capítulo atual

    document.getElementById('popularity').innerText = popularity;
    document.getElementById('influence').innerText = influence;
    document.getElementById('military').innerText = military;
    document.getElementById('wealth').innerText = wealth;

    document.querySelector('#popularity-bar .stat-bar-inner').style.width = popularity + '%';
    document.querySelector('#influence-bar .stat-bar-inner').style.width = influence + '%';
    document.querySelector('#military-bar .stat-bar-inner').style.width = military + '%';
    document.querySelector('#wealth-bar .stat-bar-inner').style.width = wealth + '%';

    document.getElementById('endScreen')?.remove();  // Remover a tela de fim de jogo
    document.getElementById('tabs').style.display = 'block';  // Mostrar as abas do jogo
    loadChapter(1);  // Recarregar o primeiro capítulo
}

// Carregar os capítulos ao carregar a página
window.onload = () => {
    loadChapters(); 
};

// Alternar entre abas
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    // Ocultar todo o conteúdo das abas
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remover a classe 'active' de todos os botões de abas
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Mostrar o conteúdo da aba atual e adicionar a classe 'active' ao botão que abriu a aba
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Função para iniciar o jogo
function startGame() {
    document.getElementById("startScreen").style.display = "none";  // Esconder tela de início
    document.getElementById("tabs").style.display = "block";  // Mostrar as abas do jogo
    document.getElementById("defaultOpen").click();  // Abrir a aba 'História' por padrão
}
