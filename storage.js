/* =========================
   storage.js – Sistema de Reserva Matemagica
   Repositório local + dados iniciais
   ========================= */

/** Chaves usadas no localStorage (schema do Matemagica) */
const CHAVES_DB = {
    usuarios: 'matemagica_usuarios',
    progresso: 'matemagica_progresso',
    historico: 'matemagica_historico',
    conquistas: 'matemagica_conquistas',
    jogos: 'matemagica_jogos',
    sessoes: 'matemagica_sessoes'
};

/** Repositório minimalista para manipular arrays no localStorage */
const repositorio = {
    get(chave) {
        // Lê a coleção; se não existir, retorna array vazio
        return JSON.parse(localStorage.getItem(chave) || '[]');
    },
    
    set(chave, arr) {
        localStorage.setItem(chave, JSON.stringify(arr));
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
    },
    
    buscarPorId(chave, id) {
        const arr = this.get(chave);
        return arr.find(x => x.id === id) || null;
    },
    
    removerPorId(chave, id) {
        const arr = this.get(chave);
        const indice = arr.findIndex(x => x.id === id);
        if (indice >= 0) {
            const removido = arr.splice(indice, 1)[0];
            this.set(chave, arr);
            return removido;
        }
        return null;
    },
    
    buscarPorUsuario(chave, usuarioId) {
        const arr = this.get(chave);
        return arr.filter(x => x.usuarioId === usuarioId);
    },
    
    limparTodos() {
        Object.values(CHAVES_DB).forEach(chave => {
            localStorage.removeItem(chave);
        });
    }
};

/** Dados iniciais (seed) — executa uma única vez por navegador */
function seedSeNecessario() {
    // Verifica se já existe algum dado
    if (!localStorage.getItem(CHAVES_DB.usuarios)) {
        console.log('🌱 Inicializando dados do Matemagica...');
        
        // Usuários padrão
        repositorio.set(CHAVES_DB.usuarios, [
            { 
                id: 'admin', 
                nome: 'Administrador', 
                perfil: 'admin',
                dataCriacao: new Date().toISOString(),
                status: 'ativo'
            },
            { 
                id: 'crianca', 
                nome: 'João Silva', 
                perfil: 'crianca',
                dataCriacao: new Date().toISOString(),
                status: 'ativo'
            },
            { 
                id: 'professor', 
                nome: 'Maria Santos', 
                perfil: 'professor',
                dataCriacao: new Date().toISOString(),
                status: 'ativo'
            },
            { 
                id: 'pai', 
                nome: 'Carlos Oliveira', 
                perfil: 'pai',
                dataCriacao: new Date().toISOString(),
                status: 'ativo'
            }
        ]);
    }
    
    if (!localStorage.getItem(CHAVES_DB.jogos)) {
        // Configurações dos jogos
        repositorio.set(CHAVES_DB.jogos, [
            {
                id: 'adicao',
                nome: 'Adição Mágica',
                descricao: 'Some números e ganhe estrelas!',
                dificuldade: 'iniciante',
                pontosBase: 10,
                nivelMinimo: 1,
                status: 'ativo'
            },
            {
                id: 'subtracao',
                nome: 'Subtração Aventura',
                descricao: 'Descubra o resultado das subtrações!',
                dificuldade: 'iniciante',
                pontosBase: 12,
                nivelMinimo: 1,
                status: 'ativo'
            },
            {
                id: 'multiplicacao',
                nome: 'Multiplicação Mistério',
                descricao: 'Desvende os segredos da multiplicação!',
                dificuldade: 'intermediario',
                pontosBase: 15,
                nivelMinimo: 2,
                status: 'ativo'
            }
        ]);
    }
    
    if (!localStorage.getItem(CHAVES_DB.conquistas)) {
        // Sistema de conquistas
        repositorio.set(CHAVES_DB.conquistas, [
            {
                id: 'iniciante',
                nome: '🎮 Primeiros Passos',
                descricao: 'Complete 10 problemas',
                tipo: 'progresso',
                categoria: 'geral',
                progresso: 0,
                meta: 10,
                pontos: 50,
                obtida: false,
                icone: '🎮'
            },
            {
                id: 'mestre',
                nome: '🏆 Mestre da Matemática',
                descricao: 'Alcance o nível 3',
                tipo: 'nivel',
                categoria: 'progresso',
                progresso: 0,
                meta: 3,
                pontos: 100,
                obtida: false,
                icone: '🏆'
            },
            {
                id: 'velocidade',
                nome: '⚡ Resposta Rápida',
                descricao: 'Responda 5 problemas em menos de 10 segundos cada',
                tipo: 'velocidade',
                categoria: 'habilidade',
                progresso: 0,
                meta: 5,
                pontos: 75,
                obtida: false,
                icone: '⚡'
            },
            {
                id: 'adicaoExpert',
                nome: '➕ Expert em Adição',
                descricao: 'Resolva 20 problemas de adição',
                tipo: 'especializacao',
                categoria: 'jogos',
                progresso: 0,
                meta: 20,
                pontos: 80,
                obtida: false,
                icone: '➕'
            },
            {
                id: 'subtracaoExpert',
                nome: '➖ Expert em Subtração',
                descricao: 'Resolva 20 problemas de subtração',
                tipo: 'especializacao',
                categoria: 'jogos',
                progresso: 0,
                meta: 20,
                pontos: 80,
                obtida: false,
                icone: '➖'
            },
            {
                id: 'multiplicacaoExpert',
                nome: '✖️ Expert em Multiplicação',
                descricao: 'Resolva 20 problemas de multiplicação',
                tipo: 'especializacao',
                categoria: 'jogos',
                progresso: 0,
                meta: 20,
                pontos: 100,
                obtida: false,
                icone: '✖️'
            }
        ]);
    }
    
    // Inicializar coleções vazias se não existirem
    if (!localStorage.getItem(CHAVES_DB.progresso)) {
        repositorio.set(CHAVES_DB.progresso, []);
    }
    
    if (!localStorage.getItem(CHAVES_DB.historico)) {
        repositorio.set(CHAVES_DB.historico, []);
    }
    
    if (!localStorage.getItem(CHAVES_DB.sessoes)) {
        repositorio.set(CHAVES_DB.sessoes, []);
    }
    
    console.log('✅ Dados do Matemagica inicializados!');
}

/** Normaliza dados antigos para compatibilidade */
function normalizarDadosAntigos() {
    console.log('🔄 Normalizando dados antigos...');
    
    // Migrar progresso de usuários do sistema antigo
    const usuarios = repositorio.get(CHAVES_DB.usuarios);
    let mudou = false;
    
    usuarios.forEach(usuario => {
        // Verificar se existe progresso no sistema antigo
        const progressoAntigo = localStorage.getItem(`matemagica-progresso-${usuario.id}`);
        if (progressoAntigo) {
            try {
                const dados = JSON.parse(progressoAntigo);
                
                // Migrar para o novo sistema
                const progressoExistente = repositorio.buscarPorId(CHAVES_DB.progresso, usuario.id);
                
                if (!progressoExistente) {
                    repositorio.push(CHAVES_DB.progresso, {
                        id: usuario.id,
                        usuarioId: usuario.id,
                        pontuacao: dados.pontuacao || 0,
                        nivel: dados.nivel || 1,
                        experiencia: dados.pontuacao || 0,
                        ultimaAtividade: dados.ultimaJogada || new Date().toISOString(),
                        dataCriacao: new Date().toISOString()
                    });
                    
                    console.log(`📊 Progresso migrado para: ${usuario.nome}`);
                }
                
                // Limpar dado antigo
                localStorage.removeItem(`matemagica-progresso-${usuario.id}`);
                mudou = true;
                
            } catch (erro) {
                console.error(`Erro ao migrar progresso de ${usuario.id}:`, erro);
            }
        }
        
        // Migrar histórico antigo
        const historicoAntigo = localStorage.getItem(`matemagica-historico-${usuario.id}`);
        if (historicoAntigo) {
            try {
                const dados = JSON.parse(historicoAntigo);
                
                // Migrar sessões
                if (dados.sessoes && Array.isArray(dados.sessoes)) {
                    dados.sessoes.forEach(sessao => {
                        repositorio.push(CHAVES_DB.sessoes, {
                            id: `sessao-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            usuarioId: usuario.id,
                            jogo: sessao.jogo,
                            pontuacao: sessao.pontuacao,
                            nivel: sessao.nivel,
                            duracao: sessao.duracao,
                            data: sessao.data,
                            tipo: 'jogo'
                        });
                    });
                }
                
                // Migrar conquistas
                if (dados.conquistas && Array.isArray(dados.conquistas)) {
                    dados.conquistas.forEach(conquistaId => {
                        const conquista = repositorio.buscarPorId(CHAVES_DB.conquistas, conquistaId);
                        if (conquista) {
                            conquista.progresso = conquista.meta; // Marcar como completa
                            conquista.obtida = true;
                            repositorio.atualizarPorId(CHAVES_DB.conquistas, conquistaId, () => conquista);
                        }
                    });
                }
                
                // Limpar dado antigo
                localStorage.removeItem(`matemagica-historico-${usuario.id}`);
                mudou = true;
                
            } catch (erro) {
                console.error(`Erro ao migrar histórico de ${usuario.id}:`, erro);
            }
        }
    });
    
    if (mudou) {
        console.log('✅ Dados antigos normalizados com sucesso!');
    }
}

/** Funções específicas para o Matemagica */

// Gerenciamento de Progresso
function obterProgressoUsuario(usuarioId) {
    return repositorio.buscarPorId(CHAVES_DB.progresso, usuarioId) || {
        id: usuarioId,
        usuarioId: usuarioId,
        pontuacao: 0,
        nivel: 1,
        experiencia: 0,
        ultimaAtividade: new Date().toISOString(),
        dataCriacao: new Date().toISOString()
    };
}

function salvarProgressoUsuario(progresso) {
    const existente = repositorio.buscarPorId(CHAVES_DB.progresso, progresso.usuarioId);
    
    if (existente) {
        return repositorio.atualizarPorId(CHAVES_DB.progresso, progresso.usuarioId, () => ({
            ...existente,
            ...progresso,
            ultimaAtividade: new Date().toISOString()
        }));
    } else {
        return repositorio.push(CHAVES_DB.progresso, {
            ...progresso,
            dataCriacao: new Date().toISOString()
        });
    }
}

function atualizarPontuacaoUsuario(usuarioId, pontos, tipoJogo = 'geral') {
    const progresso = obterProgressoUsuario(usuarioId);
    
    progresso.pontuacao += pontos;
    progresso.experiencia += pontos;
    
    // Calcular novo nível (100 pontos por nível)
    const novoNivel = Math.floor(progresso.experiencia / 100) + 1;
    if (novoNivel > progresso.nivel) {
        progresso.nivel = novoNivel;
        console.log(`🎉 ${usuarioId} subiu para o nível ${novoNivel}!`);
    }
    
    progresso.ultimaAtividade = new Date().toISOString();
    
    return salvarProgressoUsuario(progresso);
}

// Gerenciamento de Sessões
function registrarSessao(usuarioId, dadosSessao) {
    const sessao = {
        id: `sessao-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        usuarioId: usuarioId,
        data: new Date().toISOString(),
        tipo: dadosSessao.tipo || 'jogo',
        ...dadosSessao
    };
    
    return repositorio.push(CHAVES_DB.sessoes, sessao);
}

function obterSessoesUsuario(usuarioId, limite = 10) {
    const sessoes = repositorio.buscarPorUsuario(CHAVES_DB.sessoes, usuarioId);
    return sessoes
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, limite);
}

function obterEstatisticasUsuario(usuarioId) {
    const sessoes = repositorio.buscarPorUsuario(CHAVES_DB.sessoes, usuarioId);
    const sessoesJogo = sessoes.filter(s => s.tipo === 'jogo');
    
    const totalProblemas = sessoesJogo.reduce((acc, sessao) => acc + (sessao.problemasResolvidos || 0), 0);
    const problemasCorretos = sessoesJogo.reduce((acc, sessao) => acc + (sessao.problemasCorretos || 0), 0);
    const tempoTotal = sessoesJogo.reduce((acc, sessao) => acc + (sessao.duracao || 0), 0);
    
    return {
        totalSessoes: sessoesJogo.length,
        totalProblemas: totalProblemas,
        problemasCorretos: problemasCorretos,
        taxaAcerto: totalProblemas > 0 ? (problemasCorretos / totalProblemas * 100).toFixed(1) : 0,
        tempoTotalJogo: tempoTotal,
        tempoMedioSessao: sessoesJogo.length > 0 ? tempoTotal / sessoesJogo.length : 0
    };
}

// Gerenciamento de Conquistas
function obterConquistasUsuario(usuarioId) {
    const conquistas = repositorio.get(CHAVES_DB.conquistas);
    const sessoes = repositorio.buscarPorUsuario(CHAVES_DB.sessoes, usuarioId);
    
    // Calcular progresso baseado nas sessões
    return conquistas.map(conquista => {
        let progresso = 0;
        
        switch (conquista.tipo) {
            case 'progresso':
                progresso = sessoes.reduce((acc, sessao) => acc + (sessao.problemasResolvidos || 0), 0);
                break;
            case 'nivel':
                const progressoUsuario = obterProgressoUsuario(usuarioId);
                progresso = progressoUsuario.nivel;
                break;
            case 'velocidade':
                progresso = sessoes.filter(s => s.tempoMedioResposta && s.tempoMedioResposta < 10000).length;
                break;
            case 'especializacao':
                if (conquista.id.includes('adicao')) {
                    progresso = sessoes.filter(s => s.jogo === 'adicao').reduce((acc, sessao) => acc + (sessao.problemasResolvidos || 0), 0);
                } else if (conquista.id.includes('subtracao')) {
                    progresso = sessoes.filter(s => s.jogo === 'subtracao').reduce((acc, sessao) => acc + (sessao.problemasResolvidos || 0), 0);
                } else if (conquista.id.includes('multiplicacao')) {
                    progresso = sessoes.filter(s => s.jogo === 'multiplicacao').reduce((acc, sessao) => acc + (sessao.problemasResolvidos || 0), 0);
                }
                break;
        }
        
        return {
            ...conquista,
            progresso: Math.min(progresso, conquista.meta),
            obtida: progresso >= conquista.meta
        };
    });
}

function atualizarConquista(conquistaId, atualizador) {
    return repositorio.atualizarPorId(CHAVES_DB.conquistas, conquistaId, atualizador);
}

// Backup e Restauração
function criarBackup() {
    const backup = {
        data: new Date().toISOString(),
        versao: '1.0.0',
        dados: {}
    };
    
    Object.values(CHAVES_DB).forEach(chave => {
        backup.dados[chave] = repositorio.get(chave);
    });
    
    localStorage.setItem('matemagica_backup_completo', JSON.stringify(backup));
    return backup;
}

function restaurarBackup(dadosBackup) {
    if (dadosBackup.versao === '1.0.0') {
        Object.entries(dadosBackup.dados).forEach(([chave, dados]) => {
            if (Object.values(CHAVES_DB).includes(chave)) {
                repositorio.set(chave, dados);
            }
        });
        return true;
    }
    return false;
}

// Utilitários
function obterRankingUsuarios(limite = 10) {
    const progressos = repositorio.get(CHAVES_DB.progresso);
    const usuarios = repositorio.get(CHAVES_DB.usuarios);
    
    return progressos
        .map(progresso => {
            const usuario = usuarios.find(u => u.id === progresso.usuarioId);
            return {
                ...progresso,
                nome: usuario ? usuario.nome : progresso.usuarioId,
                perfil: usuario ? usuario.perfil : 'desconhecido'
            };
        })
        .sort((a, b) => b.pontuacao - a.pontuacao)
        .slice(0, limite);
}

function limparDadosUsuario(usuarioId) {
    // Remover progresso
    repositorio.removerPorId(CHAVES_DB.progresso, usuarioId);
    
    // Remover sessões
    const sessoes = repositorio.buscarPorUsuario(CHAVES_DB.sessoes, usuarioId);
    sessoes.forEach(sessao => {
        repositorio.removerPorId(CHAVES_DB.sessoes, sessao.id);
    });
    
    console.log(`🧹 Dados de ${usuarioId} removidos`);
}

/** Inicialização automática quando o DOM estiver pronto */
document.addEventListener('DOMContentLoaded', () => {
    seedSeNecessario();
    normalizarDadosAntigos();
    console.log('💾 Sistema de storage do Matemagica carregado!');
    
    // Backup automático a cada 30 minutos
    setInterval(() => {
        criarBackup();
        console.log('💾 Backup automático realizado');
    }, 30 * 60 * 1000);
});

// Exportar para uso global (se necessário)
if (typeof window !== 'undefined') {
    window.MatemagicaStorage = {
        repositorio,
        CHAVES_DB,
        seedSeNecessario,
        normalizarDadosAntigos,
        obterProgressoUsuario,
        salvarProgressoUsuario,
        atualizarPontuacaoUsuario,
        registrarSessao,
        obterSessoesUsuario,
        obterEstatisticasUsuario,
        obterConquistasUsuario,
        atualizarConquista,
        criarBackup,
        restaurarBackup,
        obterRankingUsuarios,
        limparDadosUsuario
    };
}