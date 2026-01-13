/**
 * Modal Criar Rifa - Gerenciamento do Formulário
 * Responsável por: validação de campos, mostrar/ocultar campos dinâmicos
 */
document.addEventListener("modalCriarRifa:carregado", () => {
    console.log("📋 Inicializando gerenciamento de formulário...");

    const form = document.getElementById("form-criar-rifa");
    if (!form) {
        console.error("❌ Formulário não encontrado");
        return;
    }

    // ====================================
    // GERENCIAMENTO DE CAMPO PIX
    // ====================================
    const modeloPagamento = document.getElementById("modelo_pagamento");
    if (modeloPagamento) {
        modeloPagamento.addEventListener("change", function () {
            const campoPix = document.getElementById("campo-pix");
            const chavePixInput = document.getElementById("chave_pix");

            if (this.value === "Pix") {
                if (campoPix) campoPix.style.display = "block";
            } else {
                if (campoPix) campoPix.style.display = "none";
                if (chavePixInput) chavePixInput.value = "";
            }
        });
    }

    // ====================================
    // GERENCIAMENTO DE QUANTIDADE DE PRÊMIOS
    // ====================================
    const quantidadePremios = document.getElementById("quantidade_premios");
    const campoPremiosDois = document.getElementById("campo-premio-dois");
    const nomePremiosDois = document.getElementById("nome_premio_dois");

    if (quantidadePremios) {
        quantidadePremios.addEventListener("change", function () {
            if (this.value === "2") {
                // Mostrar o 2º prêmio
                if (campoPremiosDois) campoPremiosDois.style.display = "block";
                if (nomePremiosDois) nomePremiosDois.setAttribute("required", "required");
            } else {
                // Ocultar o 2º prêmio
                if (campoPremiosDois) campoPremiosDois.style.display = "none";
                if (nomePremiosDois) {
                    nomePremiosDois.removeAttribute("required");
                    nomePremiosDois.value = "";
                }
            }
        });
    }

    // ====================================
    // LIMPAR ERROS AO INTERAGIR COM CAMPOS
    // ====================================
    form.querySelectorAll('input, select, textarea').forEach(campo => {
        campo.addEventListener('input', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
            removerMensagemErroCampo(this);
        });
        
        campo.addEventListener('change', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
            removerMensagemErroCampo(this);
        });
    });

    // ====================================
    // FUNÇÕES AUXILIARES
    // ====================================
    function removerMensagemErroCampo(campo) {
        if (!campo) return;
        const erroExistente = campo.parentNode.querySelector('.mensagem-erro-campo');
        if (erroExistente) {
            erroExistente.remove();
        }
    }

    function adicionarMensagemErroCampo(campo, mensagem) {
        if (!campo) return;
        
        removerMensagemErroCampo(campo);
        
        const erroDiv = document.createElement('div');
        erroDiv.className = 'mensagem-erro-campo';
        erroDiv.style.cssText = `
            color: #d32f2f;
            font-size: 12px;
            font-weight: 600;
            margin-top: 5px;
            font-family: 'Poppins', sans-serif;
            animation: fadeIn 0.3s ease;
        `;
        erroDiv.textContent = mensagem;
        
        campo.parentNode.insertBefore(erroDiv, campo.nextSibling);
    }

    // Expor funções globais para outros módulos
    window.FormUtils = {
        removerMensagemErroCampo,
        adicionarMensagemErroCampo
    };

    console.log("✅ Gerenciamento de formulário inicializado");
});
