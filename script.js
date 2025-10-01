// Estado global da aplicação
let gameState = {
    score: 0,
    level: 1,
    currentScreen: 'home',
    currentGame: null,
    problems: {
        addition: { num1: 0, num2: 0, answer: 0 },
        subtraction: { num1: 0, num2: 0, answer: 0 },
        multiplication: { num1: 0, num2: 0, answer: 0 }
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    updateScoreDisplay();
    showScreen('home');
});

// Função para mostrar uma tela específica
function showScreen(screenName) {
    // Esconder todas as telas
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar a tela solicitada
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        gameState.currentScreen = screenName;
    }
}

// Função para voltar à tela inicial
function goHome() {
    showScreen('home');
    updateScoreDisplay();
}

// Função para iniciar um jogo
function startGame(gameType) {
    gameState.currentGame = gameType;
    showScreen(gameType);
    generateProblem(gameType);
    updateGameScore(gameType);
    
    // Limpar feedback e botões
    const feedback = document.getElementById(gameType + '-feedback');
    const checkBtn = document.getElementById(gameType + '-check');
    const continueBtn = document.getElementById(gameType + '-continue');
    const answerInput = document.getElementById(gameType + '-answer');
    
    feedback.classList.add('hidden');
    checkBtn.style.display = 'block';
    continueBtn.classList.add('hidden');
    answerInput.value = '';
    answerInput.disabled = false;
    checkBtn.disabled = false;
}

// Função para gerar um problema matemático
function generateProblem(gameType) {
    let num1, num2;
    
    switch(gameType) {
        case 'addition':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            gameState.problems.addition = { num1, num2, answer: num1 + num2 };
            break;
            
        case 'subtraction':
            num1 = Math.floor(Math.random() * 10) + 5; // Número maior para evitar negativos
            num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // Número menor
            gameState.problems.subtraction = { num1, num2, answer: num1 - num2 };
            break;
            
        case 'multiplication':
            num1 = Math.floor(Math.random() * 5) + 2; // Números menores para multiplicação
            num2 = Math.floor(Math.random() * 5) + 2;
            gameState.problems.multiplication = { num1, num2, answer: num1 * num2 };
            break;
    }
    
    // Atualizar a interface
    document.getElementById(gameType + '-num1').textContent = gameState.problems[gameType].num1;
    document.getElementById(gameType + '-num2').textContent = gameState.problems[gameType].num2;
}

// Função para verificar a resposta
function checkAnswer(gameType) {
    const answerInput = document.getElementById(gameType + '-answer');
    const userAnswer = parseInt(answerInput.value);
    const correctAnswer = gameState.problems[gameType].answer;
    const feedback = document.getElementById(gameType + '-feedback');
    const checkBtn = document.getElementById(gameType + '-check');
    const continueBtn = document.getElementById(gameType + '-continue');
    
    if (isNaN(userAnswer)) {
        return; // Não fazer nada se não há resposta
    }
    
    feedback.classList.remove('hidden');
    
    if (userAnswer === correctAnswer) {
        // Resposta correta
        feedback.innerHTML = '<p>🎉 Parabéns! Resposta correta!</p>';
        feedback.style.background = 'rgba(40, 167, 69, 0.2)';
        
        // Adicionar pontos
        let points = gameType === 'multiplication' ? 15 : 10;
        gameState.score += points;
        updateScoreDisplay();
        updateGameScore(gameType);
        
        // Mostrar botão continuar
        checkBtn.style.display = 'none';
        continueBtn.classList.remove('hidden');
        answerInput.disabled = true;
        
        // Adicionar efeito visual
        answerInput.classList.add('pulse');
        setTimeout(() => {
            answerInput.classList.remove('pulse');
        }, 1000);
        
    } else {
        // Resposta incorreta
        feedback.innerHTML = '<p>😊 Tente novamente! Você consegue!</p>';
        feedback.style.background = 'rgba(255, 193, 7, 0.2)';
        
        // Limpar campo de resposta após um tempo
        setTimeout(() => {
            answerInput.value = '';
            feedback.classList.add('hidden');
        }, 2000);
    }
}

// Função para próximo problema
function nextProblem(gameType) {
    generateProblem(gameType);
    
    const feedback = document.getElementById(gameType + '-feedback');
    const checkBtn = document.getElementById(gameType + '-check');
    const continueBtn = document.getElementById(gameType + '-continue');
    const answerInput = document.getElementById(gameType + '-answer');
    
    feedback.classList.add('hidden');
    checkBtn.style.display = 'block';
    continueBtn.classList.add('hidden');
    answerInput.value = '';
    answerInput.disabled = false;
    checkBtn.disabled = false;
}

// Função para atualizar a pontuação na tela inicial
function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    
    if (scoreElement) scoreElement.textContent = gameState.score;
    if (levelElement) levelElement.textContent = gameState.level;
    
    // Calcular nível baseado na pontuação
    gameState.level = Math.floor(gameState.score / 50) + 1;
    if (levelElement) levelElement.textContent = gameState.level;
}

// Função para atualizar a pontuação na tela do jogo
function updateGameScore(gameType) {
    const gameScoreElement = document.getElementById(gameType + '-score');
    if (gameScoreElement) {
        gameScoreElement.textContent = gameState.score;
    }
}

// Event listeners para inputs (Enter para verificar resposta)
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const currentGame = gameState.currentGame;
        if (currentGame && gameState.currentScreen !== 'home') {
            const checkBtn = document.getElementById(currentGame + '-check');
            const continueBtn = document.getElementById(currentGame + '-continue');
            
            if (checkBtn.style.display !== 'none') {
                checkAnswer(currentGame);
            } else if (!continueBtn.classList.contains('hidden')) {
                nextProblem(currentGame);
            }
        }
    }
});

// Função para adicionar efeitos visuais aos botões
function addButtonEffects() {
    const gameButtons = document.querySelectorAll('.game-button');
    
    gameButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('glow');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('glow');
        });
    });
}

// Função para salvar progresso no localStorage
function saveProgress() {
    localStorage.setItem('matemagica-progress', JSON.stringify({
        score: gameState.score,
        level: gameState.level
    }));
}

// Função para carregar progresso do localStorage
function loadProgress() {
    const saved = localStorage.getItem('matemagica-progress');
    if (saved) {
        const progress = JSON.parse(saved);
        gameState.score = progress.score || 0;
        gameState.level = progress.level || 1;
        updateScoreDisplay();
    }
}

// Função para resetar progresso
function resetProgress() {
    gameState.score = 0;
    gameState.level = 1;
    updateScoreDisplay();
    saveProgress();
}

// Adicionar efeitos de som (simulados com vibração em dispositivos móveis)
function playSuccessSound() {
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

function playErrorSound() {
    if (navigator.vibrate) {
        navigator.vibrate([200]);
    }
}

// Função para animar elementos
function animateElement(element, animationClass) {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, 600);
}

// Inicializar efeitos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    addButtonEffects();
    loadProgress();
    
    // Adicionar animação de entrada aos elementos
    setTimeout(() => {
        const homeElements = document.querySelectorAll('#home-screen .header, #home-screen .mascot-section, #home-screen .player-status, #home-screen .games-menu');
        homeElements.forEach((element, index) => {
            setTimeout(() => {
                animateElement(element, 'slide-in');
            }, index * 200);
        });
    }, 100);
});

// Função para detectar dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Ajustar interface para dispositivos móveis
function adjustForMobile() {
    if (isMobile()) {
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
}

// Event listener para redimensionamento da janela
window.addEventListener('resize', adjustForMobile);

// Salvar progresso automaticamente
setInterval(saveProgress, 30000); // Salvar a cada 30 segundos

// Função para mostrar dicas
function showHint(gameType) {
    const problem = gameState.problems[gameType];
    let hint = '';
    
    switch(gameType) {
        case 'addition':
            hint = `Dica: Conte ${problem.num1} + ${problem.num2} usando os dedos!`;
            break;
        case 'subtraction':
            hint = `Dica: Comece com ${problem.num1} e tire ${problem.num2}!`;
            break;
        case 'multiplication':
            hint = `Dica: ${problem.num1} grupos de ${problem.num2} cada!`;
            break;
    }
    
    alert(hint);
}

// Adicionar botão de dica (opcional)
function addHintButton(gameType) {
    const gameButtons = document.querySelector(`#${gameType}-screen .game-buttons`);
    const hintBtn = document.createElement('button');
    hintBtn.textContent = '💡 Dica';
    hintBtn.className = 'hint-btn';
    hintBtn.onclick = () => showHint(gameType);
    gameButtons.appendChild(hintBtn);
}

