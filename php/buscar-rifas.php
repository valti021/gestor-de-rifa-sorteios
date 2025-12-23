<?php
// Garantir retorno JSON e suprimir warnings
error_reporting(0);
ini_set('display_errors', 0);
session_start();
header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['email'])) {
    echo json_encode([]);
    exit;
}

require_once __DIR__ . '/conexao.php';
// Usar conexão correta para rifas
$conn = conectarRifas();

$email  = $_SESSION['email'];
$status = $_GET['status'] ?? 'ativa';

$limit  = 4;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

$sql = "SELECT 
            id,
            nome_rifa,
            data_sorteio,
            tipo_quantidade_dezenas,
            valor_dezena,
            img_premio_um,
            img_premio_dois,
            quantidade_premios,
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

    // Processar imagem do 1º prêmio
    $caminho1 = $r['img_premio_um'];
    $caminhoCompleto1 = $_SERVER['DOCUMENT_ROOT'] . "/site-um/gestor-de-rifa/" . $caminho1;

    if (!file_exists($caminhoCompleto1) || empty($caminho1)) {
        $r['img_premio_um'] = "http://localhost/site-um/gestor-de-rifa/midia/erro-imagem/img-quebrada.png";
    } else {
        $r['img_premio_um'] = "http://localhost/site-um/gestor-de-rifa/" . $caminho1;
    }

    // Processar imagem do 2º prêmio (se houver)
    if ($r['quantidade_premios'] == 2 && !empty($r['img_premio_dois'])) {
        $caminho2 = $r['img_premio_dois'];
        $caminhoCompleto2 = $_SERVER['DOCUMENT_ROOT'] . "/site-um/gestor-de-rifa/" . $caminho2;

        if (!file_exists($caminhoCompleto2) || empty($caminho2)) {
            $r['img_premio_dois'] = "http://localhost/site-um/gestor-de-rifa/midia/erro-imagem/img-quebrada.png";
        } else {
            $r['img_premio_dois'] = "http://localhost/site-um/gestor-de-rifa/" . $caminho2;
        }
    } else {
        $r['img_premio_dois'] = null;
    }

    $rifas[] = $r;
}


echo json_encode($rifas, JSON_UNESCAPED_UNICODE);
exit;
