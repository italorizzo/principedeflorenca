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
