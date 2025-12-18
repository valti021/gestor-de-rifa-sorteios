<?php
session_start();

header("Content-Type: application/json; charset=UTF-8");

// Se o usuário NÃO estiver logado
if (
    !isset($_SESSION['login_ok']) &&
    !isset($_SESSION['cadastro_ok'])
) {
    echo json_encode([
        "logado" => false
    ]);
    exit();
}

// Se o usuário ESTIVER logado
echo json_encode([
    "logado"     => true,
    "id"         => $_SESSION['id'] ?? null,
    "nome"       => $_SESSION['usuario'] ?? null,
    "sobrenome"  => $_SESSION['sobrenome'] ?? null,
    "email"      => $_SESSION['email'] ?? null,
    "permissao"  => $_SESSION['permissao'] ?? null,
    "assinatura" => $_SESSION['assinatura'] ?? null
]);

exit();
