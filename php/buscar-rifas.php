<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
header("Content-Type: application/json; charset=UTF-8");

function responder($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

if (!isset($_SESSION['email'])) {
    responder([]);
}

require_once __DIR__ . '/conexao.php';
$conn = conectarRifas();

if (!$conn) {
    responder([]);
}

$email  = $_SESSION['email'];
$status = $_GET['status'] ?? 'ativa';

$limit  = 4;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

// ======================================================
// BUSCA DAS RIFAS
// ======================================================
$sql = "
    SELECT 
        id,
        n_serial,
        nome_rifa,
        data_sorteio,
        tipo_quantidade_dezenas,
        valor_dezena,
        descricao,
        img_premio_um,
        img_premio_dois,
        quantidade_premios,
        status
    FROM rifas
    WHERE email = ? AND status = ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    responder([]);
}

$stmt->bind_param("ssii", $email, $status, $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$saida = [];

while ($r = $result->fetch_assoc()) {

    $id      = (int)$r['id'];
    $serial  = $r['n_serial'];

    // ---------------- DATA ----------------
    $dataSorteio = null;
    if (!empty($r['data_sorteio'])) {
        $d = new DateTime($r['data_sorteio'], new DateTimeZone('America/Sao_Paulo'));
        $dataSorteio = $d->format('d/m/Y');
    }

    // ---------------- STATUS ----------------
    $mapStatus = [
        'ativa'      => 'active',
        'adiada'     => 'postponed',
        'cancelada'  => 'canceled',
        'concluida'  => 'finished'
    ];
    $statusFinal = $mapStatus[$r['status']] ?? 'active';

    // ---------------- IMAGENS ----------------
    $basePath = $_SERVER['DOCUMENT_ROOT'] . "/site-um/gestor-de-rifa/";
    $baseUrl  = "http://localhost/site-um/gestor-de-rifa/";
    $imgErro  = $baseUrl . "midia/erro-imagem/img-quebrada.png";

    $img1 = (!empty($r['img_premio_um']) && file_exists($basePath . $r['img_premio_um']))
        ? $baseUrl . $r['img_premio_um']
        : $imgErro;

    $img2 = null;
    if (
        $r['quantidade_premios'] == 2 &&
        !empty($r['img_premio_dois']) &&
        file_exists($basePath . $r['img_premio_dois'])
    ) {
        $img2 = $baseUrl . $r['img_premio_dois'];
    }

    // ---------------- VENDIDOS (CORRETO) ----------------
    $vendidos = 0;
    $qVenda = $conn->prepare("
        SELECT vendidos 
        FROM vendas 
        WHERE n_serial = ?
        LIMIT 1
    ");
    if ($qVenda) {
        $qVenda->bind_param("s", $serial);
        $qVenda->execute();
        $qVenda->bind_result($vendidos);
        $qVenda->fetch();
        $qVenda->close();
    }

    $total = (int)$r['tipo_quantidade_dezenas'];

    // ---------------- PREÇO ----------------
    $preco = number_format((float)$r['valor_dezena'], 2, ',', '.');

    // ---------------- JSON FINAL ----------------
    $saida[] = [
        "card-$id" => [
            "status"        => $statusFinal,
            "title"         => $r['nome_rifa'],
            "img" => [
                "img-1" => $img1,
                "img-2" => $img2
            ],
            "description"   => $r['descricao'],
            "price"         => $preco,
            "tickets-sold"  => "$vendidos/$total",
            "draw-date"     => $dataSorteio
        ]
    ];
}

responder($saida);
