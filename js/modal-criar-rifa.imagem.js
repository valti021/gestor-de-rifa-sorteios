/**
 * Modal Criar Rifa - Gerenciamento de Imagem
 * Responsável por: validação de imagem, drag-drop, preview
 */
document.addEventListener("modalCriarRifa:carregado", () => {
    console.log("🖼️ Inicializando gerenciamento de imagem...");

    const imagemInput = document.getElementById('imagem');
    const uploadArea = document.getElementById('uploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const erroImagemDiv = document.getElementById('erro-imagem');

    if (!imagemInput || !uploadArea) {
        console.error("❌ Elementos de imagem não encontrados");
        return;
    }

    // ====================================
    // VALIDAÇÃO E PREVIEW DE IMAGEM
    // ====================================
    imagemInput.addEventListener('change', function(e) {
        validarEMostrarPreview(this.files);
    });

    // ====================================
    // DRAG AND DROP
    // ====================================
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
        
        if (e.dataTransfer.files.length > 0) {
            imagemInput.files = e.dataTransfer.files;
            validarEMostrarPreview(e.dataTransfer.files);
        }
    });

    // Clique na área de upload
    const browseButton = uploadArea.querySelector('.browse-button');
    if (browseButton) {
        browseButton.addEventListener('click', function(e) {
            e.preventDefault();
            imagemInput.click();
        });
    }

    // ====================================
    // FUNÇÕES AUXILIARES
    // ====================================
    function validarEMostrarPreview(files) {
        // Limpar estados anteriores
        if (erroImagemDiv) erroImagemDiv.style.display = 'none';
        if (erroImagemDiv) erroImagemDiv.textContent = '';
        if (fileInfo) fileInfo.classList.remove('show');
        if (previewContainer) previewContainer.classList.remove('show');
        if (uploadArea) uploadArea.classList.remove('active');

        if (files.length === 0) return;

        const file = files[0];
        
        // Validar tamanho (1.5MB)
        const tamanhoMaximo = 1.5 * 1024 * 1024;
        if (file.size > tamanhoMaximo) {
            exibirErroImagem('A imagem excede o limite de 1.5 MB.');
            imagemInput.value = '';
            return;
        }

        // Validar tipo
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!tiposPermitidos.includes(file.type)) {
            exibirErroImagem('Formato inválido! Use apenas JPG, JPEG ou PNG.');
            imagemInput.value = '';
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

    function exibirErroImagem(mensagem) {
        if (erroImagemDiv) {
            erroImagemDiv.textContent = mensagem;
            erroImagemDiv.style.display = 'block';
        }
        if (uploadArea) {
            uploadArea.style.borderColor = '#d32f2f';
            uploadArea.style.boxShadow = '0 0 0 2px rgba(211, 47, 47, 0.2)';
        }
    }

    function formatarTamanho(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Expor funções globais
    window.ImagemUtils = {
        exibirErroImagem,
        formatarTamanho
    };

    console.log("✅ Gerenciamento de imagem inicializado");
});
