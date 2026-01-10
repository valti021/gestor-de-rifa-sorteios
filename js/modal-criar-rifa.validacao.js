/**
 * Modal Criar Rifa - Validação de Formulário
 * Responsável por: validar campos do frontend e exibir erros
 */
document.addEventListener("modalCriarRifa:carregado", () => {
    console.log("✔️ Inicializando validação de formulário...");

    const form = document.getElementById("form-criar-rifa");
    if (!form) {
        console.error("❌ Formulário não encontrado");
        return;
    }

    // ====================================
    // LISTENERS DO FORMULÁRIO
    // ====================================
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Limpar erros anteriores
        limparErros();
        
        // Validar todos os campos
        const erros = validarFormulario();
        
        if (erros.length > 0) {
            exibirErros(erros);
            return;
        }

        // Se passou em todas as validações, emitir evento para enviar
        document.dispatchEvent(new CustomEvent("modalCriarRifa:enviarFormulario", {
            detail: { form }
        }));
    });

    // ====================================
    // FUNÇÃO PRINCIPAL DE VALIDAÇÃO
    // ====================================
    function validarFormulario() {
        const erros = [];

        // Campos obrigatórios
        const camposObrigatorios = [
            'tipo_quantidade_dezenas',
            'valor_dezena',
            'nome_premio_um',
            'valor_premio',
            'quantidade_premios',
            'tipo_sorteio',
            'data_sorteio',
            'horario_sorteio',
            'visibilidade',
            'modelo_pagamento'
        ];

        camposObrigatorios.forEach(id => {
            const campo = document.getElementById(id);
            if (campo && (campo.value === null || campo.value === '' || campo.value === undefined)) {
                campo.style.borderColor = '#d32f2f';
                campo.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                const label = campo.previousElementSibling ? 
                    campo.previousElementSibling.textContent.replace(':', '').trim() : id;
                erros.push(`O campo "${label}" é obrigatório.`);
            }
        });

        // ===============================
        // Validar tamanho do nome da rifa
        // ===============================
        const nomeRifaInput = document.getElementById('nome_rifa');
        if (nomeRifaInput && nomeRifaInput.value) {
            if (nomeRifaInput.value.length > 25) {
                nomeRifaInput.style.borderColor = '#d32f2f';
                nomeRifaInput.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                erros.push('O nome da rifa não pode ter mais de 25 caracteres.');
            }
        }

        // ==================================
        // Validar tamanho da descrição da rifa
        // ==================================
        const descricaoInput = document.getElementById('descricao');
        if (descricaoInput && descricaoInput.value) {
            if (descricaoInput.value.length > 100) {
                descricaoInput.style.borderColor = '#d32f2f';
                descricaoInput.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                erros.push('A descrição da rifa não pode ter mais de 100     caracteres.');
            }
        }

        // Validar 2º prêmio se selecionado
        const quantidadePremiosInput = document.getElementById('quantidade_premios');
        if (quantidadePremiosInput && quantidadePremiosInput.value === '2') {
            const nomePremioDoissInput = document.getElementById('nome_premio_dois');
            if (nomePremioDoissInput && (nomePremioDoissInput.value === null || nomePremioDoissInput.value === '' || nomePremioDoissInput.value === undefined)) {
                nomePremioDoissInput.style.borderColor = '#d32f2f';
                nomePremioDoissInput.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                erros.push('O campo "Nome do 2º prêmio" é obrigatório quando 2 prêmios são selecionados.');
            }
        }

        // Validar imagem
        const imagemInput = document.getElementById('imagem');
        const uploadArea = document.getElementById('uploadArea');
        if (!imagemInput || !imagemInput.files || imagemInput.files.length === 0) {
            const erroImagemDiv = document.getElementById('erro-imagem');
            if (erroImagemDiv) {
                erroImagemDiv.textContent = 'Selecione uma imagem para a rifa.';
                erroImagemDiv.style.display = 'block';
            }
            if (uploadArea) {
                uploadArea.style.borderColor = '#d32f2f';
                uploadArea.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
            }
            erros.push('A imagem é obrigatória.');
        }

        // Validar valores numéricos
        const valorDezenaInput = document.getElementById("valor_dezena");
        const valorDezena = valorDezenaInput ? parseFloat(valorDezenaInput.value) : 0;
        if (valorDezena <= 0) {
            erros.push('O valor da dezena deve ser maior que zero.');
        }

        const valorPremioInput = document.getElementById("valor_premio");
        const valorPremio = valorPremioInput ? parseFloat(valorPremioInput.value) : 0;
        if (valorPremio <= 0) {
            erros.push('O valor do prêmio deve ser maior que zero.');
        }

        // Validar data
        const dataInput = document.getElementById('data_sorteio');
        if (dataInput && dataInput.value) {
            const dataSorteio = new Date(dataInput.value);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            if (dataSorteio < hoje) {
                dataInput.style.borderColor = '#d32f2f';
                dataInput.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                erros.push('A data do sorteio não pode ser no passado.');
            }
        }

        return erros;
    }




    function exibirErros(erros) {
        const erroGeralDiv = document.getElementById('erro-geral');
        if (!erroGeralDiv) return;
        
        const mensagem = erros.join(' ');
        erroGeralDiv.textContent = mensagem;
        erroGeralDiv.style.display = 'block';
        
        // Rolar para o topo do formulário
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Auto-remover após 10 segundos
        setTimeout(() => {
            erroGeralDiv.style.display = 'none';
        }, 10000);
    }

    function limparErros() {
        const erroGeralDiv = document.getElementById('erro-geral');
        if (erroGeralDiv) erroGeralDiv.style.display = 'none';

        const erroImagemDiv = document.getElementById('erro-imagem');
        if (erroImagemDiv) erroImagemDiv.style.display = 'none';
        
        // Limpar estilo da área de upload
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.style.borderColor = '';
            uploadArea.style.boxShadow = '';
        }
        
        // Limpar estilos de erro dos campos
        form.querySelectorAll('input, select, textarea').forEach(campo => {
            campo.style.borderColor = '';
            campo.style.boxShadow = '';
            
            if (window.FormUtils) {
                window.FormUtils.removerMensagemErroCampo(campo);
            }
        });
    }

    // Expor funções globalmente
    window.ValidacaoUtils = {
        validarFormulario,
        exibirErros,
        limparErros
    };

    // Adicionar CSS de animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .mensagem-erro-campo {
            color: #d32f2f;
            font-size: 12px;
            font-weight: 600;
            margin-top: 5px;
            font-family: 'Poppins', sans-serif;
            animation: fadeIn 0.3s ease;
        }
        
        .mensagem-erro-campo:before {
            content: "⚠ ";
            margin-right: 4px;
        }
    `;
    if (!document.head.querySelector('style[data-validacao]')) {
        style.setAttribute('data-validacao', 'true');
        document.head.appendChild(style);
    }

    console.log("✅ Validação de formulário inicializada");
});
