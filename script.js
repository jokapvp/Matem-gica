// Estado global da aplicação
let gameState = {
    score: 0,
    level: 1,
    currentScreen: 'login',
    currentGame: null,
    currentUser: null,
    isAuthenticated: false,
    problems: {
        addition: { num1: 0, num2: 0, answer: 0 },
        subtraction: { num1: 0, num2: 0, answer: 0 },
        multiplication: { num1: 0, num2: 0, answer: 0 }
    }
};

// ===== SISTEMA DE TOAST =====

let toastCounter = 0;

function showToast(message, type = 'info', duration = 4000, gameType = null) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    // Criar elemento do toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = `toast-${++toastCounter}`;
    
    // Adicionar classe específica do jogo se fornecida
    if (gameType) {
        toast.classList.add(gameType);
    }
    
    // Estrutura do toast
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon"></span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="hideToast('${toast.id}')">&times;</button>
        </div>
        <div class="toast-progress"></div>
    `;
    
    // Adicionar ao container
    toastContainer.appendChild(toast);
    
    // Mostrar toast com animação
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto-remover após duração especificada
    const autoHideTimeout = setTimeout(() => {
        hideToast(toast.id);
    }, duration);
    
    // Pausar auto-hide no hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(autoHideTimeout);
        const progressBar = toast.querySelector('.toast-progress');
        if (progressBar) {
            progressBar.style.animationPlayState = 'paused';
        }
    });
    
    // Retomar auto-hide ao sair do hover
    toast.addEventListener('mouseleave', () => {
        const newTimeout = setTimeout(() => {
            hideToast(toast.id);
        }, 1000); // 1 segundo adicional após sair do hover
    });
    
    // Fechar ao clicar no toast
    toast.addEventListener('click', () => {
        hideToast(toast.id);
    });
    
    return toast.id;
}

function hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (!toast) return;
    
    toast.classList.remove('show');
    toast.classList.add('hide');
    
    // Remover do DOM após animação
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 400);
}

function clearAllToasts() {
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        toastContainer.innerHTML = '';
    }
}

// Funções de conveniência para diferentes tipos de toast
function showSuccessToast(message, gameType = null) {
    return showToast(message, 'success', 3000, gameType);
}

function showErrorToast(message, gameType = null) {
    return showToast(message, 'error', 4000, gameType);
}

function showWarningToast(message, gameType = null) {
    return showToast(message, 'warning', 3500, gameType);
}

function showInfoToast(message, gameType = null) {
    return showToast(message, 'info', 3000, gameType);
}

function showMatemagicaToast(message) {
    return showToast(message, 'matemagica', 3000);
}

// Credenciais válidas (incluindo as padrão + novas cadastradas)
let validCredentials = {
    'admin': '123456',
    'crianca': 'matematica',
    'professor': 'ensino123',
    'pai': 'familia'
};

// Perfis de usuário
const userProfiles = {
    'admin': 'Administrador',
    'crianca': 'Criança',
    'professor': 'Professor(a)',
    'pai': 'Responsável'
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    loadRegisteredUsers();
    checkAuthentication();
});

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

function checkAuthentication() {
    const sessionData = localStorage.getItem('matemagica-session');
    
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            const now = Date.now();
            
            // Verificar se a sessão ainda é válida (24 horas)
            if (session.expires > now) {
                gameState.currentUser = session.user;
                gameState.isAuthenticated = true;
                loadUserProgress();
                showScreen('home');
                updateUserDisplay();
                return;
            } else {
                // Sessão expirada
                localStorage.removeItem('matemagica-session');
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            localStorage.removeItem('matemagica-session');
        }
    }
    
    // Não autenticado ou sessão inválida
    gameState.isAuthenticated = false;
    showScreen('login');
}

function performLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    // Limpar erro anterior
    errorDiv.classList.add('hidden');
    
    // Validar campos
    if (!username || !password) {
        showLoginError('Por favor, preencha todos os campos!');
        return;
    }
    
    // Verificar credenciais
    if (validCredentials[username] && validCredentials[username] === password) {
        // Login bem-sucedido
        gameState.currentUser = username;
        gameState.isAuthenticated = true;
        
        // Criar sessão (válida por 24 horas)
        const sessionData = {
            user: username,
            expires: Date.now() + (24 * 60 * 60 * 1000)
        };
        localStorage.setItem('matemagica-session', JSON.stringify(sessionData));
        
        // Carregar progresso do usuário
        loadUserProgress();
        
        // Mostrar toast de boas-vindas
        const profileName = userProfiles[username] || username;
        showSuccessToast(`🎉 Bem-vindo(a), ${profileName}! Vamos aprender matemática!`);
        
        // Ir para tela inicial após um breve delay
        setTimeout(() => {
            showScreen('home');
            updateUserDisplay();
        }, 1500);
        
        // Limpar campos
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
    } else {
        showLoginError('Usuário ou senha incorretos!');
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = '❌ ' + message;
    errorDiv.classList.remove('hidden');
    
    // Animação de shake
    const form = document.querySelector('.login-form');
    form.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        form.style.animation = '';
    }, 500);
}

function performLogout() {
    // Criar confirmação personalizada com toast
    const toastId = `toast-${++toastCounter}`;
    showToast(`
        <div style="text-align: center;">
            <div style="margin-bottom: 10px;">🚪 Tem certeza que deseja sair?</div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirm-logout-yes" style="background: #51cf66; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">✅ Sim</button>
                <button id="confirm-logout-no" style="background: #ff6b6b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">❌ Não</button>
            </div>
        </div>
    `, 'warning', 10000);

    // Aguardar um pouco para os elementos serem criados no DOM
    setTimeout(() => {
        const confirmYesButton = document.getElementById('confirm-logout-yes');
        const confirmNoButton = document.getElementById('confirm-logout-no');

        if (confirmYesButton) {
            confirmYesButton.addEventListener('click', () => {
                confirmLogout();
                hideToast(toastId); // Esconder o toast após a confirmação
            });
        }

        if (confirmNoButton) {
            confirmNoButton.addEventListener('click', () => {
                hideToast(toastId); // Apenas esconder o toast
            });
        }
    }, 100); // 100ms de delay para garantir que os elementos foram criados
}

function confirmLogout() {
    // Salvar progresso antes de sair
    saveUserProgress();
    
    // Limpar sessão
    localStorage.removeItem('matemagica-session');
    
    // Reset do estado
    gameState.currentUser = null;
    gameState.isAuthenticated = false;
    gameState.score = 0;
    gameState.level = 1;
    
    // Limpar toasts
    clearAllToasts();
    
    // Mostrar toast de despedida
    showSuccessToast('👋 Logout realizado com sucesso! Até logo!');
    
    // Voltar para login após um breve delay
    setTimeout(() => {
        showScreen('login');
    }, 1500);
}

// ===== FUNÇÕES DE CADASTRO =====

function showRegisterScreen() {
    showScreen('register');
    clearRegisterForm();
}

function showLoginScreen() {
    showScreen('login');
    clearLoginForm();
}

function clearRegisterForm() {
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm-password').value = '';
    document.getElementById('register-profile').value = '';
    document.getElementById('register-error').classList.add('hidden');
    document.getElementById('register-success').classList.add('hidden');
}

function clearLoginForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').classList.add('hidden');
}

function performRegister() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const profile = document.getElementById('register-profile').value;
    
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    // Limpar mensagens anteriores
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    
    // Validações
    if (!username || !password || !confirmPassword || !profile) {
        showRegisterError('Por favor, preencha todos os campos!');
        return;
    }
    
    if (username.length < 3) {
        showRegisterError('O nome de usuário deve ter pelo menos 3 caracteres!');
        return;
    }
    
    if (password.length < 4) {
        showRegisterError('A senha deve ter pelo menos 4 caracteres!');
        return;
    }
    
    if (password !== confirmPassword) {
        showRegisterError('As senhas não coincidem!');
        return;
    }
    
    // Verificar se usuário já existe
    if (validCredentials[username]) {
        showRegisterError('Este nome de usuário já está em uso!');
        return;
    }
    
    // Cadastro bem-sucedido
    validCredentials[username] = password;
    userProfiles[username] = getProfileDisplayName(profile);
    
    // Salvar usuários cadastrados
    saveRegisteredUsers();
    
    // Mostrar sucesso
    showSuccessToast('✅ Conta criada com sucesso! Redirecionando para o login...');
    
    // Redirecionar para login após 2 segundos
    setTimeout(() => {
        showLoginScreen();
        // Pré-preencher o usuário
        document.getElementById('username').value = username;
        showInfoToast(`💡 Agora faça login com sua nova conta: ${username}`);
    }, 2000);
}

function showRegisterError(message) {
    const errorDiv = document.getElementById('register-error');
    errorDiv.textContent = '❌ ' + message;
    errorDiv.classList.remove('hidden');
    
    // Animação de shake
    const form = document.querySelector('.register-form');
    form.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        form.style.animation = '';
    }, 500);
}

function showRegisterSuccess(message) {
    const successDiv = document.getElementById('register-success');
    successDiv.textContent = '✅ ' + message;
    successDiv.classList.remove('hidden');
}

function getProfileDisplayName(profile) {
    const profiles = {
        'crianca': 'Criança',
        'professor': 'Professor(a)',
        'pai': 'Responsável'
    };
    return profiles[profile] || 'Usuário';
}

// ===== FUNÇÕES DE PERSISTÊNCIA =====

function saveRegisteredUsers() {
    const registeredUsers = {};
    
    // Salvar apenas usuários cadastrados (não os padrão)
    for (const username in validCredentials) {
        if (!['admin', 'crianca', 'professor', 'pai'].includes(username)) {
            registeredUsers[username] = {
                password: validCredentials[username],
                profile: userProfiles[username]
            };
        }
    }
    
    localStorage.setItem('matemagica-registered-users', JSON.stringify(registeredUsers));
}

function loadRegisteredUsers() {
    const registeredUsers = localStorage.getItem('matemagica-registered-users');
    
    if (registeredUsers) {
        try {
            const users = JSON.parse(registeredUsers);
            
            for (const username in users) {
                validCredentials[username] = users[username].password;
                userProfiles[username] = users[username].profile;
            }
        } catch (error) {
            console.error('Erro ao carregar usuários cadastrados:', error);
        }
    }
}

function saveUserProgress() {
    if (gameState.currentUser) {
        const progressData = {
            score: gameState.score,
            level: gameState.level,
            lastPlayed: Date.now()
        };
        
        localStorage.setItem(`matemagica-progress-${gameState.currentUser}`, JSON.stringify(progressData));
    }
}

function loadUserProgress() {
    if (gameState.currentUser) {
        const progressData = localStorage.getItem(`matemagica-progress-${gameState.currentUser}`);
        
        if (progressData) {
            try {
                const progress = JSON.parse(progressData);
                gameState.score = progress.score || 0;
                gameState.level = progress.level || 1;
                updateScoreDisplay();
            } catch (error) {
                console.error('Erro ao carregar progresso:', error);
                gameState.score = 0;
                gameState.level = 1;
            }
        } else {
            gameState.score = 0;
            gameState.level = 1;
        }
    }
}

// ===== FUNÇÕES DE INTERFACE =====

function updateUserDisplay() {
    if (gameState.currentUser) {
        const userNameElement = document.getElementById('current-user');
        const displayName = userProfiles[gameState.currentUser] || gameState.currentUser;
        userNameElement.textContent = displayName;
    }
}

function requireAuthentication() {
    if (!gameState.isAuthenticated) {
        showErrorToast('🔒 Você precisa fazer login primeiro!');
        showScreen('login');
        return false;
    }
    return true;
}

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
    if (!requireAuthentication()) return;
    
    showScreen('home');
    updateScoreDisplay();
    saveUserProgress();
}

// Função para iniciar um jogo
function startGame(gameType) {
    if (!requireAuthentication()) return;
    
    gameState.currentGame = gameType;
    showScreen(gameType);
    generateProblem(gameType);
    updateGameScore(gameType);
    
    // Toast de boas-vindas específico do jogo
    const gameNames = {
        'addition': 'Adição Mágica',
        'subtraction': 'Subtração Aventura', 
        'multiplication': 'Multiplicação Mistério'
    };
    
    showMatemagicaToast(`🎮 Bem-vindo ao ${gameNames[gameType]}! Boa sorte!`);
    
    // Limpar feedback e botões
    const feedback = document.getElementById(gameType + '-feedback');
    const checkBtn = document.getElementById(gameType + '-check');
    const continueBtn = document.getElementById(gameType + '-continue');
    const answerInput = document.getElementById(gameType + '-answer');
    
    if (feedback) feedback.classList.add('hidden');
    if (checkBtn) checkBtn.classList.remove('hidden');
    if (continueBtn) continueBtn.classList.add('hidden');
    if (answerInput) {
        answerInput.value = '';
        answerInput.focus();
    }
}

// Função para gerar um problema matemático
function generateProblem(gameType) {
    let num1, num2;
    
    switch (gameType) {
        case 'addition':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            gameState.problems.addition = { num1, num2, answer: num1 + num2 };
            document.getElementById('addition-num1').textContent = num1;
            document.getElementById('addition-num2').textContent = num2;
            break;
            
        case 'subtraction':
            num1 = Math.floor(Math.random() * 15) + 5;
            num2 = Math.floor(Math.random() * num1) + 1;
            gameState.problems.subtraction = { num1, num2, answer: num1 - num2 };
            document.getElementById('subtraction-num1').textContent = num1;
            document.getElementById('subtraction-num2').textContent = num2;
            break;
            
        case 'multiplication':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            gameState.problems.multiplication = { num1, num2, answer: num1 * num2 };
            document.getElementById('multiplication-num1').textContent = num1;
            document.getElementById('multiplication-num2').textContent = num2;
            break;
    }
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
        feedback.textContent = '🤔 Por favor, digite um número!';
        feedback.className = 'feedback incorrect';
        feedback.classList.remove('hidden');
        return;
    }
    
    if (userAnswer === correctAnswer) {
        // Resposta correta
        feedback.textContent = '🎉 Parabéns! Resposta correta!';
        feedback.className = 'feedback correct';
        
        // Adicionar pontos
        const points = gameType === 'multiplication' ? 15 : (gameType === 'subtraction' ? 12 : 10);
        gameState.score += points;
        
        // Verificar se subiu de nível
        const newLevel = Math.floor(gameState.score / 100) + 1;
        if (newLevel > gameState.level) {
            gameState.level = newLevel;
            feedback.textContent += ` 🆙 Você subiu para o nível ${gameState.level}!`;
            showSuccessToast(`🎊 Parabéns! Você subiu para o nível ${gameState.level}!`, gameType);
        } else {
            showSuccessToast(`🎯 Resposta correta! +${points} pontos!`, gameType);
        }
        
        updateScoreDisplay();
        updateGameScore(gameType);
        saveUserProgress();
        
    } else {
        // Resposta incorreta
        feedback.textContent = `❌ Ops! A resposta correta é ${correctAnswer}. Tente novamente!`;
        feedback.className = 'feedback incorrect';
        showErrorToast(`💭 A resposta correta era ${correctAnswer}. Continue tentando!`, gameType);
    }
    
    feedback.classList.remove('hidden');
    checkBtn.classList.add('hidden');
    continueBtn.classList.remove('hidden');
}

// Função para próximo problema
function nextProblem(gameType) {
    generateProblem(gameType);
    
    const feedback = document.getElementById(gameType + '-feedback');
    const checkBtn = document.getElementById(gameType + '-check');
    const continueBtn = document.getElementById(gameType + '-continue');
    const answerInput = document.getElementById(gameType + '-answer');
    
    feedback.classList.add('hidden');
    checkBtn.classList.remove('hidden');
    continueBtn.classList.add('hidden');
    answerInput.value = '';
    answerInput.focus();
}

// Função para atualizar a exibição da pontuação
function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    
    if (scoreElement) scoreElement.textContent = gameState.score;
    if (levelElement) levelElement.textContent = gameState.level;
}

// Função para atualizar a pontuação do jogo específico
function updateGameScore(gameType) {
    const gameScoreElement = document.getElementById(gameType + '-score');
    if (gameScoreElement) {
        gameScoreElement.textContent = gameState.score;
    }
}

// Event listeners para Enter nos formulários
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginInputs = ['username', 'password'];
    loginInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performLogin();
                }
            });
        }
    });
    
    // Register form
    const registerInputs = ['register-username', 'register-password', 'register-confirm-password'];
    registerInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performRegister();
                }
            });
        }
    });
    
    // Game answer inputs
    const gameTypes = ['addition', 'subtraction', 'multiplication'];
    gameTypes.forEach(gameType => {
        const input = document.getElementById(gameType + '-answer');
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const checkBtn = document.getElementById(gameType + '-check');
                    const continueBtn = document.getElementById(gameType + '-continue');
                    
                    if (!checkBtn.classList.contains('hidden')) {
                        checkAnswer(gameType);
                    } else if (!continueBtn.classList.contains('hidden')) {
                        nextProblem(gameType);
                    }
                }
            });
        }
    });
});

