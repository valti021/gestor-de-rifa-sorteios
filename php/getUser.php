<?php
session_start();

header("Content-Type: application/json");

// Se o usuário não estiver logado
if (!isset($_SESSION['login_ok']) && !isset($_SESSION['cadastro_ok'])) {
    echo json_encode([
        "logado" => false
    ]);
    exit();
}

// Se estiver logado
echo json_encode([
    "logado"     => true,
    "id"         => $_SESSION['id'] ?? null,
    "nome"       => $_SESSION['usuario'] ?? null,
    "sobrenome"  => $_SESSION['sobrenome'] ?? null,
    "email"      => $_SESSION['email'] ?? null,
    "permissao"  => $_SESSION['permissao'] ?? null
]);
exit();
?>
