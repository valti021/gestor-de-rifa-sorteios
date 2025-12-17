async function carregarUsuario() {
    try {
        const resposta = await fetch("../php/getUser.php");
        const dados = await resposta.json();

        if (!dados.logado) {
            window.location.href = "/gestor-de-rifa/index.html?erro=nao_autorizado";
            return;
        }

        // Exibe no HTML
        document.getElementById("nomeUsuario").textContent = dados.nome;
        document.getElementById("emailUsuario").textContent = dados.email;

    } catch (e) {
        console.error("Erro ao carregar usuário:", e);
    }
}

// Executa a função quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', carregarUsuario);