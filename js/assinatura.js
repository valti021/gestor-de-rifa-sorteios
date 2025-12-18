/**
 * Sistema de Gestão de Assinatura
 * Controla a exibição do link de assinatura baseado nos dados do servidor
 */

class GerenciadorAssinatura {
    constructor() {
        this.linkAssinatura = document.getElementById("link-assinatura");
    }

    /**
     * Busca os dados do usuário do servidor
     */
    async buscarDadosUsuario() {
        try {
            const resposta = await fetch("../php/getUser.php");
            const dados = await resposta.json();
            return dados;
        } catch (erro) {
            console.error("Erro ao buscar dados do usuário:", erro);
            return null;
        }
    }

    /**
     * Verifica se a assinatura é inativa
     */
    ehAssinaturaInativa(assinatura) {
        // Se assinatura é null, undefined, vazio ou "inativa", retorna true
        return !assinatura || assinatura === "inativa";
    }

    /**
     * Exibe o link de assinatura
     */
    exibirLink() {
        if (!this.linkAssinatura) {
            console.warn("Elemento #link-assinatura não encontrado no DOM");
            return;
        }

        this.linkAssinatura.hidden = false;
        console.log("✓ Link de assinatura exibido para usuário");
    }

    /**
     * Oculta o link de assinatura
     */
    ocultarLink() {
        if (this.linkAssinatura) {
            this.linkAssinatura.hidden = true;
            console.log("✓ Link de assinatura ocultado");
        }
    }

    /**
     * Inicializa o sistema de assinatura
     */
    async inicializar() {
        const dados = await this.buscarDadosUsuario();

        // Se o usuário não está logado, oculta o link
        if (!dados || !dados.logado) {
            this.ocultarLink();
            return;
        }

        // Lógica: só exibe o link para usuários com assinatura INATIVA
        if (this.ehAssinaturaInativa(dados.assinatura)) {
            // Usuário SEM assinatura - exibe o link
            this.exibirLink();
        } else {
            // Usuário COM assinatura ativa - não exibe o link
            this.ocultarLink();
        }

        // Armazena informações de assinatura no objeto global (opcional)
        window.usuarioAssinatura = {
            ativo: !this.ehAssinaturaInativa(dados.assinatura),
            assinatura: dados.assinatura,
            usuarioId: dados.id,
            usuarioNome: dados.nome
        };

        console.log("Sistema de assinatura inicializado:", window.usuarioAssinatura);
    }

    /**
     * Atualiza o status de assinatura dinamicamente
     * Útil se o status mudar durante a sessão
     */
    async atualizarStatus() {
        const dados = await this.buscarDadosUsuario();
        if (dados && dados.logado) {
            if (this.ehAssinaturaInativa(dados.assinatura)) {
                this.exibirLink();
            } else {
                this.ocultarLink();
            }
        }
    }
}

/**
 * Inicializa o gerenciador quando o DOM estiver carregado
 */
document.addEventListener("DOMContentLoaded", () => {
    const gerenciador = new GerenciadorAssinatura();
    gerenciador.inicializar();

    // Torna o gerenciador acessível globalmente para atualizações dinâmicas
    window.gerenciadorAssinatura = gerenciador;
});
