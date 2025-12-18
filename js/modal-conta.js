document.addEventListener("DOMContentLoaded", () => {

    const btnAbrir = document.getElementById("abrir-modal-conta");
    const containerModal = document.getElementById("container-modal-conta");

    btnAbrir.addEventListener("click", (e) => {
        e.preventDefault();
        carregarModalConta();
    });

    function carregarModalConta() {
        // Se o modal já foi carregado, só abre
        const modalExistente = document.getElementById("modal-conta");
        if (modalExistente) {
            abrirModalConta();
            return;
        }

        // Carrega o HTML do modal
        fetch("modal-conta.html")
            .then(res => {
                if (!res.ok) throw new Error("Erro ao carregar modal");
                return res.text();
            })
            .then(html => {
                containerModal.innerHTML = html;
                
                // Configura os eventos do modal
                configurarModal();
                
                // Abre o modal
                abrirModalConta();
            })
            .catch(err => {
                console.error("Erro ao carregar modal:", err);
                containerModal.innerHTML = '<div class="modal-error">Erro ao carregar modal. Tente novamente.</div>';
            });
    }

    function configurarModal() {
        const modal = document.getElementById("modal-conta");
        const modalClose = document.querySelector(".modal-close");
        
        if (!modal || !modalClose) return;
        
        // Fechar com X
        modalClose.addEventListener("click", () => {
            modal.style.display = "none";
        });
        
        // Fechar clicando fora
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
        
        // Fechar com ESC
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && modal.style.display === "flex") {
                modal.style.display = "none";
            }
        });
        
        // Evitar fechar ao clicar dentro do conteúdo
        const modalContent = document.querySelector(".modal-content");
        if (modalContent) {
            modalContent.addEventListener("click", (event) => {
                event.stopPropagation();
            });
        }
    }

    function abrirModalConta() {
        const modal = document.getElementById("modal-conta");
        const modalBody = document.querySelector(".modal-body");
        
        if (!modal || !modalBody) return;
        
        // Mostra loading
        modalBody.innerHTML = document.getElementById("template-loading").innerHTML;
        modal.style.display = "flex";
        
        // Busca dados do usuário
        fetch("../php/getUser.php")
            .then(res => {
                if (!res.ok) throw new Error("Erro na resposta do servidor");
                return res.json();
            })
            .then(usuario => {
                if (!usuario.logado) {
                    // Mostra template de não logado
                    modalBody.innerHTML = document.getElementById("template-nao-logado").innerHTML;
                } else {
                    // Mostra template de logado
                    modalBody.innerHTML = document.getElementById("template-logado").innerHTML;

                    // Combina nome e sobrenome
                    const nomeCompleto = `${usuario.nome} ${usuario.sobrenome}`.trim();

                    // Preenche os dados do usuário
                    document.getElementById("user-nome-completo").textContent = nomeCompleto;
                    document.getElementById("user-email").textContent = usuario.email;

                    // Imagem de perfil
                    const img = document.getElementById("user-imagem");
                    if (usuario.imagem_perfil) {
                        img.src = usuario.imagem_perfil;
                    }
                    img.alt = `Foto de ${nomeCompleto}`;

                    // Botão logout
                    document.getElementById("btn-logout").addEventListener("click", () => {
                        window.location.href = "../php/logout.php";
                    });

                }
            })
            .catch(err => {
                console.error("Erro ao carregar dados do usuário:", err);
                modalBody.innerHTML = `
                    <h2>Erro</h2>
                    <p>Não foi possível carregar os dados. Tente novamente.</p>
                    <button onclick="location.reload()" class="btn btn-login">Recarregar</button>
                `;
            });
    }

    // Adiciona CSS para erro
    const style = document.createElement('style');
    style.textContent = `
        .modal-error {
            padding: 20px;
            color: var(--cor-vermelho);
            background: rgba(255, 0, 0, 0.1);
            border-radius: 8px;
            text-align: center;
            margin: 20px;
        }
    `;
    document.head.appendChild(style);
});