<?php
session_start();

// Conexão com o banco
$conn = new mysqli("localhost", "root", "", "usuarios");

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

// Só aceita POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $nome          = trim($_POST['nome']);
    $sobrenome     = trim($_POST['sobrenome']);
    $email         = trim($_POST['email']);
    $senhaDigitada = trim($_POST['senha']);

    // 🔐 Valores padrão do sistema
    $permissao  = "usuario";
    $assinatura = "inativa";

    // ---------- VALIDAÇÕES BÁSICAS ----------

    if (empty($nome) || empty($sobrenome)) {
        header("Location: index.html?erro-cadastro=" . urlencode("Nome e sobrenome são obrigatórios") . "&show=cadastro");
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: index.html?erro-cadastro=" . urlencode("E-mail inválido") . "&show=cadastro");
        exit();
    }

    if (!preg_match('/^[0-9]{8}$/', $senhaDigitada)) {
        header("Location: index.html?erro-cadastro=" . urlencode("A senha deve conter exatamente 8 números") . "&show=cadastro");
        exit();
    }

    // ---------- VERIFICA SE EMAIL JÁ EXISTE ----------

    $check = $conn->prepare(
        "SELECT id FROM dados_cadastrais WHERE email = ?"
    );
    $check->bind_param("s", $email);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        header("Location: index.html?erro-cadastro=" . urlencode("Este e-mail já está cadastrado") . "&show=cadastro");
        exit();
    }

    // ---------- INSERÇÃO ----------

    $senhaHash = password_hash($senhaDigitada, PASSWORD_DEFAULT);

    $sql = "INSERT INTO dados_cadastrais
            (nome, sobrenome, email, senha, permissoes, assinatura)
            VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "ssssss",
        $nome,
        $sobrenome,
        $email,
        $senhaHash,
        $permissao,
        $assinatura
    );

    if ($stmt->execute()) {

        $novoId = $stmt->insert_id;

        // ---------- CRIA SESSÃO COMPLETA ----------

        $_SESSION['cadastro_ok'] = true;
        $_SESSION['id']          = $novoId;
        $_SESSION['usuario']     = $nome;
        $_SESSION['sobrenome']   = $sobrenome;
        $_SESSION['email']       = $email;
        $_SESSION['permissao']   = $permissao;
        $_SESSION['assinatura']  = $assinatura;

        header("Location: estrutura-principal/autenticador.html");
        exit();

    } else {
        header("Location: index.html?erro-cadastro=" . urlencode("Erro ao criar conta") . "&show=cadastro");
        exit();
    }

    $stmt->close();
    $check->close();
}

$conn->close();
