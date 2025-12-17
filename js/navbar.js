document.addEventListener("DOMContentLoaded", () => {

    fetch("../php/getUser.php") // ajuste o caminho se necessário
        .then(res => res.json())
        .then(dados => {

            if (!dados.logado) return;

            const linkMaster = document.getElementById("link-master");

            // Exibe APENAS se for master
            if (dados.permissao === "master") {
                linkMaster.hidden = false;
            } else {
                linkMaster.hidden = true;
            }
        })
        .catch(err => {
            console.error("Erro ao verificar permissão:", err);
        });
});