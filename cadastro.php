<?php
session_start();

// 1. Conexão com o MySQL
$conn = new mysqli("localhost", "root", "", "usuarios");

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

// 2. Verifica se é POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $nome = trim($_POST['nome']);
    $sobrenome = trim($_POST['sobrenome']);
    $email = trim($_POST['email']);
    $senhaDigitada = trim($_POST['senha']);

    // 🔐 Permissão padrão
    $permissao = "usuario";

    // ---- VALIDAÇÕES ----

    if (empty($nome)) {
        header("Location: index.html?erro-cadastro=" . urlencode("O nome é obrigatório") . "&show=cadastro");
        exit();
    }

    if (empty($sobrenome)) {
        header("Location: index.html?erro-cadastro=" . urlencode("O sobrenome é obrigatório") . "&show=cadastro");
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: index.html?erro-cadastro=" . urlencode("Digite um e-mail válido") . "&show=cadastro");
        exit();
    }

    if (!preg_match('/^[0-9]{8}$/', $senhaDigitada)) {
        header("Location: index.html?erro-cadastro=" . urlencode("A senha deve conter exatamente 8 números") . "&show=cadastro");
        exit();
    }

    // Verifica se o e-mail já existe
    $check = $conn->prepare("SELECT id FROM dados_cadastrais WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        header("Location: index.html?erro-cadastro=" . urlencode("Este e-mail já está cadastrado") . "&show=cadastro");
        exit();
    }

    // ---- INSERÇÃO ----

    $senhaHash = password_hash($senhaDigitada, PASSWORD_DEFAULT);

    $sql = "INSERT INTO dados_cadastrais 
            (nome, sobrenome, email, senha, permissoes)
            VALUES (?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $nome, $sobrenome, $email, $senhaHash, $permissao);

    if ($stmt->execute()) {

        $novoId = $stmt->insert_id;

        // Sessão já autenticada
        $_SESSION['cadastro_ok'] = true;
        $_SESSION['id'] = $novoId;
        $_SESSION['usuario'] = $nome;
        $_SESSION['sobrenome'] = $sobrenome;
        $_SESSION['email'] = $email;
        $_SESSION['permissao'] = $permissao; 

        header("Location: estrutura-principal/autenticador.html");
        exit();
    } else {
        header("Location: index.html?erro-cadastro=" . urlencode("Erro ao salvar no banco") . "&show=cadastro");
        exit();
    }

    $stmt->close();
    $check->close();
}

$conn->close();
?>
