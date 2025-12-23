<?php
require_once "conexao.php";
session_start();

// Conectar ao banco de rifas
$conn = conectarRifas();

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
    'nome_rifa',
    'valor_premio',
    'tipo_sorteio',
    'data_sorteio',
    'horario_sorteio',
    'dia_semana',
    'visibilidade',
    'modelo_pagamento',
    'quantidade_premios',
    'nome_premio_um'
];

foreach ($camposObrigatorios as $campo) {
    if (empty($_POST[$campo])) {
        $erros[] = $campo;
    }
}

// Validar nome do 2º prêmio se quantidade_premios = 2
if (isset($_POST["quantidade_premios"]) && $_POST["quantidade_premios"] == "2") {
    if (empty($_POST["nome_premio_dois"])) {
        $erros[] = "nome_premio_dois";
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
    // Geração do número serial
    function gerarSerialRifa() {
        // Letras aleatórias maiúsculas
        $letras = '';
        for ($i = 0; $i < 3; $i++) {
            $letras .= chr(rand(65, 90)); // A-Z
        }
        // Data atual (dia e mês)
        $dia = date('d');
        $mes = date('m');
        // Bloco PI (314)
        $pi = '314';
        // Última dezena aleatória
        $dezena = str_pad(strval(rand(0, 99)), 2, '0', STR_PAD_LEFT);
        // Monta serial
        return sprintf('%s-%s-%s-%s.%s', $letras, $dia, $mes, $pi, $dezena);
    }

    $n_serial = gerarSerialRifa();
    $tipo_dezenas = $_POST["tipo_quantidade_dezenas"];
    $valor_dezena = (float) $_POST["valor_dezena"];
    $nome_rifa    = trim($_POST["nome_rifa"]);
    $descricao    = trim($_POST["descricao"] ?? '');
    $valor_premio = (float) $_POST["valor_premio"];
    $tipo_sorteio = $_POST["tipo_sorteio"];

    // DATA, HORA E DIA DA SEMANA
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
    $lucro_final       = (float) ($_POST["lucro_final"] ?? 0);
    $status            = "ativa";

    // Quantidade e nomes dos prêmios
    $quantidade_premios = (int) $_POST["quantidade_premios"];
    $nome_premio_um = trim($_POST["nome_premio_um"]);
    $nome_premio_dois = ($quantidade_premios == 2) ? trim($_POST["nome_premio_dois"]) : null;

    /* ===============================
       IMAGEM
    ================================ */

    $imagem = $_FILES["imagem"];
    $ext    = strtolower(pathinfo($imagem["name"], PATHINFO_EXTENSION));

    $nomeFormatado = preg_replace('/[^a-z0-9_-]/i', '',
        str_replace(' ', '-', strtolower($nome_rifa))
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

    // Se houver 2 prêmios, salvar a mesma imagem em ambas as colunas
    $img_premio_dois = ($quantidade_premios == 2) ? $caminhoBD : null;


    $sql = "INSERT INTO rifas (
        email,
        organizador,
        status,
        tipo_quantidade_dezenas,
        valor_dezena,
        nome_rifa,
        descricao,
        valor_premio,
        tipo_sorteio,
        data_sorteio,
        dia_semana_sorteio,
        img_premio_um,
        img_premio_dois,
        visibilidade,
        modelo_pagamento,
        chave_pix,
        lucro_final,
        quantidade_premios,
        nome_premio_um,
        nome_premio_dois,
        n_serial
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "ssssdssdssssssssdisss",
        $email,
        $organizador,
        $status,
        $tipo_dezenas,
        $valor_dezena,
        $nome_rifa,
        $descricao,
        $valor_premio,
        $tipo_sorteio,
        $data_sorteio,
        $dia_semana,
        $caminhoBD,
        $img_premio_dois,
        $visibilidade,
        $modelo_pagamento,
        $chave_pix,
        $lucro_final,
        $quantidade_premios,
        $nome_premio_um,
        $nome_premio_dois,
        $n_serial
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
