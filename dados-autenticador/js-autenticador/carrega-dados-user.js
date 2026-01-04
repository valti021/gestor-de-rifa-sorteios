async function carregarUsuario() {
    try {
        const resposta = await fetch("../php/getUser.php");
        const dados = await resposta.json();

        // Se não estiver logado, redireciona
        if (!dados.logado) {
            window.location.href = "/gestor-de-rifa/login-cadastro.html?erro=nao_autorizado";
            return;
        }

        // Junta nome + sobrenome no JS
        const nome = typeof dados.nome === "string" ? dados.nome : "";
        const sobrenome = typeof dados.sobrenome === "string" ? dados.sobrenome : "";
        const nomeCompleto = `${nome} ${sobrenome}`.trim();

        // Exibe no HTML
        document.getElementById("nomeUsuario").textContent =
            nomeCompleto || "Usuário";

        document.getElementById("emailUsuario").textContent =
            dados.email || "";

    } catch (e) {
        console.error("Erro ao carregar usuário:", e);
    }
}

// Executa quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", carregarUsuario);
