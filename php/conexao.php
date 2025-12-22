<?php
/**
 * Arquivo de configuração de conexão com múltiplos bancos de dados
 * 
 * Bancos disponíveis:
 * - usuarios: dados de cadastro e autenticação
 * - rifas: tabela de rifas
 * - sorteios: tabela de agenda_sorteios
 */

$host = "localhost";
$user = "root";
$pass = "";

// Função para conectar ao banco de usuários
function conectarUsuarios() {
    global $host, $user, $pass;
    $conn = new mysqli($host, $user, $pass, "usuarios");
    
    if ($conn->connect_error) {
        die("Erro na conexão ao banco 'usuarios': " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}

// Função para conectar ao banco de rifas
function conectarRifas() {
    global $host, $user, $pass;
    $conn = new mysqli($host, $user, $pass, "rifas");
    
    if ($conn->connect_error) {
        die("Erro na conexão ao banco 'rifas': " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}

// Função para conectar ao banco de sorteios
function conectarSorteios() {
    global $host, $user, $pass;
    $conn = new mysqli($host, $user, $pass, "sorteios");
    
    if ($conn->connect_error) {
        die("Erro na conexão ao banco 'sorteios': " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}

// Manter compatibilidade: criar conexão padrão ao banco usuarios
$conn = conectarUsuarios();
?>
