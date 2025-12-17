document.addEventListener("DOMContentLoaded", () => {

    const btnAbrir = document.getElementById("abrir-modal-conta");
    const modal = document.getElementById("modal-conta");
    const conteudo = document.getElementById("modal-conteudo");

    btnAbrir.addEventListener("click", (e) => {
        e.preventDefault();
        abrirModalConta();
    });

    function abrirModalConta() {
        fetch("../php/getUser.php")
        .then(res => res.json())
        .then(usuario => {

            if (!usuario.logado) {
                conteudo.innerHTML = `
                    <h2>Acesso necessário</h2>
                    <p>Faça login para acessar sua conta.</p>
                    <a href="../index.html" class="btn-login">Entrar</a>
                `;
            } else {
                conteudo.innerHTML = `
                    <h2>Minha Conta</h2>
                    <p><strong>Nome:</strong> ${usuario.nome}</p>
                    <p><strong>Email:</strong> ${usuario.email}</p>

                    <button id="btn-logout" class="btn-sair">Sair</button>
                `;

                document.getElementById("btn-logout").onclick = () => {
                    window.location.href = "../php/logout.php";
                };
            }

            modal.style.display = "flex";
        });
    }

    // Fechar clicando fora
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});
