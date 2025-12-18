<?php
session_start();

// ---------------- CONEXÃO ----------------
$conn = new mysqli("localhost", "root", "", "usuarios");

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

// Só aceita POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: index.html");
    exit();
}

// ---------------- DADOS ----------------
$nome          = trim($_POST['nome']);
$sobrenome     = trim($_POST['sobrenome']);
$email         = trim($_POST['email']);
$senhaDigitada = trim($_POST['senha']);

$permissao  = "usuario";
$assinatura = "inativa";

// ---------------- VALIDAÇÕES ----------------
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

// ---------------- VERIFICA EMAIL ----------------
$checkEmail = $conn->prepare("SELECT id FROM dados_cadastrais WHERE email = ?");
$checkEmail->bind_param("s", $email);
$checkEmail->execute();

if ($checkEmail->get_result()->num_rows > 0) {
    header("Location: index.html?erro-cadastro=" . urlencode("Este e-mail já está cadastrado") . "&show=cadastro");
    exit();
}

// ---------------- GERAR IDENTIFICADOR ----------------
function gerarIdentificador($nome, $sobrenome, $conn) {
    $letras = strtoupper(
        substr($nome, 0, 1) .
        substr($sobrenome, 0, 1) .
        substr($sobrenome, -1, 1)
    );

    do {
        $numeros = str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT);
        $identificador = $letras . $numeros;

        $check = $conn->prepare(
            "SELECT id FROM dados_cadastrais WHERE identificador = ?"
        );
        $check->bind_param("s", $identificador);
        $check->execute();

    } while ($check->get_result()->num_rows > 0);

    return $identificador;
}

$identificador = gerarIdentificador($nome, $sobrenome, $conn);

// ---------------- IMAGEM DE PERFIL ----------------
$imagemPadrao  = "../midia/padrao/perfil-default.png";
$imagemCaminho = $imagemPadrao;

if (!empty($_FILES['imagem_perfil']['name'])) {

    $arquivo = $_FILES['imagem_perfil'];
    $extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
    $permitidas = ['jpg', 'jpeg', 'png', 'gif'];

    if (!in_array($extensao, $permitidas)) {
        header("Location: index.html?erro-cadastro=" . urlencode("Formato de imagem inválido") . "&show=cadastro");
        exit();
    }

    if ($arquivo['size'] > 2 * 1024 * 1024) {
        header("Location: index.html?erro-cadastro=" . urlencode("Imagem maior que 2MB") . "&show=cadastro");
        exit();
    }

    $pasta = "midia/" . $identificador;
    if (!is_dir($pasta)) {
        mkdir($pasta, 0755, true);
    }

    $nomeArquivo = strtolower($nome) . "-perfil." . $extensao;
    $destino = $pasta . "/" . $nomeArquivo;

    if (!move_uploaded_file($arquivo['tmp_name'], $destino)) {
        header("Location: index.html?erro-cadastro=" . urlencode("Erro ao salvar imagem") . "&show=cadastro");
        exit();
    }

    $imagemCaminho = "/" . $destino;
}

// ---------------- INSERÇÃO ----------------
$senhaHash = password_hash($senhaDigitada, PASSWORD_DEFAULT);

$sql = "INSERT INTO dados_cadastrais
(nome, sobrenome, email, senha, permissoes, assinatura, identificador, imagem_perfil)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssssssss",
    $nome,
    $sobrenome,
    $email,
    $senhaHash,
    $permissao,
    $assinatura,
    $identificador,
    $imagemCaminho
);

$stmt->execute();
$novoId = $stmt->insert_id;

// ---------- CRIA SESSÃO COMPLETA ----------
$_SESSION['cadastro_ok']   = true;
$_SESSION['id']            = $novoId;
$_SESSION['usuario']       = $nome;
$_SESSION['sobrenome']     = $sobrenome;
$_SESSION['email']         = $email;
$_SESSION['permissao']     = $permissao;
$_SESSION['assinatura']    = $assinatura;
$_SESSION['imagem_perfil'] = $imagemCaminho;

header("Location: estrutura-principal/autenticador.html");
exit();
