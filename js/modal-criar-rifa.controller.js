// modal-criar-rifa.controller.js

document.addEventListener("DOMContentLoaded", () => {

    let modalCarregado = false;

    // ===============================
    // CARREGAR MODAL SOB DEMANDA
    // ===============================
    async function carregarModal() {
        if (modalCarregado) {
            abrirModal();
            return;
        }

        try {
            const response = await fetch("modal-criar-rifa.html");

            if (!response.ok) {
                throw new Error(`Erro ao carregar modal: ${response.status}`);
            }

            const html = await response.text();
            document.body.insertAdjacentHTML("beforeend", html);

            modalCarregado = true;

            configurarFechamento();
            abrirModal();
            buscarDadosSessao();

            // 🔔 Evento global para outros módulos inicializarem
            document.dispatchEvent(new CustomEvent("modalCriarRifa:carregado"));

            console.log("✅ Modal carregado com sucesso");

        } catch (erro) {
            console.error("❌ Falha ao carregar modal:", erro);
        }
    }

    // ===============================
    // BUSCAR DADOS DA SESSÃO
    // ===============================
    function buscarDadosSessao() {
        fetch("../php/getUser.php")
            .then(r => {
                if (!r.ok) throw new Error(`Erro na sessão: ${r.status}`);
                return r.json();
            })
            .then(s => {
                const emailLabel = document.getElementById("email-label");
                const organizadorLabel = document.getElementById("organizador-label");
                
                if (emailLabel) emailLabel.textContent = s.email || "desconhecido";
                
                // Concatena nome + sobrenome
                const nomeCompleto = `${s.nome || ''} ${s.sobrenome || ''}`.trim();
                if (organizadorLabel) organizadorLabel.textContent = nomeCompleto || "desconhecido";
                
                console.log("✅ Dados da sessão carregados");
            })
            .catch(err => {
                console.error("⚠️ Erro ao buscar dados da sessão:", err);
            });
    }

    // ===============================
    // ===============================
    function abrirModal() {
        const modal = document.getElementById("modal-criar-rifa");
        if (!modal) return;

        modal.style.display = "block";
        document.body.style.overflow = "hidden";

        console.log("📂 Modal aberto");
    }

    // ===============================
    // FECHAR MODAL
    // ===============================
    function fecharModal() {
        const modal = document.getElementById("modal-criar-rifa");
        if (!modal) return;

        modal.style.display = "none";
        document.body.style.overflow = "";

        console.log("📁 Modal fechado");
    }

    // ===============================
    // CONFIGURAR FECHAMENTO
    // ===============================
    function configurarFechamento() {
        const modal = document.getElementById("modal-criar-rifa");
        const btnFechar = document.getElementById("fechar-modal-rifa");

        if (!modal) return;

        if (btnFechar) {
            btnFechar.addEventListener("click", fecharModal);
        }

        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
    }

    // ===============================
    // BOTÕES DE ABERTURA
    // ===============================
    function configurarBotoesAbertura() {
        const btnIcone = document.getElementById("btn-criar-rifa-icone");
        const btnTexto = document.getElementById("btn-criar-rifa");

        [btnIcone, btnTexto].forEach(btn => {
            if (!btn) return;
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                carregarModal();
            });
        });

        console.log("✅ Botões de abertura configurados");
    }

    configurarBotoesAbertura();
});
