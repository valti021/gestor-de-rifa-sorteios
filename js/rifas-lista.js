// ======================================================================
//  CARREGA QUANTIDADE DE RIFAS POR STATUS
// ======================================================================
function carregarStatus() {
    fetch("../php/contar-rifas.php")
        .then(res => res.json())
        .then(dados => {
            document.getElementById("rifas-ativas").textContent     = dados.ativa ?? 0;
            document.getElementById("rifas-adiadas").textContent    = dados.adiada ?? 0;
            document.getElementById("rifas-canceladas").textContent = dados.cancelada ?? 0;
            document.getElementById("rifas-concluidas").textContent = dados.concluida ?? 0;
        });
}

// ======================================================================
//  VARIÁVEIS DE CONTROLE DO SISTEMA DE PAGINAÇÃO
// ======================================================================
let estadoAtual = "ativa";
let offsetAtual = 0;
const limite = 4;

document.addEventListener("DOMContentLoaded", () => {

    const tabs         = document.querySelectorAll(".status-vendedor li");
    const tituloTexto  = document.getElementById("titulo-texto");
    const lista        = document.getElementById("lista-rifas");
    const blocoSem     = document.getElementById("bloco-sem-rifas");
    const msgSem       = document.getElementById("mensagem-sem-rifas");
    const botaoCriar   = document.getElementById("btn-criar-rifa-icone");
    const btnMais      = document.getElementById("carregar-mais");
    const btnMaisClick = document.getElementById("btn-carregar-mais");





    // ------------------------------------------------------------------
    //   FUNÇÃO PRINCIPAL QUE BUSCA 4 RIFAS POR VEZ
    // ------------------------------------------------------------------
    function carregarMaisRifas() {

        fetch(`../php/buscar-rifas.php?status=${estadoAtual}&offset=${offsetAtual}`)
            .then(res => res.json())
            .then(rifas => {

                // Se não vier nada:
                if (rifas.length === 0) {
                    if (offsetAtual === 0) {
                        // Primeira busca e não tem nada
                        lista.style.display = "none";
                        blocoSem.style.display = "block";
                        msgSem.innerHTML = `Nenhuma rifa em <strong>${estadoAtual}</strong>.`;

                        btnMais.style.display = "none";

                        if (estadoAtual === "ativa") {
                            botaoCriar.style.display = "inline-flex";
                        } else {
                            botaoCriar.style.display = "none";
                        }
                    } else {
                        // Não tem mais para carregar
                        btnMais.style.display = "none";
                    }
                    return;
                }

                // Se vier conteúdo
                lista.style.display = "grid";
                blocoSem.style.display = "none";

                function cortarTexto(texto, limite = 10) {
                    if (texto.length <= limite) return texto;
                    return texto.substring(0, limite) + "...";
                }
                const template = document.getElementById("template-card-rifa");

                rifas.forEach(r => {
                    const card = template.content.cloneNode(true);

                    card.querySelector(".img-premio").src = r.imagem_premio ?? '';

                    // garante valor string e remove espaços extras
                    const nomeOriginal = (r.nome_premio ?? "").toString().trim();

                    // Função de corte (fallback, caso queira cortar pelo JS também)
                    function cortarTexto(texto, limite = 10) {
                        if (!texto) return "";
                        return (texto.length <= limite) ? texto : texto.slice(0, limite) + "...";
                    }

                    const nomeLimitado = cortarTexto(nomeOriginal, 10);

                    // utiliza textContent (evita injeção de HTML)
                    const elNome = card.querySelector(".nome-premio");
                    if (elNome) {
                        // coloca o <strong> de forma segura usando createElement
                        const strong = document.createElement("strong");
                        strong.textContent = nomeLimitado;
                        // título com o nome completo (tooltip)
                        strong.title = nomeOriginal;
                        // limpa e adiciona
                        elNome.textContent = "";
                        elNome.appendChild(strong);
                    }

                    card.querySelector(".quantidade-dezenas").textContent =
                        `Quantidade de dezenas: ${r.tipo_quantidade_dezenas ?? ''}`;

                    card.querySelector(".valor-dezena").textContent =
                        `Valor por dezena: R$ ${Number(r.valor_dezena ?? 0).toFixed(2)}`;

                    card.querySelector(".data-sorteio").textContent =
                        `Data do sorteio: ${r.data_sorteio ?? ''}`;


                    card.querySelector(".btn-gerenciar").onclick = () => {
                        window.open(
                            "informacoes-gestao.html?informacoes_gestao=" + encodeURIComponent(nomeOriginal),
                            "_blank"
                        );
                    };

                    lista.appendChild(card);
                });



                // atualizar offset
                offsetAtual += limite;

                // Se vier menos de 4, acabou
                btnMais.style.display = (rifas.length < limite) ? "none" : "block";
            })

            .catch(err => {
                console.error(err);
                blocoSem.style.display = "block";
                lista.style.display = "none";
                msgSem.textContent = "Erro ao carregar rifas.";
            });
    }

    // ------------------------------------------------------------------
    //   MUDA DE STATUS (aba clicada)
    // ------------------------------------------------------------------
    function trocarStatus(novoStatus, textoAba) {

        estadoAtual = novoStatus;
        offsetAtual = 0;

        lista.innerHTML = ""; // limpa cards
        tituloTexto.textContent = textoAba;

        // Controle do botão +
        botaoCriar.style.display = (novoStatus === "ativa") ? "inline-flex" : "none";

        // Carrega os primeiros 4
        carregarMaisRifas();
    }

    // ------------------------------------------------------------------
    //   MARCAR ABA ATIVA
    // ------------------------------------------------------------------
    function marcarAtiva(elem) {
        tabs.forEach(li => li.classList.remove("ativo"));
        elem.classList.add("ativo");
    }

    // ------------------------------------------------------------------
    //   EVENTO DE TROCA DE ABA
    // ------------------------------------------------------------------
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            marcarAtiva(tab);
            const status = tab.dataset.status;
            const texto  = tab.textContent.split(":")[0].trim();
            trocarStatus(status, texto);
        });
    });

    // ------------------------------------------------------------------
    //   BOTÃO "CARREGAR MAIS"
    // ------------------------------------------------------------------
    btnMaisClick.addEventListener("click", carregarMaisRifas);

    // ------------------------------------------------------------------
    //   PRIMEIRO CARREGAMENTO DA PÁGINA
    // ------------------------------------------------------------------
    carregarStatus();
    marcarAtiva(tabs[0]);
    trocarStatus("ativa", "Rifas Ativas");
});
