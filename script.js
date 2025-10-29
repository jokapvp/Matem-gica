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
    },
    historico: {
        sessoes: [],
        conquistas: [],
        estatisticas: {
            totalRespostas: 0,
            respostasCorretas: 0,
            tempoMedio: 0,
            jogosCompletos: 0
        }
    },
    tempoInicioSessao: null
};

// ===== SISTEMA DE PERSISTÊNCIA (Inspirado no professor) =====
const CHAVES_DB = {
    usuarios: 'matemagica_usuarios',
    progresso: 'matemagica_progresso',
    historico: 'matemagica_historico',
    conquistas: 'matemagica_conquistas'
};

const repositorio = {
    get(chave) {
        return JSON.parse(localStorage.getItem(chave) || '[]');
    },
    set(chave, dados) {
        localStorage.setItem(chave, JSON.stringify(dados));
    },
    push(chave, item) {
        const arr = this.get(chave);
        arr.push(item);
        this.set(chave, arr);
        return item;
    },
    atualizarPorId(chave, id, atualizador) {
        const arr = this.get(chave);
        const indice = arr.findIndex(x => x.id === id);
        if (indice >= 0) {
            arr[indice] = atualizador(arr[indice]);
            this.set(chave, arr);
            return arr[indice];
        }
        return null;
    }
};

// ===== SISTEMA DE CONQUISTAS =====
const conquistas = {
    iniciante: { 
        id: 'iniciante', 
        nome: '🎮 Primeiros Passos', 
        descricao: 'Complete 10 problemas', 
        progresso: 0, 
        meta: 10,
        obtida: false 
    },
    mestre: { 
        id: 'mestre', 
        nome: '🏆 Mestre da Matemática', 
        descricao: 'Alcance o nível 3', 
        progresso: 0, 
        meta: 3,
        obtida: false 
    },
    velocidade: { 
        id: 'velocidade', 
        nome: '⚡ Resposta Rápida', 
        descricao: 'Responda 5 problemas em menos de 10 segundos cada', 
        progresso: 0, 
        meta: 5,
        obtida: false 
    },
    adicaoExpert: { 
        id: 'adicaoExpert', 
        nome: '➕ Expert em Adição', 
        descricao: 'Resolva 20 problemas de adição', 
        progresso: 0, 
        meta: 20,
        obtida: false 
    }
};

// ===== PERMISSÕES DE PERFIL =====
const permissoesPerfil = {
    crianca: {
        jogos: ['adicao', 'subtracao'],
        nivelMaximo: 3,
        recursosExtras: false
    },
    professor: {
        jogos: ['adicao', 'subtracao', 'multiplicacao'],
        nivelMaximo: 10,
        recursosExtras: true
    },
    pai: {
        jogos: ['adicao', 'subtracao', 'multiplicacao'],
        nivelMaximo: 6,
        recursosExtras: true
    }
};

// ===== SISTEMA DE TOAST MELHORADO =====
let contadorToast = 0;
let jogoAtivo = null; // Para evitar conflitos de jogos simultâneos

// mudar tempo de toast - Esta é a função principal onde o tempo padrão é definido
function mostrarToast(mensagem, tipo = 'info', duracao = 3000, tipoJogo = null) {
    const containerToast = document.getElementById('toast-container');
    if (!containerToast) {
        alert(mensagem);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.id = `toast-${++contadorToast}`;
    
    if (tipoJogo) {
        toast.classList.add(tipoJogo);
    }
    
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${obterIconeToast(tipo)}</span>
            <span class="toast-message">${mensagem}</span>
            <button class="toast-close" onclick="esconderToast('${toast.id}')">&times;</button>
        </div>
        <div class="toast-progress"></div>
    `;
    
    containerToast.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    const timeoutAutoEsconder = setTimeout(() => {
        esconderToast(toast.id);
    }, duracao);
    
    // Pausar no hover (melhoria do sistema do professor)
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timeoutAutoEsconder);
        const barraProgresso = toast.querySelector('.toast-progress');
        if (barraProgresso) {
            barraProgresso.style.animationPlayState = 'paused';
        }
    });
    
    toast.addEventListener('mouseleave', () => {
        const novoTempo = setTimeout(() => {
            esconderToast(toast.id);
        }, 1000);
    });
    
    return toast.id;
}

function obterIconeToast(tipo) {
    const icones = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icones[tipo] || '💡';
}

function esconderToast(idToast) {
    const toast = document.getElementById(idToast);
    if (!toast) return;
    
    toast.classList.remove('show');
    toast.classList.add('hide');
    
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

// Funções de conveniência para toast - mudar tempo de toast em cada uma dessas
function mostrarToastSucesso(mensagem, tipoJogo = null) {
    return mostrarToast(mensagem, 'success', 4000, tipoJogo); // mudar tempo de toast
}

function mostrarToastErro(mensagem, tipoJogo = null) {
    return mostrarToast(mensagem, 'error', 4000, tipoJogo); // mudar tempo de toast
}

function mostrarToastAviso(mensagem, tipoJogo = null) {
    return mostrarToast(mensagem, 'warning', 4000, tipoJogo); // mudar tempo de toast
}

function mostrarToastInfo(mensagem, tipoJogo = null) {
    return mostrarToast(mensagem, 'info', 4000, tipoJogo); // mudar tempo de toast
}

// ===== SISTEMA DE NAVEGAÇÃO POR HASH =====
function configurarNavegacao() {
    const telas = document.querySelectorAll('.screen');
    
    function mostrarTelaPorHash() {
        const hash = window.location.hash.replace('#', '') || 'login';
        const telaAlvo = `${hash}-screen`;
        
        telas.forEach(tela => {
            tela.classList.toggle('active', tela.id === telaAlvo);
        });
        
        estadoJogo.telaAtual = hash;
        
        // Atualizar estado específico baseado na tela
        if (hash === 'home' && estadoJogo.estaAutenticado) {
            atualizarExibicaoUsuario();
            atualizarExibicaoPontuacao();
            carregarHistoricoJogos();
        }
    }
    
    window.addEventListener('hashchange', mostrarTelaPorHash);
    window.addEventListener('load', mostrarTelaPorHash);
    
    // Navegação inicial
    mostrarTelaPorHash();
}

// ===== SISTEMA DE AUTENTICAÇÃO E USUÁRIOS =====
let credenciaisValidas = {
    'admin': '123456',
    'crianca': 'matematica',
    'professor': 'ensino123',
    'pai': 'familia'
};

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
    configurarNavegacao();
    carregarConquistas();
    inicializarDados();
});

function inicializarDados() {
    // Garantir que dados iniciais existam
    if (!localStorage.getItem(CHAVES_DB.usuarios)) {
        repositorio.set(CHAVES_DB.usuarios, []);
    }
    if (!localStorage.getItem(CHAVES_DB.conquistas)) {
        salvarConquistas();
    }
}

function verificarAutenticacao() {
    const dadosSessao = localStorage.getItem('matemagica-sessao');
    
    if (dadosSessao) {
        try {
            const sessao = JSON.parse(dadosSessao);
            const agora = Date.now();
            
            if (sessao.expira > agora) {
                estadoJogo.usuarioAtual = sessao.usuario;
                estadoJogo.estaAutenticado = true;
                carregarProgressoUsuario();
                carregarHistoricoUsuario();
                window.location.hash = 'home';
                return;
            } else {
                localStorage.removeItem('matemagica-sessao');
            }
        } catch (erro) {
            console.error('Erro ao verificar sessão:', erro);
            localStorage.removeItem('matemagica-sessao');
        }
    }
    
    estadoJogo.estaAutenticado = false;
    window.location.hash = 'login';
}

function realizarLogin() {
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;
    const divErro = document.getElementById('erro-login');
    
    divErro.classList.add('hidden');
    
    if (!usuario || !senha) {
        mostrarErroLogin('Por favor, preencha todos os campos!');
        return;
    }
    
    if (credenciaisValidas[usuario] && credenciaisValidas[usuario] === senha) {
        estadoJogo.usuarioAtual = usuario;
        estadoJogo.estaAutenticado = true;
        estadoJogo.tempoInicioSessao = Date.now();
        
        const dadosSessao = {
            usuario: usuario,
            expira: Date.now() + (24 * 60 * 60 * 1000)
        };
        localStorage.setItem('matemagica-sessao', JSON.stringify(dadosSessao));
        
        carregarProgressoUsuario();
        carregarHistoricoUsuario();
        
        const nomePerfil = perfisUsuario[usuario] || usuario;
        
        // Toast: Login bem-sucedido - mensagem de boas-vindas
        mostrarToastSucesso(`🎉 Bem-vindo(a), ${nomePerfil}! Vamos aprender matemática!`);
        
        setTimeout(() => {
            window.location.hash = 'home';
            atualizarExibicaoUsuario();
        }, 1500);
        
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
    
    const formulario = document.querySelector('.login-form');
    formulario.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        formulario.style.animation = '';
    }, 500);
}

function realizarLogout() {
    // Toast: Confirmação de logout - toast interativo com botões
    const idToast = `toast-${++contadorToast}`;
    mostrarToast(`
        <div style="text-align: center;">
            <div style="margin-bottom: 10px;">🚪 Tem certeza que deseja sair?</div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirmar-logout-sim" style="background: #51cf66; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">✅ Sim</button>
                <button id="confirmar-logout-nao" style="background: #ff6b6b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">❌ Não</button>
            </div>
        </div>
    `, 'warning', 10000); // mudar tempo de toast

    setTimeout(() => {
        const botaoConfirmarSim = document.getElementById('confirmar-logout-sim');
        const botaoConfirmarNao = document.getElementById('confirmar-logout-nao');

        if (botaoConfirmarSim) {
            botaoConfirmarSim.addEventListener('click', () => {
                confirmarLogout();
                esconderToast(idToast);
            });
        }

        if (botaoConfirmarNao) {
            botaoConfirmarNao.addEventListener('click', () => {
                esconderToast(idToast);
            });
        }
    }, 100);
}

function confirmarLogout() {
    registrarSessao();
    salvarProgressoUsuario();
    
    localStorage.removeItem('matemagica-sessao');
    
    estadoJogo.usuarioAtual = null;
    estadoJogo.estaAutenticado = false;
    estadoJogo.pontuacao = 0;
    estadoJogo.nivel = 1;
    
    limparTodosToasts();
    
    // Toast: Logout confirmado - confirmação de saída do sistema
    mostrarToastSucesso('👋 Logout realizado com sucesso! Até logo!');
    
    setTimeout(() => {
        window.location.hash = 'login';
    }, 1500);
}

// ===== SISTEMA DE CADASTRO =====
function mostrarTelaCadastro() {
    window.location.hash = 'register';
}

function mostrarTelaLogin() {
    window.location.hash = 'login';
}

function limparFormularioCadastro() {
    document.getElementById('usuario-cadastro').value = '';
    document.getElementById('senha-cadastro').value = '';
    document.getElementById('confirmar-senha').value = '';
    document.getElementById('perfil-cadastro').value = '';
    document.getElementById('erro-cadastro').classList.add('hidden');
    document.getElementById('sucesso-cadastro').classList.add('hidden');
}

function realizarCadastro() {
    const usuario = document.getElementById('usuario-cadastro').value.trim();
    const senha = document.getElementById('senha-cadastro').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const perfil = document.getElementById('perfil-cadastro').value;
    
    const divErro = document.getElementById('erro-cadastro');
    const divSucesso = document.getElementById('sucesso-cadastro');
    
    divErro.classList.add('hidden');
    divSucesso.classList.add('hidden');
    
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
    
    if (credenciaisValidas[usuario]) {
        mostrarErroCadastro('Este nome de usuário já está em uso!');
        return;
    }
    
    credenciaisValidas[usuario] = senha;
    perfisUsuario[usuario] = obterNomeExibicaoPerfil(perfil);
    
    salvarUsuariosCadastrados();
    
    // Toast: Cadastro bem-sucedido - confirmação de criação de conta
    mostrarToastSucesso('✅ Conta criada com sucesso! Redirecionando para o login...');
    
    setTimeout(() => {
        window.location.hash = 'login';
        document.getElementById('usuario').value = usuario;
        
        // Toast: Instrução pós-cadastro - orientação para o próximo passo
        mostrarToastInfo(`💡 Agora faça login com sua nova conta: ${usuario}`);
    }, 2000);
}

function mostrarErroCadastro(mensagem) {
    const divErro = document.getElementById('erro-cadastro');
    divErro.textContent = '❌ ' + mensagem;
    divErro.classList.remove('hidden');
    
    const formulario = document.querySelector('.register-form');
    formulario.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        formulario.style.animation = '';
    }, 500);
}

function obterNomeExibicaoPerfil(perfil) {
    const perfis = {
        'crianca': 'Criança',
        'professor': 'Professor(a)',
        'pai': 'Responsável'
    };
    return perfis[perfil] || 'Usuário';
}

// ===== SISTEMA DE PERSISTÊNCIA =====
function salvarUsuariosCadastrados() {
    const usuariosCadastrados = {};
    
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
        }
    }
}

function salvarHistoricoUsuario() {
    if (estadoJogo.usuarioAtual) {
        localStorage.setItem(`matemagica-historico-${estadoJogo.usuarioAtual}`, JSON.stringify(estadoJogo.historico));
    }
}

function carregarHistoricoUsuario() {
    if (estadoJogo.usuarioAtual) {
        const dadosHistorico = localStorage.getItem(`matemagica-historico-${estadoJogo.usuarioAtual}`);
        
        if (dadosHistorico) {
            try {
                estadoJogo.historico = JSON.parse(dadosHistorico);
            } catch (erro) {
                console.error('Erro ao carregar histórico:', erro);
            }
        }
    }
}

function salvarConquistas() {
    localStorage.setItem(CHAVES_DB.conquistas, JSON.stringify(conquistas));
}

function carregarConquistas() {
    const dadosConquistas = localStorage.getItem(CHAVES_DB.conquistas);
    
    if (dadosConquistas) {
        try {
            const conquistasSalvas = JSON.parse(dadosConquistas);
            Object.assign(conquistas, conquistasSalvas);
        } catch (erro) {
            console.error('Erro ao carregar conquistas:', erro);
        }
    }
}

// ===== SISTEMA DE JOGOS COM VERIFICAÇÃO DE CONFLITOS =====
function requererAutenticacao() {
    if (!estadoJogo.estaAutenticado) {
        // Toast: Erro de autenticação - usuário não logado tentando acessar recurso
        mostrarToastErro('🔒 Você precisa fazer login primeiro!');
        window.location.hash = 'login';
        return false;
    }
    return true;
}

function irParaHome() {
    if (!requererAutenticacao()) return;
    
    window.location.hash = 'home';
    atualizarExibicaoPontuacao();
    salvarProgressoUsuario();
}

function iniciarJogo(tipoJogo) {
    if (!requererAutenticacao()) return;
    
    // Verificação de conflito (evitar múltiplos jogos)
    if (jogoAtivo && jogoAtivo !== tipoJogo) {
        // Toast: Aviso de conflito - tentativa de iniciar jogo enquanto outro está ativo
        mostrarToastAviso('Finalize o jogo atual antes de iniciar outro!');
        return;
    }
    
    jogoAtivo = tipoJogo;
    estadoJogo.jogoAtual = tipoJogo;
    window.location.hash = tipoJogo;
    gerarProblema(tipoJogo);
    atualizarPontuacaoJogo(tipoJogo);
    
    const nomesJogos = {
        'adicao': 'Adição Mágica',
        'subtracao': 'Subtração Aventura', 
        'multiplicacao': 'Multiplicação Mistério'
    };
    
    // Toast: Início de jogo - mensagem de boas-vindas ao jogo específico
    mostrarToastSucesso(`🎮 Bem-vindo ao ${nomesJogos[tipoJogo]}! Boa sorte!`, tipoJogo);
    
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

function gerarProblema(tipoJogo) {
    let num1, num2;
    const nivel = estadoJogo.nivel;
    
    switch (tipoJogo) {
        case 'adicao':
            num1 = Math.floor(Math.random() * (10 + nivel * 2)) + 1;
            num2 = Math.floor(Math.random() * (10 + nivel * 2)) + 1;
            estadoJogo.problemas.adicao = { num1, num2, resposta: num1 + num2 };
            document.getElementById('numero1-adicao').textContent = num1;
            document.getElementById('numero2-adicao').textContent = num2;
            break;
            
        case 'subtracao':
            num1 = Math.floor(Math.random() * (15 + nivel * 3)) + 5;
            num2 = Math.floor(Math.random() * num1) + 1;
            estadoJogo.problemas.subtracao = { num1, num2, resposta: num1 - num2 };
            document.getElementById('numero1-subtracao').textContent = num1;
            document.getElementById('numero2-subtracao').textContent = num2;
            break;
            
        case 'multiplicacao':
            num1 = Math.floor(Math.random() * (8 + nivel)) + 1;
            num2 = Math.floor(Math.random() * (8 + nivel)) + 1;
            estadoJogo.problemas.multiplicacao = { num1, num2, resposta: num1 * num2 };
            document.getElementById('numero1-multiplicacao').textContent = num1;
            document.getElementById('numero2-multiplicacao').textContent = num2;
            break;
    }
}

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
    
    // Atualizar estatísticas
    estadoJogo.historico.estatisticas.totalRespostas++;
    
    if (respostaUsuario === respostaCorreta) {
        feedback.textContent = '🎉 Parabéns! Resposta correta!';
        feedback.className = 'feedback correct';
        
        estadoJogo.historico.estatisticas.respostasCorretas++;
        
        const pontos = tipoJogo === 'multiplicacao' ? 15 : (tipoJogo === 'subtracao' ? 12 : 10);
        estadoJogo.pontuacao += pontos;
        
        const novoNivel = Math.floor(estadoJogo.pontuacao / 100) + 1;
        if (novoNivel > estadoJogo.nivel) {
            estadoJogo.nivel = novoNivel;
            feedback.textContent += ` 🆙 Você subiu para o nível ${estadoJogo.nivel}!`;
            
            // Toast: Subiu de nível - celebração de progresso
            mostrarToastSucesso(`🎊 Parabéns! Você subiu para o nível ${estadoJogo.nivel}!`, tipoJogo);
            
            // Verificar conquista de mestre
            conquistas.mestre.progresso = estadoJogo.nivel;
            verificarConquistas();
        } else {
            // Toast: Resposta correta - feedback positivo de acerto
            mostrarToastSucesso(`🎯 Resposta correta! +${pontos} pontos!`, tipoJogo);
        }
        
        // Atualizar conquistas
        conquistas.iniciante.progresso++;
        if (tipoJogo === 'adicao') {
            conquistas.adicaoExpert.progresso++;
        }
        verificarConquistas();
        
        atualizarExibicaoPontuacao();
        atualizarPontuacaoJogo(tipoJogo);
        salvarProgressoUsuario();
        salvarHistoricoUsuario();
        
    } else {
        feedback.textContent = `❌ Ops! A resposta correta é ${respostaCorreta}. Tente novamente!`;
        feedback.className = 'feedback incorrect';
        
        // Toast: Resposta incorreta - feedback educativo com resposta correta
        mostrarToastErro(`💭 A resposta correta era ${respostaCorreta}. Continue tentando!`, tipoJogo);
    }
    
    feedback.classList.remove('hidden');
    botaoVerificar.classList.add('hidden');
    botaoContinuar.classList.remove('hidden');
}

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

function finalizarJogo() {
    jogoAtivo = null;
    estadoJogo.jogoAtual = null;
}

// ===== SISTEMA DE CONQUISTAS =====
function verificarConquistas() {
    Object.keys(conquistas).forEach(chave => {
        const conquista = conquistas[chave];
        if (!conquista.obtida && conquista.progresso >= conquista.meta) {
            conquista.obtida = true;
            
            // Toast: Conquista desbloqueada - celebração de nova conquista
            mostrarToastSucesso(`🎉 Conquista desbloqueada: ${conquista.nome}!`);
            salvarConquistas();
            
            // Adicionar ao histórico de conquistas
            if (!estadoJogo.historico.conquistas.includes(conquista.id)) {
                estadoJogo.historico.conquistas.push(conquista.id);
                salvarHistoricoUsuario();
            }
        }
    });
}

// ===== SISTEMA DE HISTÓRICO E ESTATÍSTICAS =====
function registrarSessao() {
    if (estadoJogo.tempoInicioSessao) {
        const duracao = Date.now() - estadoJogo.tempoInicioSessao;
        const sessao = {
            data: new Date().toISOString(),
            jogo: estadoJogo.jogoAtual,
            pontuacao: estadoJogo.pontuacao,
            nivel: estadoJogo.nivel,
            duracao: duracao
        };
        
        estadoJogo.historico.sessoes.push(sessao);
        estadoJogo.historico.estatisticas.jogosCompletos++;
        salvarHistoricoUsuario();
    }
}

function carregarHistoricoJogos() {
    // Implementar exibição do histórico na tela home
    const containerHistorico = document.getElementById('historico-jogos');
    if (containerHistorico && estadoJogo.historico.sessoes.length > 0) {
        const ultimasSessoes = estadoJogo.historico.sessoes.slice(-5).reverse();
        containerHistorico.innerHTML = `
            <h3>📊 Últimas Sessões</h3>
            ${ultimasSessoes.map(sessao => `
                <div class="sessao-item">
                    <span>${new Date(sessao.data).toLocaleDateString()}</span>
                    <span>${sessao.jogo}</span>
                    <span>+${sessao.pontuacao} pts</span>
                </div>
            `).join('')}
        `;
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

function atualizarExibicaoPontuacao() {
    const elementoPontuacao = document.getElementById('pontuacao');
    const elementoNivel = document.getElementById('nivel');
    
    if (elementoPontuacao) elementoPontuacao.textContent = estadoJogo.pontuacao;
    if (elementoNivel) elementoNivel.textContent = estadoJogo.nivel;
}

function atualizarPontuacaoJogo(tipoJogo) {
    const elementoPontuacaoJogo = document.getElementById('pontuacao-' + tipoJogo);
    if (elementoPontuacaoJogo) {
        elementoPontuacaoJogo.textContent = estadoJogo.pontuacao;
    }
}

// ===== EVENT LISTENERS PARA ENTER =====
document.addEventListener('DOMContentLoaded', function() {
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

// ===== BACKUP AUTOMÁTICO =====
function fazerBackup() {
    const backup = {
        data: new Date().toISOString(),
        estado: estadoJogo,
        usuario: estadoJogo.usuarioAtual
    };
    
    localStorage.setItem('matemagica_backup', JSON.stringify(backup));
}

function restaurarBackup() {
    const backup = localStorage.getItem('matemagica_backup');
    if (backup) {
        try {
            const dados = JSON.parse(backup);
            Object.assign(estadoJogo, dados.estado);
            
            // Toast: Backup restaurado - confirmação de recuperação de dados
            mostrarToastSucesso('Progresso restaurado do backup!');
        } catch (erro) {
            console.error('Erro ao restaurar backup:', erro);
        }
    }
}

// Fazer backup a cada 5 minutos
setInterval(fazerBackup, 5 * 60 * 1000);