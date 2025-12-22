<?php
session_start();

if (!isset($_SESSION['email'])) {
    echo json_encode([]);
    exit;
}

require_once "conexao.php";
$conn = conectarRifas();

$email = $_SESSION['email'];

$statuses = ["ativa", "adiada", "cancelada", "concluida"];
$resultado = [];

foreach ($statuses as $s) {
    $sql = "SELECT COUNT(*) AS total FROM rifas WHERE email = ? AND status = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $email, $s);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    $resultado[$s] = $res["total"];
}

echo json_encode($resultado);
exit;
