/**
 * Modal Criar Rifa - Envio do Formulário
 * Responsável por: enviar formulário ao backend e gerenciar respostas
 */
document.addEventListener("modalCriarRifa:enviarFormulario", (event) => {
    console.log("📤 Enviando formulário...");

    const form = event.detail.form;
    if (!form) {
        console.error("❌ Formulário não encontrado no evento");
        return;
    }

    enviarFormulario(form);
});

// ====================================
// FUNÇÃO PRINCIPAL DE ENVIO
// ====================================
function enviarFormulario(form) {
    const formData = new FormData(form);
    
    // Obter imagens recortadas do módulo de imagem
    let imagensRecortadas = [];
    if (window.ImagemUtils && window.ImagemUtils.obterImagensRecortadas) {
        imagensRecortadas = window.ImagemUtils.obterImagensRecortadas();
    }
    
    console.log('📸 Imagens recortadas encontradas:', imagensRecortadas.length);
    imagensRecortadas.forEach((img, idx) => {
        console.log(`  ${idx + 1}. ${img.nome} - Tamanho: ${img.data.length} chars`);
    });
    
    // Adicionar quantidade de imagens
    formData.set('quantidade_imagens', imagensRecortadas.length);
    
    // Adicionar dados das imagens recortadas
    imagensRecortadas.forEach((imagem, index) => {
        formData.append(`imagem_${index}`, imagem.data);
        formData.append(`imagem_nome_${index}`, imagem.nome);
    });
    
    console.log('📤 FormData preparado com quantidade_imagens:', imagensRecortadas.length);
    
    // Mostrar loading no botão
    const botaoSubmit = form.querySelector('.botao-salvar-rifa');
    const textoOriginal = botaoSubmit ? botaoSubmit.textContent : 'Criar Rifa';
    const btnFechar = document.getElementById("fechar-modal-rifa");
    
    if (botaoSubmit) {
        botaoSubmit.textContent = 'Enviando...';
        botaoSubmit.disabled = true;
    }
    
    if (btnFechar) {
        btnFechar.style.pointerEvents = 'none';
    }

    fetch('../php/salvar-rifa.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        return response.text().then(text => {
            try {
                const data = JSON.parse(text);
                data.status = response.status;
                return data;
            } catch (e) {
                throw new Error(`Resposta não é JSON: ${text.substring(0, 100)}`);
            }
        });
    })
    .then(data => {
        console.log('Resposta do servidor:', data);
        
        if (data.tipo === 'sucesso') {
            // ✅ Sucesso
            mostrarSucesso(data.mensagem || 'Rifa criada com sucesso!');
            setTimeout(() => {
                window.location.href = 'main.html?reload=' + Date.now();
            }, 1500);
        } 
        else if (data.tipo === 'validacao') {
            // ⚠️ Erros de validação
            if (data.erros && Array.isArray(data.erros)) {
                exibirErrosBackend(data.erros);
            } else {
                exibirErroGeral('Erro de validação desconhecido.');
            }
            restaurarBotoes();
        }
        else if (data.tipo === 'erro_geral') {
            // ❌ Erro geral
            exibirErroGeral(data.mensagem || 'Erro no servidor.');
            restaurarBotoes();
        }
        else {
            // ❓ Resposta desconhecida
            exibirErroGeral('Resposta inválida do servidor.');
            restaurarBotoes();
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        exibirErroGeral(error.message || 'Erro ao conectar com o servidor. Verifique sua conexão.');
        restaurarBotoes();
    });

    function restaurarBotoes() {
        if (botaoSubmit) {
            botaoSubmit.textContent = textoOriginal;
            botaoSubmit.disabled = false;
        }
        
        if (btnFechar) {
            btnFechar.style.pointerEvents = 'auto';
        }
    }
}

// ====================================
// FUNÇÕES AUXILIARES DE FEEDBACK
// ====================================
function exibirErroGeral(mensagem) {
    const erroGeralDiv = document.getElementById('erro-geral');
    if (!erroGeralDiv) return;
    
    erroGeralDiv.textContent = mensagem;
    erroGeralDiv.style.display = 'block';
    
    const form = document.getElementById("form-criar-rifa");
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
        erroGeralDiv.style.display = 'none';
    }, 10000);
}

function exibirErrosBackend(erros) {
    if (!erros || !Array.isArray(erros)) {
        console.error('Erros não é um array:', erros);
        exibirErroGeral('Erro de validação do servidor.');
        return;
    }
    
    console.log('Erros recebidos do backend:', erros);
    console.log('Erros detalhados:', JSON.stringify(erros, null, 2));
    
    if (window.ValidacaoUtils) {
        window.ValidacaoUtils.limparErros();
    }
    
    const mensagensErro = {
        'tipo_quantidade_dezenas': 'Selecione a quantidade de dezenas',
        'valor_dezena': 'O valor da dezena deve ser maior que zero',
        'nome_premio': 'O nome da rifa é obrigatório',
        'valor_premio': 'O valor do prêmio deve ser maior que zero',
        'quantidade_premios': 'Selecione a quantidade de prêmios',
        'nome_premio_um': 'O nome do 1º prêmio é obrigatório',
        'nome_premio_dois': 'O nome do 2º prêmio é obrigatório',
        'tipo_sorteio': 'Selecione o tipo de sorteio',
        'data_sorteio': 'A data do sorteio não pode ser no passado',
        'horario_sorteio': 'Selecione o horário do sorteio',
        'visibilidade': 'Selecione a visibilidade',
        'tema_rifa': 'Selecione o tema da rifa',
        'modelo_pagamento': 'Selecione o modelo de pagamento',
        'imagem': 'A imagem é obrigatória (PNG ou JPG, máximo 1.5MB)'
    };
    
    let errosParaExibir = [];
    const form = document.getElementById("form-criar-rifa");
    
    erros.forEach(campoErro => {
        if (!campoErro) return;
        
        if (campoErro === 'imagem') {
            const erroImagemDiv = document.getElementById('erro-imagem');
            const uploadArea = document.getElementById('uploadArea');
            
            if (erroImagemDiv) {
                erroImagemDiv.textContent = mensagensErro[campoErro] || 'Erro na imagem';
                erroImagemDiv.style.display = 'block';
            }
            
            if (uploadArea) {
                uploadArea.style.borderColor = '#d32f2f';
                uploadArea.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
            }
            
            errosParaExibir.push(mensagensErro[campoErro] || 'Imagem inválida');
        } else {
            const elementoCampo = document.getElementById(campoErro);
            
            if (elementoCampo) {
                elementoCampo.style.borderColor = '#d32f2f';
                elementoCampo.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                
                let mensagemErro = mensagensErro[campoErro] || `O campo "${campoErro}" é inválido`;
                
                if (window.FormUtils) {
                    window.FormUtils.adicionarMensagemErroCampo(elementoCampo, mensagemErro);
                }
                
                errosParaExibir.push(mensagemErro);
            } else {
                console.warn('Elemento não encontrado para campo:', campoErro);
                errosParaExibir.push(`Erro no campo ${campoErro}`);
            }
        }
    });
    
    if (errosParaExibir.length > 0) {
        exibirErroGeral(`Por favor, corrija os seguintes erros: ${errosParaExibir.join(', ')}`);
    }
}

function mostrarSucesso(mensagem) {
    const sucessoDiv = document.createElement('div');
    sucessoDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    sucessoDiv.textContent = mensagem;
    document.body.appendChild(sucessoDiv);
    
    setTimeout(() => {
        sucessoDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => sucessoDiv.remove(), 300);
    }, 3000);
}

// Adicionar CSS de animações (se ainda não existir)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
if (!document.head.querySelector('style[data-submit]')) {
    style.setAttribute('data-submit', 'true');
    document.head.appendChild(style);
}

console.log("✅ Módulo de submit inicializado");
