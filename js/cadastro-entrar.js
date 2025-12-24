const params = new URLSearchParams(window.location.search);
const loginForm = document.querySelector('form[action="login.php"]');
const cadastroForm = document.getElementById('form-cadastro');
const ladoEsquerdoContent = document.querySelector('.lado-esquerdo-content');

// --- Conteúdo para o lado esquerdo ---
const loginContent = {
    title: "Bem-vindo de volta!",
    description: "Faça login para acessar sua conta e aproveitar todos os recursos disponíveis. Seus dados estão seguros conosco.",
    icon: "fas fa-sign-in-alt"
};

const cadastroContent = {
    title: "Junte-se a nós!",
    description: "Crie sua conta agora mesmo e comece a explorar todas as funcionalidades. É rápido, fácil e seguro.",
    icon: "fas fa-user-plus"
};

// --- Função para atualizar o lado esquerdo ---
function atualizarLadoEsquerdo(mostrarCadastro) {
    const content = mostrarCadastro ? cadastroContent : loginContent;
    
    if (ladoEsquerdoContent) {
        ladoEsquerdoContent.innerHTML = `
            <i class="${content.icon}" style="font-size: 48px; margin-bottom: 20px;"></i>
            <h1>${content.title}</h1>
            <p>${content.description}</p>
        `;
        
        // Adicionar animação
        ladoEsquerdoContent.classList.remove('active');
        setTimeout(() => {
            ladoEsquerdoContent.classList.add('active');
        }, 50);
    }
}

// --- Função para criar elementos decorativos ---
function criarElementosDecorativos() {
    const ladoEsquerdo = document.querySelector('.lado-esquerdo');
    
    // Remover elementos decorativos existentes
    const elementosExistentes = document.querySelectorAll('.decorative-element');
    elementosExistentes.forEach(el => el.remove());
    
    // Criar novos elementos decorativos
    for (let i = 0; i < 3; i++) {
        const elemento = document.createElement('div');
        elemento.className = 'decorative-element';
        ladoEsquerdo.appendChild(elemento);
    }
}

// --- Função para alternar visibilidade da senha ---
function setupPasswordToggle() {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    
    passwordFields.forEach(field => {
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'password-toggle';
        toggleButton.innerHTML = '<i class="far fa-eye"></i>';
        
        const inputGroup = field.parentElement;
        if (!inputGroup.classList.contains('input-group')) {
            const newInputGroup = document.createElement('div');
            newInputGroup.className = 'input-group';
            field.parentNode.insertBefore(newInputGroup, field);
            newInputGroup.appendChild(field);
            newInputGroup.appendChild(toggleButton);
        } else {
            inputGroup.appendChild(toggleButton);
        }
        
        toggleButton.addEventListener('click', function() {
            const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
            field.setAttribute('type', type);
            
            // Alternar ícone
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.className = 'far fa-eye';
            } else {
                icon.className = 'far fa-eye-slash';
            }
        });
    });
}

// --- Mostrar mensagens de erro ---
if (params.has('erro-login')) {
    const elLoginErro = document.getElementById('erro-login');
    elLoginErro.textContent = decodeURIComponent(params.get('erro-login'));
    elLoginErro.style.display = 'block';
}

if (params.has('erro-cadastro')) {
    const elCadastroErro = document.getElementById('erro-cadastro');
    elCadastroErro.textContent = decodeURIComponent(params.get('erro-cadastro'));
    elCadastroErro.style.display = 'block';
}

// --- Decidir qual form exibir inicialmente ---
let show = params.get('show');
let mostrarCadastroInicialmente = (show === 'cadastro');

if (mostrarCadastroInicialmente) {
    loginForm.style.display = "none";
    cadastroForm.style.display = "block";
    atualizarLadoEsquerdo(true);
} else {
    loginForm.style.display = "block";
    cadastroForm.style.display = "none";
    atualizarLadoEsquerdo(false);
}

// --- Alternância manual entre formulários ---
document.getElementById('mostrar-cadastro').onclick = (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    cadastroForm.style.display = "block";
    atualizarLadoEsquerdo(true);
};

document.getElementById('mostrar-login').onclick = (e) => {
    e.preventDefault();
    cadastroForm.style.display = "none";
    loginForm.style.display = "block";
    atualizarLadoEsquerdo(false);
};

// --- Configuração do upload de imagem de perfil ---
document.addEventListener('DOMContentLoaded', function() {
    // Configurar elementos decorativos
    criarElementosDecorativos();
    
    // Configurar toggle de senha
    setupPasswordToggle();
    
    // Configurar upload de imagem
    const fileInput = document.getElementById('imagem_perfil');
    const previewContainer = document.getElementById('profile-preview');
    const previewImage = document.getElementById('preview-image');
    const defaultText = document.getElementById('default-text');
    
    // Adicionar ícone placeholder
    if (previewContainer && !previewContainer.querySelector('.icon-placeholder')) {
        const iconPlaceholder = document.createElement('i');
        iconPlaceholder.className = 'fas fa-user icon-placeholder';
        previewContainer.appendChild(iconPlaceholder);
    }
    
    // Quando o container for clicado, aciona o input file
    if (previewContainer) {
        previewContainer.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // Quando uma imagem for selecionada
    if (fileInput) {
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
                
                // Validar tamanho do arquivo (5MB máximo para o arquivo antes do recorte)
                if (file.size > 5 * 1024 * 1024) {
                    alert('A imagem deve ter no máximo 5MB.');
                    this.value = '';
                    return;
                }
                
                // Criar uma URL para a imagem selecionada
                const reader = new FileReader();
                
                reader.addEventListener('load', function() {
                    // Abrir modal de recorte
                    window.cropperFunctions.openCropModal(reader.result);
                });
                
                reader.readAsDataURL(file);
            } else {
                // Se não houver arquivo, limpar a pré-visualização
                previewImage.src = '';
                previewContainer.classList.remove('has-image');
            }
        });
    }
    
    // Inicializar o conteúdo do lado esquerdo
    if (ladoEsquerdoContent) {
        ladoEsquerdoContent.classList.add('active');
    }
});