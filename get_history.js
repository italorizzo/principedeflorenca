let popularity = 50;
let influence = 50;
let military = 50;
let wealth = 50;

let chapters = {};
let endings = {};
let visitedChapters = [];
let unlockedEndings = [];
let currentChapter = 1;
let lastEnt = null;  // Variável para armazenar o 'ent' da última escolha

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
    
    // Combina o texto do final com o parágrafo adicional
    let additionalParagraph = generateAdditionalParagraph();
    document.getElementById('chapterText').innerHTML = `<p>${finalEnding.text}</p><p>${additionalParagraph}</p>`;
    
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

function generateAdditionalParagraph() {
    let paragraph = "";

    if (popularity >= 80) {
        paragraph += "O povo celebra sua liderança, cantando canções em sua homenagem e transmitindo histórias de sua benevolência para as próximas gerações. ";
    } else if (popularity <= 20) {
        paragraph += "O descontentamento do povo é palpável, e murmúrios de rebelião ecoam nas ruas de Florença. ";
    }

    if (influence >= 80) {
        paragraph += "Sua influência política se estende além das fronteiras, tornando-se um dos líderes mais respeitados da região. ";
    } else if (influence <= 20) {
        paragraph += "Sua falta de influência deixa Florença isolada, sem aliados confiáveis em tempos de necessidade. ";
    }

    if (military >= 80) {
        paragraph += "Com um exército formidável, nenhuma ameaça é grande o suficiente para abalar a segurança de seu principado. ";
    } else if (military <= 20) {
        paragraph += "A fraqueza militar de Florença atrai invasores, e a proteção de seu povo está constantemente em risco. ";
    }

    if (wealth >= 80) {
        paragraph += "A prosperidade econômica é evidente; os mercados estão cheios e os cofres reais transbordam de riquezas. ";
    } else if (wealth <= 20) {
        paragraph += "A pobreza assola o principado, e os recursos escassos tornam a sobrevivência diária um desafio para muitos. ";
    }

    if (paragraph === "") {
        paragraph = "Apesar dos desafios, sua liderança manteve Florença estável, navegando entre altos e baixos com resiliência.";
    }

    return paragraph;
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
    // Utiliza o 'ent' da última escolha para determinar o final
    return endings.find(end => end.id === lastEnt) || endings.find(end => end.id === 12);  // Se não encontrar, retorna o final padrão (id 12)
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

            // Armazena o 'ent' da escolha feita
            lastEnt = choice.ent;

            // Remove o botão de escolha anterior para evitar cliques múltiplos
            choicesDiv.innerHTML = '';  

            // Verifica se o nextChapter é 0 ou se nextEnding está definido para ir direto ao final
            if (choice.nextChapter === 0 || choice.nextEnding !== undefined) {
                if (choice.nextEnding !== undefined) {
                    lastEnt = choice.nextEnding;  // Atualiza o 'ent' para o final especificado
                }
                showEnding();  // Vai direto para o final do jogo
            } else {
                // Cria o botão "Continuar" para seguir para o próximo capítulo
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
    lastEnt = null;

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
