<?php
session_start();

$conn = new mysqli("localhost", "root", "", "usuarios");

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $email = trim($_POST['email']);
    $senhaDigitada = trim($_POST['password']);

    if (!preg_match('/^[0-9]{8}$/', $senhaDigitada)) {
        header("Location: index.html?erro-login=" . urlencode("Formato de senha inválido") . "&show=login");
        exit();
    }

    $sql = "SELECT 
                id,
                nome,
                sobrenome,
                email,
                senha,
                permissoes,
                assinatura,
                imagem_perfil
            FROM dados_cadastrais
            WHERE email = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 0) {
        header("Location: index.html?erro-login=" . urlencode("E-mail não encontrado") . "&show=login");
        exit();
    }

    $usuario = $res->fetch_assoc();

    if (!password_verify($senhaDigitada, $usuario['senha'])) {
        header("Location: index.html?erro-login=" . urlencode("Senha incorreta") . "&show=login");
        exit();
    }

    $_SESSION['login_ok']     = true;
    $_SESSION['id']           = $usuario['id'];
    $_SESSION['usuario']      = $usuario['nome'];
    $_SESSION['sobrenome']    = $usuario['sobrenome'];
    $_SESSION['email']        = $usuario['email'];
    $_SESSION['permissao']    = $usuario['permissoes'];
    $_SESSION['assinatura']   = $usuario['assinatura'];
    $_SESSION['imagem_perfil']= $usuario['imagem_perfil'];

    header("Location: estrutura-principal/autenticador.html");
    exit();
}

$conn->close();
