<?php
require_once "conexao.php";
session_start();

header("Content-Type: application/json; charset=UTF-8");

// Apenas POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["tipo" => "erro_geral", "mensagem" => "Método inválido."]);
    exit;
}

// Autenticação
if (!isset($_SESSION["email"], $_SESSION["usuario"])) {
    http_response_code(401);
    echo json_encode(["tipo" => "erro_geral", "mensagem" => "Usuário não autenticado."]);
    exit;
}

$email       = $_SESSION["email"];
$organizador = $_SESSION["usuario"];
$erros       = [];

/* ===============================
   VALIDAÇÃO DOS CAMPOS
================================ */

$camposObrigatorios = [
    'tipo_quantidade_dezenas',
    'valor_dezena',
    'nome_premio',
    'valor_premio',
    'tipo_sorteio',
    'data_sorteio',
    'horario_sorteio',
    'dia_semana',
    'visibilidade',
    'modelo_pagamento'
];

foreach ($camposObrigatorios as $campo) {
    if (empty($_POST[$campo])) {
        $erros[] = $campo;
    }
}

// Imagem
if (!isset($_FILES["imagem"]) || $_FILES["imagem"]["error"] !== UPLOAD_ERR_OK) {
    $erros[] = "imagem";
}

// Se erro → retorna JSON
if (!empty($erros)) {
    http_response_code(400);
    echo json_encode([
        "tipo"  => "validacao",
        "erros" => array_unique($erros)
    ]);
    exit;
}

/* ===============================
   PROCESSAMENTO
================================ */

try {
    $tipo_dezenas = $_POST["tipo_quantidade_dezenas"];
    $valor_dezena = (float) $_POST["valor_dezena"];
    $nome_premio  = trim($_POST["nome_premio"]);
    $descricao    = trim($_POST["descricao"] ?? '');
    $valor_premio = (float) $_POST["valor_premio"];
    $tipo_sorteio = $_POST["tipo_sorteio"];

    // 🔹 DATA, HORA E DIA DA SEMANA
    $data_input   = $_POST["data_sorteio"];    // YYYY-MM-DD
    $hora_input   = $_POST["horario_sorteio"]; // HH:mm
    $dia_semana   = $_POST["dia_semana"];      // texto ou número

    // Junta e valida
    $dataHoraStr = "{$data_input} {$hora_input}:00";

    $dataHora = DateTime::createFromFormat(
        'Y-m-d H:i:s',
        $dataHoraStr,
        new DateTimeZone('America/Sao_Paulo')
    );

    if (!$dataHora) {
        throw new Exception("Data ou horário inválidos.");
    }

    // Formato FINAL para o banco
    $data_sorteio = $dataHora->format('Y-m-d H:i:s');

    $visibilidade      = $_POST["visibilidade"];
    $modelo_pagamento  = $_POST["modelo_pagamento"];
    $chave_pix         = trim($_POST["chave_pix"] ?? '');
    $lucro_final       = $_POST["lucro_final"] ?? null;
    $status            = "ativa";

    /* ===============================
       IMAGEM
    ================================ */

    $imagem = $_FILES["imagem"];
    $ext    = strtolower(pathinfo($imagem["name"], PATHINFO_EXTENSION));

    $nomeFormatado = preg_replace('/[^a-z0-9_-]/i', '',
        str_replace(' ', '-', strtolower($nome_premio))
    );

    $pastaImg = "../uploads/rifas/{$nomeFormatado}/";
    if (!is_dir($pastaImg)) {
        mkdir($pastaImg, 0777, true);
    }

    $novoNome   = uniqid("premio_", true) . "." . $ext;
    $caminhoFS  = $pastaImg . $novoNome;
    $caminhoBD  = "uploads/rifas/{$nomeFormatado}/{$novoNome}";

    if (!move_uploaded_file($imagem["tmp_name"], $caminhoFS)) {
        throw new Exception("Erro ao salvar imagem.");
    }

    /* ===============================
       BANCO DE DADOS
    ================================ */

    $sql = "INSERT INTO rifas (
        email,
        organizador,
        status,
        tipo_quantidade_dezenas,
        valor_dezena,
        nome_premio,
        descricao,
        valor_premio,
        tipo_sorteio,
        data_sorteio,
        dia_semana_sorteio,
        imagem_premio,
        visibilidade,
        modelo_pagamento,
        chave_pix,
        lucro_final
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "ssssisssssssssss",
        $email,
        $organizador,
        $status,
        $tipo_dezenas,
        $valor_dezena,
        $nome_premio,
        $descricao,
        $valor_premio,
        $tipo_sorteio,
        $data_sorteio,
        $dia_semana,
        $caminhoBD,
        $visibilidade,
        $modelo_pagamento,
        $chave_pix,
        $lucro_final
    );

    $stmt->execute();
    $stmt->close();

    echo json_encode([
        "tipo"    => "sucesso",
        "mensagem"=> "Rifa criada com sucesso!",
        "redirect" => "main.html"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "tipo"     => "erro_geral",
        "mensagem" => $e->getMessage()
    ]);
}

$conn->close();
