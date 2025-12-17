<?php
// gestor-de-rifa/php/modal-data-rifa.php

require_once 'conexao.php'; // ajuste se o nome do arquivo de conexão for diferente

header('Content-Type: application/json; charset=UTF-8');

// ==========================
// Mapeamento dos dias da semana
// ==========================
$diasSemana = [
    0 => 'Domingo',
    1 => 'Segunda-feira',
    2 => 'Terça-feira',
    3 => 'Quarta-feira',
    4 => 'Quinta-feira',
    5 => 'Sexta-feira',
    6 => 'Sábado'
];

// ==========================
// Consulta ao banco (somente leitura)
// ==========================
$sql = "
    SELECT 
        dia_semana,
        mes,
        horario_sorteio
    FROM agenda_sorteios
    WHERE status = 'ativo'
    ORDER BY mes, dia_semana, horario_sorteio
";

$stmt = $pdo->prepare($sql);
$stmt->execute();

$resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ==========================
// Tratamento dos dados
// ==========================
$agenda = [];

foreach ($resultados as $row) {
    $diaNumero = (int) $row['dia_semana'];

    $agenda[] = [
        'dia_semana_numero' => $diaNumero,
        'dia_semana_nome'   => $diasSemana[$diaNumero] ?? 'Desconhecido',
        'mes'               => $row['mes'],
        'horario'           => substr($row['horario_sorteio'], 0, 5) // HH:MM
    ];
}

// ==========================
// Cálculo dos anos (servidor)
// ==========================
$anoAtual = (int) date('Y');

$anosDisponiveis = [
    $anoAtual,
    $anoAtual + 1,
    $anoAtual + 2
];

// ==========================
// Resposta final
// ==========================
$response = [
    'agenda' => $agenda,
    'anos'   => $anosDisponiveis
];

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
