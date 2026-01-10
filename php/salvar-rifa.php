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
    'tema_rifa',
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

// Validar imagens
$quantidadePremios = isset($_POST["quantidade_premios"]) ? (int)$_POST["quantidade_premios"] : 1;
$quantidadeImagens = isset($_POST["quantidade_imagens"]) ? (int)$_POST["quantidade_imagens"] : 0;

// Debug: registrar informações
error_log("DEBUG: Quantidade de Prêmios: " . $quantidadePremios);
error_log("DEBUG: Quantidade de Imagens Recebidas: " . $quantidadeImagens);
error_log("DEBUG: POST data keys: " . implode(", ", array_keys($_POST)));

// Verificar se temos as imagens necessárias
if ($quantidadeImagens < $quantidadePremios) {
    error_log("DEBUG: ERRO - Imagens insuficientes. Necessário: $quantidadePremios, Recebido: $quantidadeImagens");
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
    $tema_rifa    = trim($_POST["tema_rifa"] ?? '');
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
       PROCESSAMENTO DAS IMAGENS
    ================================ */



    $pastaImg = "../uploads/rifas/{$n_serial}/";
    if (!is_dir($pastaImg)) {
        mkdir($pastaImg, 0777, true);
    }

    // Variáveis para os caminhos das imagens
    $caminhoImgPremioUm = null;
    $caminhoImgPremioDois = null;

    // Obter quantidade de imagens enviadas
    $quantidadeImagens = isset($_POST["quantidade_imagens"]) ? (int)$_POST["quantidade_imagens"] : 0;

    // Processar imagens em base64
    for ($i = 0; $i < $quantidadeImagens; $i++) {
        $campoImagem = "imagem_" . $i;
        $campoNome = "imagem_nome_" . $i;
        
        if (!isset($_POST[$campoImagem]) || empty($_POST[$campoImagem])) {
            throw new Exception("Imagem " . ($i + 1) . " não encontrada.");
        }
        
        $dadosBase64 = $_POST[$campoImagem];
        $nomeOriginal = isset($_POST[$campoNome]) ? $_POST[$campoNome] : "imagem_" . $i;
        
        // Extrair extensão do nome original
        $ext = pathinfo($nomeOriginal, PATHINFO_EXTENSION);
        if (!$ext || !in_array(strtolower($ext), ['jpg', 'jpeg', 'png'])) {
            $ext = 'png';
        }
        
        // Decodificar base64
        if (strpos($dadosBase64, 'data:image') === 0) {
            // Remove o prefixo "data:image/...;base64,"
            $dadosBase64 = explode(',', $dadosBase64)[1];
        }
        
        $dadosBinarios = base64_decode($dadosBase64, true);
        if (!$dadosBinarios) {
            throw new Exception("Erro ao decodificar imagem " . ($i + 1) . ".");
        }
        
        // Salvar imagem
        if ($i === 0) {
            $novoNome = "premio_um." . $ext;
            $caminhoFS = $pastaImg . $novoNome;
            
            if (file_put_contents($caminhoFS, $dadosBinarios) === false) {
                throw new Exception("Erro ao salvar imagem do 1º prêmio.");
            }
            
            $caminhoImgPremioUm = "uploads/rifas/{$n_serial}/{$novoNome}";
        } elseif ($i === 1) {
            $novoNome = "premio_dois." . $ext;
            $caminhoFS = $pastaImg . $novoNome;
            
            if (file_put_contents($caminhoFS, $dadosBinarios) === false) {
                throw new Exception("Erro ao salvar imagem do 2º prêmio.");
            }
            
            $caminhoImgPremioDois = "uploads/rifas/{$n_serial}/{$novoNome}";
        }
    }
    
    // Validar se temos as imagens necessárias
    if (!$caminhoImgPremioUm) {
        throw new Exception("Imagem do 1º prêmio não foi processada.");
    }
    
    if ($quantidade_premios == 2 && !$caminhoImgPremioDois) {
        throw new Exception("Imagem do 2º prêmio não foi processada.");
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
        nome_rifa,
        descricao,
        tema_rifa,
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "ssssdsssdssssssssdisss",
        $email,
        $organizador,
        $status,
        $tipo_dezenas,
        $valor_dezena,
        $nome_rifa,
        $descricao,
        $tema_rifa,
        $valor_premio,
        $tipo_sorteio,
        $data_sorteio,
        $dia_semana,
        $caminhoImgPremioUm,
        $caminhoImgPremioDois,
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
    
    // Obter o ID da rifa criada
    $rifa_id = $conn->insert_id;
    $stmt->close();

    echo json_encode([
        "tipo"    => "sucesso",
        "mensagem"=> "Rifa criada com sucesso!",
        "rifa_id" => $rifa_id,
        "redirect" => "main.html"
    ]);

} catch (Exception $e) {
    // Se ocorrer erro, tentar limpar as imagens salvas
    if (isset($pastaImg) && is_dir($pastaImg)) {
        // Remover arquivos criados
        if (isset($caminhoImgPremioUm) && file_exists("../" . $caminhoImgPremioUm)) {
            unlink("../" . $caminhoImgPremioUm);
        }
        if (isset($caminhoImgPremioDois) && file_exists("../" . $caminhoImgPremioDois)) {
            unlink("../" . $caminhoImgPremioDois);
        }
        // Tentar remover pasta se estiver vazia
        @rmdir($pastaImg);
    }
    
    http_response_code(500);
    echo json_encode([
        "tipo"     => "erro_geral",
        "mensagem" => $e->getMessage()
    ]);
}

$conn->close();