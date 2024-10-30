let popularity = 50;
let influence = 50;
let military = 50;
let wealth = 50;

let chapters = {};
let endings = {};
let visitedChapters = [];
let unlockedEndings = [];
let currentChapter = 1;

function loadChapters() {
    fetch('history.json')
        .then(response => response.json())
        .then(data => {
            chapters = data.chapters;  
            endings = data.endings;  
            loadChapter(currentChapter);
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));
}

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

    document.getElementById('popularity').innerText = popularity;
    document.getElementById('influence').innerText = influence;
    document.getElementById('military').innerText = military;
    document.getElementById('wealth').innerText = wealth;

    document.querySelector('#popularity-bar .stat-bar-inner').style.width = popularity + '%';
    document.querySelector('#influence-bar .stat-bar-inner').style.width = influence + '%';
    document.querySelector('#military-bar .stat-bar-inner').style.width = military + '%';
    document.querySelector('#wealth-bar .stat-bar-inner').style.width = wealth + '%';
}

function showEnding() {
    let finalEnding = determineEnding();

    if (!unlockedEndings.includes(finalEnding.id)) {
        unlockedEndings.push(finalEnding.id);  
        updateUnlockedEndings();
    }

    document.getElementById('chapterTitle').innerText = finalEnding.title;
    document.getElementById('chapterText').innerText = finalEnding.text;
    document.getElementById('choices').innerHTML = '';  

    if (unlockedEndings.length === endings.length) {
        const endGameButton = document.createElement('button');
        endGameButton.innerText = "Fim do Jogo";
        endGameButton.onclick = showEndScreen;
        document.getElementById('choices').appendChild(endGameButton);
    } else {
        const playAgainButton = document.createElement('button');
        playAgainButton.innerText = "Jogar Novamente";
        playAgainButton.onclick = resetGame;  
        document.getElementById('choices').appendChild(playAgainButton);
    }
}

function showEndScreen() {
    document.getElementById('tabs').style.display = 'none';
    const gameOverDiv = document.createElement('div');
    gameOverDiv.id = 'endScreen';
    gameOverDiv.innerHTML = `
        <h2>Parabéns!</h2>
        <p>Você desbloqueou todos os finais de Lorenzo.</p>
        <p>Ao longo da jornada, você tomou decisões que moldaram o destino de Florença e seu príncipe, Lorenzo.</p>
        <button onclick="location.reload()">Jogar Novamente</button>
    `;
    document.body.appendChild(gameOverDiv);
    document.getElementById("game").style.display = "none";
}

function determineEnding() {
    let finalEnding;

    // Condições baseadas nas métricas para determinar o final

    if (popularity >= 70 && influence >= 70 && military >= 50 && wealth >= 50) {
        finalEnding = endings.find(end => end.id === 1);  // A Revolução Vitoriosa
    } else if (military >= 80 && influence >= 60 && popularity < 50 && wealth < 50) {
        finalEnding = endings.find(end => end.id === 2);  // O Regime de Ferro
    } else if (wealth >= 80 && popularity < 50 && influence >= 60 && military >= 40) {
        finalEnding = endings.find(end => end.id === 5);  // Riqueza Sombria
    } else if (military >= 60 && wealth >= 60 && popularity >= 40 && influence >= 40) {
        finalEnding = endings.find(end => end.id === 4);  // A Era da Expansão
    } else if (influence >= 70 && popularity < 50 && wealth >= 50 && military >= 40) {
        finalEnding = endings.find(end => end.id === 3);  // Conspiração Desmantelada
    } else if (wealth >= 70 && popularity >= 60 && influence >= 60 && military >= 50) {
        finalEnding = endings.find(end => end.id === 7);  // Prosperidade e Estabilidade
    } else if (military >= 70 && influence < 50 && popularity >= 40 && wealth >= 40) {
        finalEnding = endings.find(end => end.id === 8);  // Domínio Militar
    } else if (influence >= 80 && popularity >= 60 && military >= 50 && wealth >= 50) {
        finalEnding = endings.find(end => end.id === 9);  // Alianças Estratégicas Fortalecidas
    } else if (popularity >= 80 && wealth >= 70 && influence >= 50 && military >= 40) {
        finalEnding = endings.find(end => end.id === 10); // Reconstrução Harmoniosa
    } else if (influence >= 80 && military >= 70 && popularity < 50 && wealth >= 40) {
        finalEnding = endings.find(end => end.id === 11); // Domínio Espião
    } else if (wealth >= 60 && popularity >= 60 && influence >= 50 && military >= 40) {
        finalEnding = endings.find(end => end.id === 6);  // Comércio Legalizado
    } else {
        finalEnding = endings.find(end => end.id === 12);  // Um Fim Modesto (novo final padrão)
    }


    return finalEnding;
}


function loadChapter(chapterId) {
    currentChapter = chapterId;

    // Verifica se o capítulo já foi visitado e, se sim, vai direto para o final
    if (visitedChapters.includes(chapterId)) {
        showEnding();
        return;
    }

    visitedChapters.push(chapterId);
    const chapter = chapters.find(chap => chap.id === chapterId);

    // Atualiza o título e o texto do capítulo
    document.getElementById('chapterTitle').innerText = chapter.title;
    document.getElementById('chapterText').innerText = chapter.text;

    // Exibe a imagem do capítulo, se disponível
    if (chapter.image) {
        document.getElementById('chapterImage').src = chapter.image;
        document.getElementById('chapterImage').style.display = 'block';
    } else {
        document.getElementById('chapterImage').style.display = 'none';
    }

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';  // Limpa as escolhas anteriores

    // Cria os botões de escolha do capítulo atual
    chapter.choices.forEach(choice => {
        const button = document.createElement('button');
        button.innerText = choice.text;
        button.onclick = () => {
            updateStats(choice.effects);  // Atualiza as métricas com base na escolha

            // Atualiza o texto do capítulo com o histórico da decisão
            document.getElementById('chapterText').innerText = choice.history;

            // Remove o botão de escolha anterior para evitar cliques múltiplos
            choicesDiv.innerHTML = '';  

            // Verifica se o nextChapter é 0 e vai direto ao final
            if (choice.nextChapter === 0) {
                showEnding();  // Vai direto para o final do jogo
            } else {
                // Cria o botão "Continuar" para seguir para o próximo capítulo ou final
                const continueButton = document.createElement('button');
                continueButton.innerText = "Continuar";
                continueButton.onclick = () => {
                    loadChapter(choice.nextChapter);  // Carrega o próximo capítulo
                };
                choicesDiv.appendChild(continueButton);
            }
        };
        choicesDiv.appendChild(button);
    });
}



function updateUnlockedEndings() {
    const unlockedEndingsDiv = document.getElementById('unlockedEndings');
    unlockedEndingsDiv.innerHTML = '';

    unlockedEndings.forEach(endingId => {
        const ending = endings.find(end => end.id === endingId);
        const endingElement = document.createElement('p');
        endingElement.innerText = `${ending.title}: ${ending.text}`;
        unlockedEndingsDiv.appendChild(endingElement);
    });
}

function resetGame() {
    popularity = 50;
    influence = 50;
    military = 50;
    wealth = 50;
    visitedChapters = [];
    currentChapter = 1;

    document.getElementById('popularity').innerText = popularity;
    document.getElementById('influence').innerText = influence;
    document.getElementById('military').innerText = military;
    document.getElementById('wealth').innerText = wealth;

    document.querySelector('#popularity-bar .stat-bar-inner').style.width = popularity + '%';
    document.querySelector('#influence-bar .stat-bar-inner').style.width = influence + '%';
    document.querySelector('#military-bar .stat-bar-inner').style.width = military + '%';
    document.querySelector('#wealth-bar .stat-bar-inner').style.width = wealth + '%';

    document.getElementById('endScreen')?.remove();
    document.getElementById('tabs').style.display = 'block';
    loadChapter(1);
}

window.onload = () => {
    loadChapters();
};

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("tabs").style.display = "block";
    document.getElementById("defaultOpen").click();
}
