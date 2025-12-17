document.addEventListener("DOMContentLoaded", () => {
    // Carregar o modal a partir do arquivo externo
    fetch("modal-criar-rifa.html")
        .then(res => res.text())
        .then(html => {
            // Inserir o modal no DOM
            document.body.insertAdjacentHTML("beforeend", html);

            // Inicializar tudo só depois que o modal existe
            inicializarModalCriarRifa();
        })
        .catch(err => console.error("Erro ao carregar modal:", err));

    function inicializarModalCriarRifa() {
        console.log("Inicializando modal e formulário...");

        const modal = document.getElementById("modal-criar-rifa");
        const btnAbrirIcone = document.getElementById("btn-criar-rifa-icone");
        const btnAbrirTexto = document.getElementById("btn-criar-rifa");
        const btnFechar = document.getElementById("fechar-modal-rifa");
        const form = document.getElementById("form-criar-rifa");

        // Verificar se os elementos existem
        if (!modal || !form) {
            console.error("Modal ou formulário não encontrados!");
            return;
        }

        // Abrir modal
        if (btnAbrirIcone) btnAbrirIcone.onclick = () => modal.style.display = "block";
        if (btnAbrirTexto) btnAbrirTexto.onclick = () => modal.style.display = "block";
        
        // Fechar modal
        if (btnFechar) {
            btnFechar.addEventListener('click', () => {
                modal.style.display = "none";
                limparErros(); // Limpa erros ao fechar
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
                limparErros(); // Limpa erros ao fechar
            }
        });

        // Elementos para validação de imagem
        const erroImagemDiv = document.getElementById('erro-imagem');
        const imagemInput = document.getElementById('imagem');
        const uploadArea = document.getElementById('uploadArea');
        const fileInfo = document.getElementById('fileInfo');
        const previewContainer = document.getElementById('previewContainer');
        const previewImage = document.getElementById('previewImage');
        
        // Criar elemento para exibir erros gerais
        let erroGeralDiv = document.getElementById('erro-geral');
        if (!erroGeralDiv && form) {
            erroGeralDiv = document.createElement('div');
            erroGeralDiv.id = 'erro-geral';
            erroGeralDiv.style.cssText = `
                color: #d32f2f;
                background-color: #ffebee;
                border: 1px solid #ef9a9a;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                font-size: 14px;
                font-family: 'Poppins', sans-serif;
                display: none;
            `;
            form.insertBefore(erroGeralDiv, form.firstChild);
        }

        // Buscar dados da sessão
        fetch("../php/getUser.php")
            .then(r => r.json())
            .then(s => {
                const emailLabel = document.getElementById("email-label");
                const organizadorLabel = document.getElementById("organizador-label");
                
                if (emailLabel) emailLabel.textContent = s.email || "desconhecido";
                
                // Concatena nome + sobrenome
                const nomeCompleto = `${s.nome || ''} ${s.sobrenome || ''}`.trim();
                if (organizadorLabel) organizadorLabel.textContent = nomeCompleto || "desconhecido";
            })
            .catch(err => console.error("Erro ao buscar dados da sessão:", err));

        // ----- LÓGICA DE CÁLCULO -----
        // Mostrar ou esconder campo pix
        const modeloPagamento = document.getElementById("modelo_pagamento");
        if (modeloPagamento) {
            modeloPagamento.addEventListener("change", function () {
                const campoPix = document.getElementById("campo-pix");
                const chavePixInput = document.getElementById("chave_pix");

                if (this.value === "pix") {
                    campoPix.style.display = "block";
                } else {
                    campoPix.style.display = "none";
                    if (chavePixInput) chavePixInput.value = "";
                }
            });
        }

        // Configurar eventos para cálculo ao vivo
        const valorDezenaInput = document.getElementById("valor_dezena");
        const tipoQuantidadeInput = document.getElementById("tipo_quantidade_dezenas");
        const valorPremioInput = document.getElementById("valor_premio");

        if (valorDezenaInput) valorDezenaInput.addEventListener('input', calcular);
        if (tipoQuantidadeInput) tipoQuantidadeInput.addEventListener('change', calcular);
        if (valorPremioInput) valorPremioInput.addEventListener('input', calcular);

        // Inicializar valores padrão
        if (valorDezenaInput) valorDezenaInput.value = 0;
        if (valorPremioInput) valorPremioInput.value = 0;

        // Chamar cálculo inicial
        calcular();

        // -----------------------------
        // VALIDAÇÃO DO FRONTEND (1.5MB) - IMAGEM
        // -----------------------------
        if (imagemInput) {
            imagemInput.addEventListener('change', function(e) {
                if (erroImagemDiv) erroImagemDiv.style.display = 'none';
                if (erroImagemDiv) erroImagemDiv.textContent = '';
                if (fileInfo) fileInfo.classList.remove('show');
                if (previewContainer) previewContainer.classList.remove('show');
                if (uploadArea) uploadArea.classList.remove('active');

                if (this.files.length > 0) {
                    const file = this.files[0];
                    
                    // Verificar tamanho (1.5MB = 1572864 bytes)
                    const tamanhoMaximo = 1.5 * 1024 * 1024;
                    
                    if (file.size > tamanhoMaximo) {
                        if (erroImagemDiv) {
                            erroImagemDiv.textContent = 'A imagem excede o limite de 1.5 MB.';
                            erroImagemDiv.style.display = 'block';
                        }
                        this.value = ''; // Limpa o input
                        if (uploadArea) {
                            uploadArea.style.borderColor = '#d32f2f';
                            uploadArea.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                        }
                        return;
                    }

                    // Verificar tipo
                    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
                    if (!tiposPermitidos.includes(file.type)) {
                        if (erroImagemDiv) {
                            erroImagemDiv.textContent = 'Formato inválido! Use apenas JPG, JPEG ou PNG.';
                            erroImagemDiv.style.display = 'block';
                        }
                        this.value = '';
                        if (uploadArea) {
                            uploadArea.style.borderColor = '#d32f2f';
                            uploadArea.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                        }
                        return;
                    }

                    // Limpar estilos de erro
                    if (uploadArea) {
                        uploadArea.style.borderColor = '';
                        uploadArea.style.boxShadow = '';
                    }

                    // Mostrar informações do arquivo
                    if (fileInfo) {
                        fileInfo.textContent = `${file.name} (${formatarTamanho(file.size)})`;
                        fileInfo.classList.add('show');
                    }
                    if (uploadArea) uploadArea.classList.add('active');

                    // Mostrar pré-visualização
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        if (previewImage) previewImage.src = e.target.result;
                        if (previewContainer) previewContainer.classList.add('show');
                    }
                    reader.readAsDataURL(file);
                }
            });
        }

        // Drag and drop para a imagem
        if (uploadArea) {
            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('active');
            });

            uploadArea.addEventListener('dragleave', function(e) {
                if (!this.contains(e.relatedTarget)) {
                    this.classList.remove('active');
                }
            });

            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('active');
                
                if (e.dataTransfer.files.length > 0 && imagemInput) {
                    imagemInput.files = e.dataTransfer.files;
                    imagemInput.dispatchEvent(new Event('change'));
                }
            });

            // Clique na área de upload
            const browseButton = uploadArea.querySelector('.browse-button');
            if (browseButton) {
                browseButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (imagemInput) imagemInput.click();
                });
            }
        }

        // -----------------------------
        // VALIDAÇÃO DE FORMULÁRIO NO FRONTEND
        // -----------------------------
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Limpar erros anteriores
                limparErros();
                
                // Validar campos obrigatórios
                const camposObrigatorios = [
                    'tipo_quantidade_dezenas',
                    'valor_dezena',
                    'nome_premio',
                    'valor_premio',
                    'tipo_sorteio',
                    'data_sorteio',
                    'visibilidade',
                    'modelo_pagamento'
                ];

                let errosFront = [];

                camposObrigatorios.forEach(id => {
                    const campo = document.getElementById(id);
                    if (campo && (campo.value === null || campo.value === '' || campo.value === undefined)) {
                        campo.style.borderColor = '#d32f2f';
                        campo.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                        const label = campo.previousElementSibling ? 
                            campo.previousElementSibling.textContent.replace(':', '').trim() : id;
                        errosFront.push(`O campo "${label}" é obrigatório.`);
                    }
                });

                // Validar imagem
                if (!imagemInput || !imagemInput.files || imagemInput.files.length === 0) {
                    if (erroImagemDiv) {
                        erroImagemDiv.textContent = 'Selecione uma imagem para a rifa.';
                        erroImagemDiv.style.display = 'block';
                    }
                    if (uploadArea) {
                        uploadArea.style.borderColor = '#d32f2f';
                        uploadArea.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                    }
                    errosFront.push('A imagem é obrigatória.');
                }

                // Validar valores numéricos
                const valorDezena = valorDezenaInput ? parseFloat(valorDezenaInput.value) : 0;
                if (valorDezena <= 0) {
                    errosFront.push('O valor da dezena deve ser maior que zero.');
                }

                const valorPremio = valorPremioInput ? parseFloat(valorPremioInput.value) : 0;
                if (valorPremio <= 0) {
                    errosFront.push('O valor do prêmio deve ser maior que zero.');
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
                        errosFront.push('A data do sorteio não pode ser no passado.');
                    }
                }

                // Se houver erros no frontend, exibir e parar
                if (errosFront.length > 0) {
                    exibirErro(errosFront.join(' '));
                    return;
                }

                // Se todas as validações frontend passarem, enviar para o backend
                enviarFormulario();
            });
        }

        // -----------------------------
        // FUNÇÕES AUXILIARES
        // -----------------------------
        function exibirErro(mensagem) {
            if (!erroGeralDiv) return;
            
            erroGeralDiv.textContent = mensagem;
            erroGeralDiv.style.display = 'block';
            
            // Rolar para o topo do formulário
            if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Auto-remover após 10 segundos
            setTimeout(() => {
                if (erroGeralDiv) erroGeralDiv.style.display = 'none';
            }, 10000);
        }

        function limparErros() {
            if (erroGeralDiv) erroGeralDiv.style.display = 'none';
            if (erroImagemDiv) erroImagemDiv.style.display = 'none';
            
            // Limpar estilo da área de upload
            if (uploadArea) {
                uploadArea.style.borderColor = '';
                uploadArea.style.boxShadow = '';
            }
            
            // Limpar estilos de erro dos campos
            if (form) {
                form.querySelectorAll('input, select, textarea').forEach(campo => {
                    campo.style.borderColor = '';
                    campo.style.boxShadow = '';
                    
                    // Remover mensagens de erro dos campos
                    removerMensagemErroCampo(campo);
                });
            }
        }

        function mostrarSucesso(mensagem) {
            // Criar mensagem de sucesso
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
            
            // Remover após 3 segundos
            setTimeout(() => {
                sucessoDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => sucessoDiv.remove(), 300);
            }, 3000);
        }

        function formatarTamanho(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // -----------------------------
        // FUNÇÃO PARA ENVIAR AO BACKEND
        // -----------------------------
        function enviarFormulario() {
            if (!form) return;
            
            const formData = new FormData(form);
            
            // Mostrar loading no botão
            const botaoSubmit = form.querySelector('.botao-salvar-rifa');
            const textoOriginal = botaoSubmit ? botaoSubmit.textContent : 'Criar Rifa';
            if (botaoSubmit) {
                botaoSubmit.textContent = 'Enviando...';
                botaoSubmit.disabled = true;
            }
            
            // Desabilitar o botão de fechar modal também
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
                        // Tenta parsear como JSON
                        const data = JSON.parse(text);
                        data.status = response.status;
                        return data;
                    } catch (e) {
                        // Se não for JSON, lança erro
                        throw new Error(`Resposta não é JSON: ${text.substring(0, 100)}`);
                    }
                });
            })
            .then(data => {
                console.log('Resposta do servidor:', data);
                
                // Verificar o tipo de resposta
                if (data.tipo === 'sucesso') {
                    // Sucesso - redirecionar
                    mostrarSucesso(data.mensagem || 'Rifa criada com sucesso!');
                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 1500);
                } 
                else if (data.tipo === 'validacao') {
                    // Erros de validação
                    if (data.erros && Array.isArray(data.erros)) {
                        exibirErrosBackend(data.erros);
                    } else {
                        exibirErro('Erro de validação desconhecido.');
                        restaurarBotoes();
                    }
                }
                else if (data.tipo === 'erro_geral') {
                    // Erro geral do backend
                    exibirErro(data.mensagem || 'Erro no servidor.');
                    restaurarBotoes();
                }
                else {
                    // Resposta desconhecida
                    exibirErro('Resposta inválida do servidor.');
                    restaurarBotoes();
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                
                // Se for um erro de rede ou similar
                exibirErro(error.message || 'Erro ao conectar com o servidor. Verifique sua conexão.');
                restaurarBotoes();
            });

            function restaurarBotoes() {
                // Restaurar botão de submit
                if (botaoSubmit) {
                    botaoSubmit.textContent = textoOriginal;
                    botaoSubmit.disabled = false;
                }
                
                // Restaurar botão de fechar
                if (btnFechar) {
                    btnFechar.style.pointerEvents = 'auto';
                }
            }
        }

        // -----------------------------
        // FUNÇÃO PARA EXIBIR ERROS DO BACKEND NOS CAMPOS
        // -----------------------------
        function exibirErrosBackend(erros) {
            if (!erros || !Array.isArray(erros)) {
                console.error('Erros não é um array:', erros);
                exibirErro('Erro de validação do servidor.');
                return;
            }
            
            console.log('Erros recebidos do backend:', erros);
            
            // Limpar erros anteriores
            limparErros();
            
            // Mapear nomes de campos para mensagens
            const mensagensErro = {
                'tipo_quantidade_dezenas': 'Selecione a quantidade de dezenas',
                'valor_dezena': 'O valor da dezena deve ser maior que zero',
                'nome_premio': 'O nome da rifa é obrigatório',
                'valor_premio': 'O valor do prêmio deve ser maior que zero',
                'tipo_sorteio': 'Selecione o tipo de sorteio',
                'data_sorteio': 'A data do sorteio não pode ser no passado',
                'visibilidade': 'Selecione a visibilidade',
                'modelo_pagamento': 'Selecione o modelo de pagamento',
                'imagem': 'A imagem é obrigatória (PNG ou JPG, máximo 1.5MB)'
            };
            
            let errosParaExibir = [];
            
            erros.forEach(campoErro => {
                if (!campoErro) return;
                
                // Encontrar o elemento do campo
                let elementoCampo;
                
                // Tratar casos especiais
                if (campoErro === 'imagem') {
                    elementoCampo = document.getElementById('imagem');
                    if (elementoCampo) {
                        if (erroImagemDiv) {
                            erroImagemDiv.textContent = mensagensErro[campoErro] || 'Erro na imagem';
                            erroImagemDiv.style.display = 'block';
                        }
                        // Destacar a área de upload
                        if (uploadArea) {
                            uploadArea.style.borderColor = '#d32f2f';
                            uploadArea.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                        }
                        errosParaExibir.push(mensagensErro[campoErro] || 'Imagem inválida');
                    }
                } else {
                    elementoCampo = document.getElementById(campoErro);
                    
                    if (elementoCampo) {
                        // Adicionar estilo de erro ao campo
                        elementoCampo.style.borderColor = '#d32f2f';
                        elementoCampo.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
                        
                        // Adicionar mensagem de erro abaixo do campo
                        let mensagemErro = mensagensErro[campoErro] || `O campo "${campoErro}" é inválido`;
                        adicionarMensagemErroCampo(elementoCampo, mensagemErro);
                        
                        // Adicionar à lista de erros para exibir no topo
                        errosParaExibir.push(mensagemErro);
                    } else {
                        console.warn('Elemento não encontrado para campo:', campoErro);
                        // Se não encontrou o campo específico, adiciona mensagem genérica
                        errosParaExibir.push(`Erro no campo ${campoErro}`);
                    }
                }
            });
            
            // Se houver erros, exibir mensagem geral no topo
            if (errosParaExibir.length > 0) {
                exibirErro(`Por favor, corrija os seguintes erros: ${errosParaExibir.join(', ')}`);
            }
            
            // Restaurar o botão de submit
            const botaoSubmit = form ? form.querySelector('.botao-salvar-rifa') : null;
            if (botaoSubmit) {
                botaoSubmit.textContent = 'Criar Rifa';
                botaoSubmit.disabled = false;
            }
            
            if (btnFechar) {
                btnFechar.style.pointerEvents = 'auto';
            }
        }

        // -----------------------------
        // FUNÇÃO PARA ADICIONAR MENSAGEM DE ERRO ABAIXO DO CAMPO
        // -----------------------------
        function adicionarMensagemErroCampo(campo, mensagem) {
            if (!campo) return;
            
            // Remover mensagem anterior se existir
            removerMensagemErroCampo(campo);
            
            // Criar elemento de erro
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
            
            // Inserir após o campo
            campo.parentNode.insertBefore(erroDiv, campo.nextSibling);
        }

        function removerMensagemErroCampo(campo) {
            if (!campo) return;
            const erroExistente = campo.parentNode.querySelector('.mensagem-erro-campo');
            if (erroExistente) {
                erroExistente.remove();
            }
        }

        // -----------------------------
        // LIMPAR ERROS AO INTERAGIR COM OS CAMPOS
        // -----------------------------
        if (form) {
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
        }

        // Para a imagem, também limpar estilos de erro
        if (imagemInput) {
            imagemInput.addEventListener('change', function() {
                if (uploadArea) {
                    uploadArea.style.borderColor = '';
                    uploadArea.style.boxShadow = '';
                }
            });
        }

        // Adicionar animação CSS para as mensagens
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
        document.head.appendChild(style);
    }

    // ----- Função de cálculo -----
    function calcular() {
        const quantidadeInput = document.getElementById("tipo_quantidade_dezenas");
        const valorDezenaInput = document.getElementById("valor_dezena");
        const valorPremioInput = document.getElementById("valor_premio");
        
        if (!quantidadeInput || !valorDezenaInput || !valorPremioInput) return;
        
        // Agora a quantidade já vem DIRETO do value do select
        const quantidade = parseInt(quantidadeInput.value);

        const valorDezena = parseFloat(valorDezenaInput.value) || 0;
        const valorPremio = parseFloat(valorPremioInput.value) || 0;

        const totalArrecadacao = quantidade * valorDezena;
        const lucro = totalArrecadacao - valorPremio;

        // Envia para o hidden do form
        const lucroFinal = document.getElementById("lucro_final");
        if (lucroFinal) lucroFinal.value = lucro;

        // Atualiza os valores fixos
        const qtdNumeros = document.getElementById("qtd-numeros");
        const valorDezenaSpan = document.getElementById("valor-dezena");
        const valorPremioSpan = document.getElementById("valor-premio");
        
        if (qtdNumeros) qtdNumeros.textContent = quantidade;
        if (valorDezenaSpan) valorDezenaSpan.textContent = valorDezena.toFixed(2);
        if (valorPremioSpan) valorPremioSpan.textContent = valorPremio.toFixed(2);

        // Esconde todas as mensagens
        const msgCompleto = document.getElementById("msg-completo");
        const msgSemPremio = document.getElementById("msg-sem-premio");
        const msgSemDezena = document.getElementById("msg-sem-dezena");
        const detalhesCalculo = document.getElementById("detalhes-calculo");
        
        if (msgCompleto) msgCompleto.style.display = "none";
        if (msgSemPremio) msgSemPremio.style.display = "none";
        if (msgSemDezena) msgSemDezena.style.display = "none";
        if (detalhesCalculo) detalhesCalculo.style.display = "none";

        // Regras de exibição
        if (valorDezena > 0 && valorPremio > 0) {
            // Cálculo completo
            if (detalhesCalculo) detalhesCalculo.style.display = "block";
            
            const arrecadacaoTotal = document.getElementById("arrecadacao-total");
            const valorPremioCalculo = document.getElementById("valor-premio-calculo");
            const valorLucro = document.getElementById("valor-lucro");
            const lucroTexto = document.getElementById("lucro-estimado-texto");
            
            if (arrecadacaoTotal) arrecadacaoTotal.textContent = totalArrecadacao.toFixed(2);
            if (valorPremioCalculo) valorPremioCalculo.textContent = valorPremio.toFixed(2);
            if (valorLucro) valorLucro.textContent = Math.abs(lucro).toFixed(2);

            if (lucroTexto) {
                if (lucro >= 0) {
                    lucroTexto.style.color = "#2e7d32";
                    lucroTexto.textContent = "Lucro estimado:";
                } else {
                    lucroTexto.style.color = "#c62828";
                    lucroTexto.textContent = "Prejuízo estimado:";
                }
            }

        } else if (valorDezena > 0) {
            // Só o valor da dezena preenchido
            if (msgSemPremio) msgSemPremio.style.display = "block";
            const arrecadacaoSemPremio = document.getElementById("arrecadacao-sem-premio");
            if (arrecadacaoSemPremio) arrecadacaoSemPremio.textContent = totalArrecadacao.toFixed(2);

        } else if (valorPremio > 0) {
            // Só o valor do prêmio preenchido
            if (msgSemDezena) msgSemDezena.style.display = "block";
            const valorPremioFixo = document.getElementById("valor-premio-fixo");
            if (valorPremioFixo) valorPremioFixo.textContent = valorPremio.toFixed(2);

        } else {
            // Nenhum dos dois preenchidos
            if (msgCompleto) msgCompleto.style.display = "block";
        }
    }
});