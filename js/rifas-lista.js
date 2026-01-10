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
//  CONTROLE DE PAGINAÇÃO
// ======================================================================
let estadoAtual = "ativa";
let offsetAtual = 0;
const limite = 4;

document.addEventListener("DOMContentLoaded", () => {

    const tabs        = document.querySelectorAll(".status-vendedor li");
    const tituloTexto = document.getElementById("titulo-texto");
    const lista       = document.getElementById("lista-rifas");
    const blocoSem    = document.getElementById("bloco-sem-rifas");
    const msgSem      = document.getElementById("mensagem-sem-rifas");
    const botaoCriar  = document.getElementById("btn-criar-rifa-icone");
    const btnMaisBox  = document.getElementById("carregar-mais");
    const btnMais     = document.getElementById("btn-carregar-mais");

    // CARD BASE (HTML PRONTO)
    const cardBase = document.querySelector(".rifa-card-example");
    cardBase.style.display = "none";

    // ==================================================================
    //  BUSCAR RIFAS
    // ==================================================================
    function carregarMaisRifas() {

        fetch(`../php/buscar-rifas.php?status=${estadoAtual}&offset=${offsetAtual}`)
            .then(res => res.text())
            .then(text => {
                try {
                    return JSON.parse(text);
                } catch {
                    console.error("Resposta inválida:", text);
                    throw new Error("JSON inválido");
                }
            })
            .then(rifas => {

                if (rifas.length === 0) {
                    if (offsetAtual === 0) {
                        lista.style.display = "none";
                        blocoSem.style.display = "block";
                        msgSem.innerHTML = `Nenhuma rifa em <strong>${estadoAtual}</strong>.`;
                        btnMaisBox.style.display = "none";
                        botaoCriar.style.display = (estadoAtual === "ativa") ? "inline-flex" : "none";
                    } else {
                        btnMaisBox.style.display = "none";
                    }
                    return;
                }

                lista.style.display = "grid";
                blocoSem.style.display = "none";

                rifas.forEach(obj => {

                    const cardKey = Object.keys(obj)[0];
                    const dados   = obj[cardKey];
                    const cardId  = cardKey.replace("card-", "");

                    function limitarTexto(texto, limite = 25) {
                        if (!texto) return "";
                        if (texto.length <= limite) return texto;

                        return texto.substring(0, limite).trim() + "...";
                    }


                    // CLONA CARD PRONTO
                    const card = cardBase.cloneNode(true);
                    card.style.display = "block";

                    // TÍTULO
                    card.querySelector(".title").textContent = limitarTexto(dados.title, 25);


                    // DESCRIÇÃO
                    card.querySelector(".descricao .texto").textContent =
                        dados.description ?? "";

                    // PREÇO
                    card.querySelector(".price").textContent =
                        dados.price ?? "0,00";

                    // VENDIDOS
                    card.querySelector(".tickets-sold").innerHTML =
                        `<i class="fas fa-ticket-alt"></i> ${dados["tickets-sold"] ?? "0/0"}`;

                    // DATA
                    card.querySelector(".draw-date").innerHTML =
                        `<i class="far fa-calendar"></i> ${dados["draw-date"] ?? ""}`;

                    // IMAGENS
                    const imgContainer = card.querySelector(".img-container");
                    const paginacao    = card.querySelector(".indentificador-de-paginacao");

                    imgContainer.innerHTML = "";
                    paginacao.innerHTML = "";

                    const imagens = [];
                    if (dados.img?.["img-1"]) imagens.push(dados.img["img-1"]);
                    if (dados.img?.["img-2"]) imagens.push(dados.img["img-2"]);

                    let imgIndex = 0;

                    const img = document.createElement("img");
                    img.src = imagens[0] ?? "";
                    imgContainer.appendChild(img);

                    // CRIA BOLINHAS
                    imagens.forEach((_, index) => {
                        const dot = document.createElement("span");
                        if (index === 0) dot.classList.add("ativo");

                        dot.addEventListener("click", () => {
                            imgIndex = index;
                            atualizarImagem();
                        });

                        paginacao.appendChild(dot);
                    });

                    const dots = paginacao.querySelectorAll("span");

                    function atualizarImagem() {
                        img.src = imagens[imgIndex];
                        dots.forEach(d => d.classList.remove("ativo"));
                        dots[imgIndex].classList.add("ativo");
                    }

                    const btnLeft  = card.querySelector(".btn-left");
                    const btnRight = card.querySelector(".btn-right");

                    if (imagens.length > 1) {
                        btnLeft.onclick = () => {
                            imgIndex = (imgIndex - 1 + imagens.length) % imagens.length;
                            atualizarImagem();
                        };

                        btnRight.onclick = () => {
                            imgIndex = (imgIndex + 1) % imagens.length;
                            atualizarImagem();
                        };
                    } else {
                        btnLeft.style.display  = "none";
                        btnRight.style.display = "none";
                        paginacao.style.display = "none";
                    }


                    // LINK GERENCIAR
                    card.querySelector(".gerenciar").href =
                        `informacoes-gestao.html?id=${cardId}`;

                    lista.appendChild(card);
                });

                offsetAtual += limite;
                btnMaisBox.style.display = (rifas.length < limite) ? "none" : "block";
            })
            .catch(() => {
                lista.style.display = "none";
                blocoSem.style.display = "block";
                msgSem.textContent = "Erro ao carregar rifas.";
            });
    }

    // ==================================================================
    //  TROCA STATUS
    // ==================================================================
    function trocarStatus(status, texto) {
        estadoAtual = status;
        offsetAtual = 0;
        lista.innerHTML = "";
        tituloTexto.textContent = texto;
        botaoCriar.style.display = (status === "ativa") ? "inline-flex" : "none";
        carregarMaisRifas();
    }

    // ==================================================================
    //  EVENTOS
    // ==================================================================
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("ativo"));
            tab.classList.add("ativo");
            trocarStatus(tab.dataset.status, tab.textContent.split(":")[0].trim());
        });
    });

    btnMais.addEventListener("click", carregarMaisRifas);

    // ==================================================================
    //  INIT
    // ==================================================================
    carregarStatus();
    tabs[0].classList.add("ativo");
    trocarStatus("ativa", "Ativas");
});
