<?php
require_once "conexao.php";
session_start();

header("Content-Type: application/json; charset=UTF-8");

// Bloqueia requisições que não forem POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "tipo" => "erro_geral",
        "mensagem" => "Método inválido."
    ]);
    exit;
}

// Verificar se o usuário está logado
if (!isset($_SESSION["email"]) || !isset($_SESSION["usuario"])) {
    http_response_code(401);
    echo json_encode([
        "tipo" => "erro_geral",
        "mensagem" => "Usuário não autenticado."
    ]);
    exit;
}

$email = $_SESSION["email"];
$organizador = $_SESSION["usuario"];
$erros = [];

// -----------------------------
// VERIFICAÇÃO DOS DADOS DO FORMULÁRIO
// -----------------------------

// Campos obrigatórios
$camposObrigatorios = [
    'tipo_quantidade_dezenas',
    'valor_dezena',
    'nome_premio',
    'valor_premio',
    'tipo_sorteio',
    'data_sorteio',
    'visibilidade',
    'modelo_pagamento'
];

foreach ($camposObrigatorios as $campo) {
    if (empty($_POST[$campo])) {
        $erros[] = $campo;
    }
}

// Verificação da imagem
if (!isset($_FILES["imagem"]) || $_FILES["imagem"]["error"] !== UPLOAD_ERR_OK) {
    $erros[] = "imagem";
} else {
    $imagem = $_FILES["imagem"];
    
    // Extensões permitidas
    $extensoesPermitidas = ["jpg", "jpeg", "png"];
    $extensao = strtolower(pathinfo($imagem["name"], PATHINFO_EXTENSION));
    
    if (!in_array($extensao, $extensoesPermitidas)) {
        $erros[] = "imagem";
    }
    
    // Limite → 1.5 MB
    $tamanhoMaximo = 1.5 * 1024 * 1024;
    
    if ($imagem["size"] > $tamanhoMaximo) {
        $erros[] = "imagem";
    }
}

// Validação de tipos de dados
if (isset($_POST["valor_dezena"]) && $_POST["valor_dezena"] <= 0) {
    if (!in_array('valor_dezena', $erros)) {
        $erros[] = 'valor_dezena';
    }
}

if (isset($_POST["valor_premio"]) && $_POST["valor_premio"] <= 0) {
    if (!in_array('valor_premio', $erros)) {
        $erros[] = 'valor_premio';
    }
}

// Validação da data (não pode ser no passado)
if (isset($_POST["data_sorteio"]) && !in_array('data_sorteio', $erros)) {
    $dataSorteio = DateTime::createFromFormat(
        'Y-m-d',
        $_POST["data_sorteio"],
        new DateTimeZone('America/Sao_Paulo')
    );

    $hoje = new DateTime('today', new DateTimeZone('America/Sao_Paulo'));

    
    if ($dataSorteio < $hoje) {
        $erros[] = "data_sorteio";
    }
}

// Se houver erros, retorna eles
if (!empty($erros)) {
    http_response_code(400);
    echo json_encode([
        "tipo" => "validacao",
        "erros" => array_unique($erros)
    ]);
    exit;
}

// -----------------------------
// PROCESSAMENTO DOS DADOS
// -----------------------------
try {
    $tipo_dezenas   = $_POST["tipo_quantidade_dezenas"];
    $valor_dezena   = (float)$_POST["valor_dezena"];
    $nome_premio    = trim($_POST["nome_premio"]);
    $descricao      = trim($_POST["descricao"] ?? '');
    $valor_premio   = (float)$_POST["valor_premio"];
    $tipo_sorteio   = $_POST["tipo_sorteio"];
    $data_sorteio   = $_POST["data_sorteio"];
    $visibilidade   = $_POST["visibilidade"];
    $modelo_pagamento = $_POST["modelo_pagamento"];
    $chave_pix      = trim($_POST["chave_pix"] ?? '');
    $lucro_final    = $_POST["lucro_final"] ?? null;

    $status = "ativa";

    // Pasta personalizada
    $nomeFormatado = strtolower(trim($nome_premio));
    $nomeFormatado = preg_replace('/\s+/', '-', $nomeFormatado);
    $nomeFormatado = preg_replace('/[^a-zA-Z0-9_-]/', '', $nomeFormatado);

    $dataFormatada = str_replace("-", "", $data_sorteio);
    $pastaImg = "../uploads/rifas/{$nomeFormatado}-{$dataFormatada}/";

    if (!is_dir($pastaImg)) {
        mkdir($pastaImg, 0777, true);
    }

    $novoNome = uniqid("premio_", true) . "." . $extensao;
    $caminhoFinal = $pastaImg . $novoNome;

    if (!move_uploaded_file($imagem["tmp_name"], $caminhoFinal)) {
        throw new Exception("Falha ao salvar a imagem no servidor.");
    }

    $caminhoBD = "uploads/rifas/{$nomeFormatado}-{$dataFormatada}/{$novoNome}";

    // Salvar no banco
    $sql = "INSERT INTO rifas (
        email, organizador, status, tipo_quantidade_dezenas, valor_dezena, nome_premio,
        descricao, valor_premio, tipo_sorteio, data_sorteio, imagem_premio,
        visibilidade, modelo_pagamento, chave_pix, lucro_final
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Erro ao preparar a consulta: " . $conn->error);
    }

    $stmt->bind_param(
        "ssssissssssssss",
        $email, $organizador, $status, $tipo_dezenas, $valor_dezena, $nome_premio,
        $descricao, $valor_premio, $tipo_sorteio, $data_sorteio,
        $caminhoBD, $visibilidade, $modelo_pagamento, $chave_pix, $lucro_final
    );

    if (!$stmt->execute()) {
        throw new Exception("Erro ao salvar no banco de dados: " . $stmt->error);
    }

    $stmt->close();
    
    // Sucesso!
    echo json_encode([
        "tipo" => "sucesso",
        "sucesso" => true,
        "mensagem" => "Rifa criada com sucesso!",
        "redirect" => "../estrutura-principal/main.html?inicio=1"
    ]);

} catch (Exception $e) {
    error_log("Erro ao criar rifa: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "tipo" => "erro_geral",
        "mensagem" => "Erro interno no servidor. Por favor, tente novamente."
    ]);
}

$conn->close();
?>