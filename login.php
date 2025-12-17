<?php
session_start();

// Conexão
$conn = new mysqli("localhost", "root", "", "usuarios");

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

// Se veio via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $email = trim($_POST['email']);
    $senhaDigitada = trim($_POST['password']);

    // --- VERIFICAÇÃO DE FORMATO DA SENHA ---
    if (!preg_match('/^[0-9]{8}$/', $senhaDigitada)) {
        header("Location: index.html?erro-login=" . urlencode("Formato de senha inválido") . "&show=login");
        exit();
    }

    // --- CONSULTA O EMAIL + PERMISSÃO ---
    $sql = "SELECT id, nome, sobrenome, email, senha, permissoes
            FROM dados_cadastrais
            WHERE email = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows == 0) {
        header("Location: index.html?erro-login=" . urlencode("E-mail não encontrado") . "&show=login");
        exit();
    }

    $usuario = $resultado->fetch_assoc();

    // --- CONFERE O HASH ---
    if (!password_verify($senhaDigitada, $usuario['senha'])) {
        header("Location: index.html?erro-login=" . urlencode("Senha incorreta") . "&show=login");
        exit();
    }

    // --- LOGIN OK → cria sessão COMPLETA ---
    $_SESSION['login_ok']  = true;
    $_SESSION['id']        = $usuario['id'];
    $_SESSION['usuario']   = $usuario['nome'];
    $_SESSION['sobrenome'] = $usuario['sobrenome'];
    $_SESSION['email']     = $usuario['email'];
    $_SESSION['permissao'] = $usuario['permissoes']; 

    header("Location: estrutura-principal/autenticador.html");
    exit();
}

$conn->close();
?>
