// Script extraído de index.html — mantém mesmas funções e comportamentos
const params = new URLSearchParams(window.location.search);

const loginForm = document.querySelector('form[action="login.php"]');
const cadastroForm = document.getElementById('form-cadastro');

// --- Mostrar mensagens ---
if (params.has('erro-login')) {
    document.getElementById('erro-login').textContent =
        decodeURIComponent(params.get('erro-login'));
}

if (params.has('erro-cadastro')) {
    document.getElementById('erro-cadastro').textContent =
        decodeURIComponent(params.get('erro-cadastro'));
}

// --- Decidir qual form exibir ---
let show = params.get('show');

if (show === 'cadastro') {
    loginForm.style.display = "none";
    cadastroForm.style.display = "block";
} else {
    // padrão: login
    loginForm.style.display = "block";
    cadastroForm.style.display = "none";
}

// --- Alternância manual ---
document.getElementById('mostrar-cadastro').onclick = (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    cadastroForm.style.display = "block";
};

document.getElementById('mostrar-login').onclick = (e) => {
    e.preventDefault();
    cadastroForm.style.display = "none";
    loginForm.style.display = "block";
};


document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('imagem_perfil');
    const previewContainer = document.getElementById('profile-preview');
    const previewImage = document.getElementById('preview-image');
    const defaultText = document.getElementById('default-text');
    
    // Quando o container for clicado, aciona o input file
    previewContainer.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Quando uma imagem for selecionada
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            // Validar tipo de arquivo
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                alert('Por favor, selecione uma imagem nos formatos JPG, PNG ou GIF.');
                this.value = '';
                return;
            }
            
            // Validar tamanho do arquivo (2MB máximo)
            if (file.size > 2 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 2MB.');
                this.value = '';
                return;
            }
            
            // Criar uma URL para a imagem selecionada
            const reader = new FileReader();
            
            reader.addEventListener('load', function() {
                previewImage.src = reader.result;
                previewContainer.classList.add('has-image');
            });
            
            reader.readAsDataURL(file);
        } else {
            // Se não houver arquivo, limpar a pré-visualização
            previewImage.src = '';
            previewContainer.classList.remove('has-image');
        }
    });
});
