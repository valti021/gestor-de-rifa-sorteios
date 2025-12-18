<?php
session_start();

header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['login_ok']) && !isset($_SESSION['cadastro_ok'])) {
    echo json_encode(["logado" => false]);
    exit();
}

// Processa a imagem de perfil
$caminhoImagem = $_SESSION['imagem_perfil'] ?? null;
$imagemPerfil = "http://localhost/site-um/gestor-de-rifa/midia/erro-img-perfil/icone-perfil.jpg";

if (!empty($caminhoImagem)) {
    $caminhoCompleto = $_SERVER['DOCUMENT_ROOT'] . "/site-um/gestor-de-rifa/" . $caminhoImagem;
    
    if (file_exists($caminhoCompleto)) {
        $imagemPerfil = "http://localhost/site-um/gestor-de-rifa/" . $caminhoImagem;
    }
}

echo json_encode([
    "logado"        => true,
    "id"            => $_SESSION['id'] ?? null,
    "nome"          => $_SESSION['usuario'] ?? null,
    "sobrenome"     => $_SESSION['sobrenome'] ?? null,
    "email"         => $_SESSION['email'] ?? null,
    "permissao"     => $_SESSION['permissao'] ?? null,
    "assinatura"    => $_SESSION['assinatura'] ?? null,
    "imagem_perfil" => $imagemPerfil
]);
exit();
