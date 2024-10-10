let popularity = 50;
let influence = 50;
let military = 50;
let wealth = 50;

let chapters = {};
let endings = {};
let visitedChapters = [];  // Armazenar os capítulos já visitados
let unlockedEndings = [];  // Armazenar os finais já desbloqueados


function loadChapters() {
    fetch('history.json') 
        .then(response => response.json())
        .then(data => {
            chapters = data.chapters;  
            endings = data.endings;  
            loadChapter(1);  
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));
}


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

    
    document.getElementById('popularity').innerText = popularity;
    document.getElementById('influence').innerText = influence;
    document.getElementById('military').innerText = military;
    document.getElementById('wealth').innerText = wealth;
}


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


    if (!unlockedEndings.includes(finalEnding.id)) {
        unlockedEndings.push(finalEnding.id);  
        updateUnlockedEndings(); 
    }

    document.getElementById('chapterTitle').innerText = finalEnding.title;
    document.getElementById('chapterText').innerText = finalEnding.text;
    document.getElementById('choices').innerHTML = '';  

    const playAgainButton = document.createElement('button');
    playAgainButton.innerText = "Jogar Novamente";
    playAgainButton.onclick = resetGame;  
    document.getElementById('choices').appendChild(playAgainButton);
}

function loadChapter(chapterId) {
    if (visitedChapters.includes(chapterId)) {
        showEnding();  
        return;
    }
    
    visitedChapters.push(chapterId);  
    const chapter = chapters.find(chap => chap.id === chapterId);  
    document.getElementById('chapterTitle').innerText = chapter.title;
    document.getElementById('chapterText').innerText = chapter.text;

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';  

    chapter.choices.forEach(choice => {
        const button = document.createElement('button');
        button.innerText = choice.text;
        button.onclick = () => {
            if (visitedChapters.includes(choice.nextChapter)) {
                showEnding();  
            } else {
                updateStats(choice.effects);  
                loadChapter(choice.nextChapter);  
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

    document.getElementById('popularity').innerText = popularity;
    document.getElementById('influence').innerText = influence;
    document.getElementById('military').innerText = military;
    document.getElementById('wealth').innerText = wealth;

    loadChapter(1); 
}
window.onload = () => {
    loadChapters(); 
};
