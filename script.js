// Estado global da aplicação
let estadoJogo = {
    pontuacao: 0,
    nivel: 1,
    telaAtual: 'login',
    jogoAtual: null,
    usuarioAtual: null,
    estaAutenticado: false,
    problemas: {
        adicao: { num1: 0, num2: 0, resposta: 0 },
        subtracao: { num1: 0, num2: 0, resposta: 0 },
        multiplicacao: { num1: 0, num2: 0, resposta: 0 }
    }
};

// ===== SISTEMA DE TOAST =====

let contadorToast = 0;

function mostrarToast(mensagem, tipo = 'info', duracao = 4000, tipoJogo = null) {
    const containerToast = document.getElementById('toast-container');
    if (!containerToast) return;
    
    // Criar elemento do toast
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.id = `toast-${++contadorToast}`;
    
    // Adicionar classe específica do jogo se fornecida
    if (tipoJogo) {
        toast.classList.add(tipoJogo);
    }
    
    // Estrutura do toast
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon"></span>
            <span class="toast-message">${mensagem}</span>
            <button class="toast-close" onclick="esconderToast('${toast.id}')">&times;</button>
        </div>
        <div class="toast-progress"></div>
    `;
    
    // Adicionar ao container
    containerToast.appendChild(toast);
    
    // Mostrar toast com animação
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto-remover após duração especificada
    const timeoutAutoEsconder = setTimeout(() => {
        esconderToast(toast.id);
    }, duracao);
    
    // Pausar auto-hide no hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timeoutAutoEsconder);
        const barraProgresso = toast.querySelector('.toast-progress');
        if (barraProgresso) {
            barraProgresso.style.animationPlayState = 'paused';
        }
    });
    
    // Retomar auto-hide ao sair do hover
    toast.addEventListener('mouseleave', () => {
        const novoTempo = setTimeout(() => {
            esconderToast(toast.id);
        }, 1000); // 1 segundo adicional após sair do hover
    });
    
    // Fechar ao clicar no toast
    toast.addEventListener('click', () => {
        esconderToast(toast.id);
    });
    
    return toast.id;
}

function esconderToast(idToast) {
    const toast = document.getElementById(idToast);
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

function limparTodosToasts() {
    const containerToast = document.getElementById('toast-container');
    if (containerToast) {
        containerToast.innerHTML = '';
    }
}

// Funções de conveniência para diferentes tipos de toast
function mostrarToastSucesso(mensagem, tipoJogo = null) {
    return mostrarToast(mensagem, 'success', 3000, tipoJogo);
}

function mostrarToastErro(mensagem, tipoJogo = null) {
    return mostrarToast(mensagem, 'error', 4000, tipoJogo);
}

function mostrarToastAviso(mensagem, tipoJogo = null) {
    return mostrarToast(mensagem, 'warning', 3500, tipoJogo);
}

function mostrarToastInfo(mensagem, tipoJogo = null) {
    return mostrarToast(mensagem, 'info', 3000, tipoJogo);
}

function mostrarToastMatemagica(mensagem) {
    return mostrarToast(mensagem, 'matemagica', 3000);
}

// Credenciais válidas (incluindo as padrão + novas cadastradas)
let credenciaisValidas = {
    'admin': '123456',
    'crianca': 'matematica',
    'professor': 'ensino123',
    'pai': 'familia'
};

// Perfis de usuário
const perfisUsuario = {
    'admin': 'Administrador',
    'crianca': 'Criança',
    'professor': 'Professor(a)',
    'pai': 'Responsável'
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    carregarUsuariosCadastrados();
    verificarAutenticacao();
});

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

function verificarAutenticacao() {
    const dadosSessao = localStorage.getItem('matemagica-sessao');
    
    if (dadosSessao) {
        try {
            const sessao = JSON.parse(dadosSessao);
            const agora = Date.now();
            
            // Verificar se a sessão ainda é válida (24 horas)
            if (sessao.expira > agora) {
                estadoJogo.usuarioAtual = sessao.usuario;
                estadoJogo.estaAutenticado = true;
                carregarProgressoUsuario();
                mostrarTela('home');
                atualizarExibicaoUsuario();
                return;
            } else {
                // Sessão expirada
                localStorage.removeItem('matemagica-sessao');
            }
        } catch (erro) {
            console.error('Erro ao verificar sessão:', erro);
            localStorage.removeItem('matemagica-sessao');
        }
    }
    
    // Não autenticado ou sessão inválida
    estadoJogo.estaAutenticado = false;
    mostrarTela('login');
}

function realizarLogin() {
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;
    const divErro = document.getElementById('erro-login');
    
    // Limpar erro anterior
    divErro.classList.add('hidden');
    
    // Validar campos
    if (!usuario || !senha) {
        mostrarErroLogin('Por favor, preencha todos os campos!');
        return;
    }
    
    // Verificar credenciais
    if (credenciaisValidas[usuario] && credenciaisValidas[usuario] === senha) {
        // Login bem-sucedido
        estadoJogo.usuarioAtual = usuario;
        estadoJogo.estaAutenticado = true;
        
        // Criar sessão (válida por 24 horas)
        const dadosSessao = {
            usuario: usuario,
            expira: Date.now() + (24 * 60 * 60 * 1000)
        };
        localStorage.setItem('matemagica-sessao', JSON.stringify(dadosSessao));
        
        // Carregar progresso do usuário
        carregarProgressoUsuario();
        
        // Mostrar toast de boas-vindas
        const nomePerfil = perfisUsuario[usuario] || usuario;
        mostrarToastSucesso(`🎉 Bem-vindo(a), ${nomePerfil}! Vamos aprender matemática!`);
        
        // Ir para tela inicial após um breve delay
        setTimeout(() => {
            mostrarTela('home');
            atualizarExibicaoUsuario();
        }, 1500);
        
        // Limpar campos
        document.getElementById('usuario').value = '';
        document.getElementById('senha').value = '';
        
    } else {
        mostrarErroLogin('Usuário ou senha incorretos!');
    }
}

function mostrarErroLogin(mensagem) {
    const divErro = document.getElementById('erro-login');
    divErro.textContent = '❌ ' + mensagem;
    divErro.classList.remove('hidden');
    
    // Animação de shake
    const formulario = document.querySelector('.login-form');
    formulario.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        formulario.style.animation = '';
    }, 500);
}

function realizarLogout() {
    // Criar confirmação personalizada com toast
    const idToast = `toast-${++contadorToast}`;
    mostrarToast(`
        <div style="text-align: center;">
            <div style="margin-bottom: 10px;">🚪 Tem certeza que deseja sair?</div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirmar-logout-sim" style="background: #51cf66; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">✅ Sim</button>
                <button id="confirmar-logout-nao" style="background: #ff6b6b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">❌ Não</button>
            </div>
        </div>
    `, 'warning', 10000);

    // Aguardar um pouco para os elementos serem criados no DOM
    setTimeout(() => {
        const botaoConfirmarSim = document.getElementById('confirmar-logout-sim');
        const botaoConfirmarNao = document.getElementById('confirmar-logout-nao');

        if (botaoConfirmarSim) {
            botaoConfirmarSim.addEventListener('click', () => {
                confirmarLogout();
                esconderToast(idToast); // Esconder o toast após a confirmação
            });
        }

        if (botaoConfirmarNao) {
            botaoConfirmarNao.addEventListener('click', () => {
                esconderToast(idToast); // Apenas esconder o toast
            });
        }
    }, 100); // 100ms de delay para garantir que os elementos foram criados
}

function confirmarLogout() {
    // Salvar progresso antes de sair
    salvarProgressoUsuario();
    
    // Limpar sessão
    localStorage.removeItem('matemagica-sessao');
    
    // Reset do estado
    estadoJogo.usuarioAtual = null;
    estadoJogo.estaAutenticado = false;
    estadoJogo.pontuacao = 0;
    estadoJogo.nivel = 1;
    
    // Limpar toasts
    limparTodosToasts();
    
    // Mostrar toast de despedida
    mostrarToastSucesso('👋 Logout realizado com sucesso! Até logo!');
    
    // Voltar para login após um breve delay
    setTimeout(() => {
        mostrarTela('login');
    }, 1500);
}

// ===== FUNÇÕES DE CADASTRO =====

function mostrarTelaCadastro() {
    mostrarTela('register');
    limparFormularioCadastro();
}

function mostrarTelaLogin() {
    mostrarTela('login');
    limparFormularioLogin();
}

function limparFormularioCadastro() {
    document.getElementById('usuario-cadastro').value = '';
    document.getElementById('senha-cadastro').value = '';
    document.getElementById('confirmar-senha').value = '';
    document.getElementById('perfil-cadastro').value = '';
    document.getElementById('erro-cadastro').classList.add('hidden');
    document.getElementById('sucesso-cadastro').classList.add('hidden');
}

function limparFormularioLogin() {
    document.getElementById('usuario').value = '';
    document.getElementById('senha').value = '';
    document.getElementById('erro-login').classList.add('hidden');
}

function realizarCadastro() {
    const usuario = document.getElementById('usuario-cadastro').value.trim();
    const senha = document.getElementById('senha-cadastro').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const perfil = document.getElementById('perfil-cadastro').value;
    
    const divErro = document.getElementById('erro-cadastro');
    const divSucesso = document.getElementById('sucesso-cadastro');
    
    // Limpar mensagens anteriores
    divErro.classList.add('hidden');
    divSucesso.classList.add('hidden');
    
    // Validações
    if (!usuario || !senha || !confirmarSenha || !perfil) {
        mostrarErroCadastro('Por favor, preencha todos os campos!');
        return;
    }
    
    if (usuario.length < 3) {
        mostrarErroCadastro('O nome de usuário deve ter pelo menos 3 caracteres!');
        return;
    }
    
    if (senha.length < 4) {
        mostrarErroCadastro('A senha deve ter pelo menos 4 caracteres!');
        return;
    }
    
    if (senha !== confirmarSenha) {
        mostrarErroCadastro('As senhas não coincidem!');
        return;
    }
    
    // Verificar se usuário já existe
    if (credenciaisValidas[usuario]) {
        mostrarErroCadastro('Este nome de usuário já está em uso!');
        return;
    }
    
    // Cadastro bem-sucedido
    credenciaisValidas[usuario] = senha;
    perfisUsuario[usuario] = obterNomeExibicaoPerfil(perfil);
    
    // Salvar usuários cadastrados
    salvarUsuariosCadastrados();
    
    // Mostrar sucesso
    mostrarToastSucesso('✅ Conta criada com sucesso! Redirecionando para o login...');
    
    // Redirecionar para login após 2 segundos
    setTimeout(() => {
        mostrarTelaLogin();
        // Pré-preencher o usuário
        document.getElementById('usuario').value = usuario;
        mostrarToastInfo(`💡 Agora faça login com sua nova conta: ${usuario}`);
    }, 2000);
}

function mostrarErroCadastro(mensagem) {
    const divErro = document.getElementById('erro-cadastro');
    divErro.textContent = '❌ ' + mensagem;
    divErro.classList.remove('hidden');
    
    // Animação de shake
    const formulario = document.querySelector('.register-form');
    formulario.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        formulario.style.animation = '';
    }, 500);
}

function mostrarSucessoCadastro(mensagem) {
    const divSucesso = document.getElementById('sucesso-cadastro');
    divSucesso.textContent = '✅ ' + mensagem;
    divSucesso.classList.remove('hidden');
}

function obterNomeExibicaoPerfil(perfil) {
    const perfis = {
        'crianca': 'Criança',
        'professor': 'Professor(a)',
        'pai': 'Responsável'
    };
    return perfis[perfil] || 'Usuário';
}

// ===== FUNÇÕES DE PERSISTÊNCIA =====

function salvarUsuariosCadastrados() {
    const usuariosCadastrados = {};
    
    // Salvar apenas usuários cadastrados (não os padrão)
    for (const usuario in credenciaisValidas) {
        if (!['admin', 'crianca', 'professor', 'pai'].includes(usuario)) {
            usuariosCadastrados[usuario] = {
                senha: credenciaisValidas[usuario],
                perfil: perfisUsuario[usuario]
            };
        }
    }
    
    localStorage.setItem('matemagica-usuarios-cadastrados', JSON.stringify(usuariosCadastrados));
}

function carregarUsuariosCadastrados() {
    const usuariosCadastrados = localStorage.getItem('matemagica-usuarios-cadastrados');
    
    if (usuariosCadastrados) {
        try {
            const usuarios = JSON.parse(usuariosCadastrados);
            
            for (const usuario in usuarios) {
                credenciaisValidas[usuario] = usuarios[usuario].senha;
                perfisUsuario[usuario] = usuarios[usuario].perfil;
            }
        } catch (erro) {
            console.error('Erro ao carregar usuários cadastrados:', erro);
        }
    }
}

function salvarProgressoUsuario() {
    if (estadoJogo.usuarioAtual) {
        const dadosProgresso = {
            pontuacao: estadoJogo.pontuacao,
            nivel: estadoJogo.nivel,
            ultimaJogada: Date.now()
        };
        
        localStorage.setItem(`matemagica-progresso-${estadoJogo.usuarioAtual}`, JSON.stringify(dadosProgresso));
    }
}

function carregarProgressoUsuario() {
    if (estadoJogo.usuarioAtual) {
        const dadosProgresso = localStorage.getItem(`matemagica-progresso-${estadoJogo.usuarioAtual}`);
        
        if (dadosProgresso) {
            try {
                const progresso = JSON.parse(dadosProgresso);
                estadoJogo.pontuacao = progresso.pontuacao || 0;
                estadoJogo.nivel = progresso.nivel || 1;
                atualizarExibicaoPontuacao();
            } catch (erro) {
                console.error('Erro ao carregar progresso:', erro);
                estadoJogo.pontuacao = 0;
                estadoJogo.nivel = 1;
            }
        } else {
            estadoJogo.pontuacao = 0;
            estadoJogo.nivel = 1;
        }
    }
}

// ===== FUNÇÕES DE INTERFACE =====

function atualizarExibicaoUsuario() {
    if (estadoJogo.usuarioAtual) {
        const elementoNomeUsuario = document.getElementById('usuario-atual');
        const nomeExibicao = perfisUsuario[estadoJogo.usuarioAtual] || estadoJogo.usuarioAtual;
        elementoNomeUsuario.textContent = nomeExibicao;
    }
}

function requererAutenticacao() {
    if (!estadoJogo.estaAutenticado) {
        mostrarToastErro('🔒 Você precisa fazer login primeiro!');
        mostrarTela('login');
        return false;
    }
    return true;
}

// Função para mostrar uma tela específica
function mostrarTela(nomeTela) {
    // Esconder todas as telas
    const telas = document.querySelectorAll('.screen');
    telas.forEach(tela => {
        tela.classList.remove('active');
    });
    
    // Mostrar a tela solicitada
    const telaAlvo = document.getElementById(nomeTela + '-screen');
    if (telaAlvo) {
        telaAlvo.classList.add('active');
        estadoJogo.telaAtual = nomeTela;
    }
}

// Função para voltar à tela inicial
function irParaHome() {
    if (!requererAutenticacao()) return;
    
    mostrarTela('home');
    atualizarExibicaoPontuacao();
    salvarProgressoUsuario();
}

// Função para iniciar um jogo
function iniciarJogo(tipoJogo) {
    if (!requererAutenticacao()) return;
    
    estadoJogo.jogoAtual = tipoJogo;
    mostrarTela(tipoJogo);
    gerarProblema(tipoJogo);
    atualizarPontuacaoJogo(tipoJogo);
    
    // Toast de boas-vindas específico do jogo
    const nomesJogos = {
        'adicao': 'Adição Mágica',
        'subtracao': 'Subtração Aventura', 
        'multiplicacao': 'Multiplicação Mistério'
    };
    
    mostrarToastMatemagica(`🎮 Bem-vindo ao ${nomesJogos[tipoJogo]}! Boa sorte!`);
    
    // Limpar feedback e botões
    const feedback = document.getElementById('feedback-' + tipoJogo);
    const botaoVerificar = document.getElementById('verificar-' + tipoJogo);
    const botaoContinuar = document.getElementById('continuar-' + tipoJogo);
    const entradaResposta = document.getElementById('resposta-' + tipoJogo);
    
    if (feedback) feedback.classList.add('hidden');
    if (botaoVerificar) botaoVerificar.classList.remove('hidden');
    if (botaoContinuar) botaoContinuar.classList.add('hidden');
    if (entradaResposta) {
        entradaResposta.value = '';
        entradaResposta.focus();
    }
}

// Função para gerar um problema matemático
function gerarProblema(tipoJogo) {
    let num1, num2;
    
    switch (tipoJogo) {
        case 'adicao':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            estadoJogo.problemas.adicao = { num1, num2, resposta: num1 + num2 };
            document.getElementById('numero1-adicao').textContent = num1;
            document.getElementById('numero2-adicao').textContent = num2;
            break;
            
        case 'subtracao':
            num1 = Math.floor(Math.random() * 15) + 5;
            num2 = Math.floor(Math.random() * num1) + 1;
            estadoJogo.problemas.subtracao = { num1, num2, resposta: num1 - num2 };
            document.getElementById('numero1-subtracao').textContent = num1;
            document.getElementById('numero2-subtracao').textContent = num2;
            break;
            
        case 'multiplicacao':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            estadoJogo.problemas.multiplicacao = { num1, num2, resposta: num1 * num2 };
            document.getElementById('numero1-multiplicacao').textContent = num1;
            document.getElementById('numero2-multiplicacao').textContent = num2;
            break;
    }
}

// Função para verificar a resposta
function verificarResposta(tipoJogo) {
    const entradaResposta = document.getElementById('resposta-' + tipoJogo);
    const respostaUsuario = parseInt(entradaResposta.value);
    const respostaCorreta = estadoJogo.problemas[tipoJogo].resposta;
    const feedback = document.getElementById('feedback-' + tipoJogo);
    const botaoVerificar = document.getElementById('verificar-' + tipoJogo);
    const botaoContinuar = document.getElementById('continuar-' + tipoJogo);
    
    if (isNaN(respostaUsuario)) {
        feedback.textContent = '🤔 Por favor, digite um número!';
        feedback.className = 'feedback incorrect';
        feedback.classList.remove('hidden');
        return;
    }
    
    if (respostaUsuario === respostaCorreta) {
        // Resposta correta
        feedback.textContent = '🎉 Parabéns! Resposta correta!';
        feedback.className = 'feedback correct';
        
        // Adicionar pontos
        const pontos = tipoJogo === 'multiplicacao' ? 15 : (tipoJogo === 'subtracao' ? 12 : 10);
        estadoJogo.pontuacao += pontos;
        
        // Verificar se subiu de nível
        const novoNivel = Math.floor(estadoJogo.pontuacao / 100) + 1;
        if (novoNivel > estadoJogo.nivel) {
            estadoJogo.nivel = novoNivel;
            feedback.textContent += ` 🆙 Você subiu para o nível ${estadoJogo.nivel}!`;
            mostrarToastSucesso(`🎊 Parabéns! Você subiu para o nível ${estadoJogo.nivel}!`, tipoJogo);
        } else {
            mostrarToastSucesso(`🎯 Resposta correta! +${pontos} pontos!`, tipoJogo);
        }
        
        atualizarExibicaoPontuacao();
        atualizarPontuacaoJogo(tipoJogo);
        salvarProgressoUsuario();
        
    } else {
        // Resposta incorreta
        feedback.textContent = `❌ Ops! A resposta correta é ${respostaCorreta}. Tente novamente!`;
        feedback.className = 'feedback incorrect';
        mostrarToastErro(`💭 A resposta correta era ${respostaCorreta}. Continue tentando!`, tipoJogo);
    }
    
    feedback.classList.remove('hidden');
    botaoVerificar.classList.add('hidden');
    botaoContinuar.classList.remove('hidden');
}

// Função para próximo problema
function proximoProblema(tipoJogo) {
    gerarProblema(tipoJogo);
    
    const feedback = document.getElementById('feedback-' + tipoJogo);
    const botaoVerificar = document.getElementById('verificar-' + tipoJogo);
    const botaoContinuar = document.getElementById('continuar-' + tipoJogo);
    const entradaResposta = document.getElementById('resposta-' + tipoJogo);
    
    feedback.classList.add('hidden');
    botaoVerificar.classList.remove('hidden');
    botaoContinuar.classList.add('hidden');
    entradaResposta.value = '';
    entradaResposta.focus();
}

// Função para atualizar a exibição da pontuação
function atualizarExibicaoPontuacao() {
    const elementoPontuacao = document.getElementById('pontuacao');
    const elementoNivel = document.getElementById('nivel');
    
    if (elementoPontuacao) elementoPontuacao.textContent = estadoJogo.pontuacao;
    if (elementoNivel) elementoNivel.textContent = estadoJogo.nivel;
}

// Função para atualizar a pontuação do jogo específico
function atualizarPontuacaoJogo(tipoJogo) {
    const elementoPontuacaoJogo = document.getElementById('pontuacao-' + tipoJogo);
    if (elementoPontuacaoJogo) {
        elementoPontuacaoJogo.textContent = estadoJogo.pontuacao;
    }
}

// Event listeners para Enter nos formulários
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const entradasLogin = ['usuario', 'senha'];
    entradasLogin.forEach(idInput => {
        const input = document.getElementById(idInput);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    realizarLogin();
                }
            });
        }
    });
    
    // Register form
    const entradasCadastro = ['usuario-cadastro', 'senha-cadastro', 'confirmar-senha'];
    entradasCadastro.forEach(idInput => {
        const input = document.getElementById(idInput);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    realizarCadastro();
                }
            });
        }
    });
    
    // Game answer inputs
    const tiposJogo = ['adicao', 'subtracao', 'multiplicacao'];
    tiposJogo.forEach(tipoJogo => {
        const input = document.getElementById('resposta-' + tipoJogo);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const botaoVerificar = document.getElementById('verificar-' + tipoJogo);
                    const botaoContinuar = document.getElementById('continuar-' + tipoJogo);
                    
                    if (!botaoVerificar.classList.contains('hidden')) {
                        verificarResposta(tipoJogo);
                    } else if (!botaoContinuar.classList.contains('hidden')) {
                        proximoProblema(tipoJogo);
                    }
                }
            });
        }
    });
});

