<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['email'])) {
    echo json_encode([]);
    exit;
}

$conn = new mysqli("localhost", "root", "", "usuarios");
$conn->set_charset("utf8");

$email  = $_SESSION['email'];
$status = $_GET['status'] ?? 'ativa';

$limit  = 4;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

$sql = "SELECT 
            id,
            nome_premio,
            data_sorteio,
            tipo_quantidade_dezenas,
            valor_dezena,
            imagem_premio,
            status
        FROM rifas
        WHERE email = ? AND status = ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssii", $email, $status, $limit, $offset);
$stmt->execute();

$result = $stmt->get_result();
$rifas = [];

while ($r = $result->fetch_assoc()) {

    // Converte data para padrão BR (Brasília)
    if (!empty($r['data_sorteio'])) {
        $data = new DateTime($r['data_sorteio'], new DateTimeZone('America/Sao_Paulo'));
        $r['data_sorteio'] = $data->format('d/m/Y');
    }

    $caminho = $r['imagem_premio'];
    $caminhoCompleto = $_SERVER['DOCUMENT_ROOT'] . "/site-um/gestor-de-rifa/" . $caminho;

    if (!file_exists($caminhoCompleto) || empty($caminho)) {
        $r['imagem_premio'] = "http://localhost/site-um/gestor-de-rifa/midia/erro-imagem/img-quebrada.png";
    } else {
        $r['imagem_premio'] = "http://localhost/site-um/gestor-de-rifa/" . $caminho;
    }

    $rifas[] = $r;
}


echo json_encode($rifas, JSON_UNESCAPED_UNICODE);
exit;
