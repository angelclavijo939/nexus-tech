<?php
/**
 * NEXUS TECH — Formulario de Contacto
 * Base de datos: maindb_web (PostgreSQL en Neon)
 * Tabla: Clientes_web
 * Compatible con: cPanel, hosting tradicional, servidor propio
 */

// ——— CORS: siempre primero ———
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ——— Solo aceptar POST ———
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

// ——— Leer body: soporta JSON y form-data ———
$body = [];
$raw  = file_get_contents('php://input');

if (!empty($raw)) {
    $trimmed = trim($raw);
    if ($trimmed[0] === '{') {
        $decoded = json_decode($trimmed, true);
        if (is_array($decoded)) $body = $decoded;
    } else {
        parse_str($raw, $body);
    }
}

// Fusionar con $_POST por si acaso
$body = array_merge($_POST, $body);

// ——— Recoger y sanitizar ———
$nombres   = strtoupper(trim($body['nombres']   ?? ''));
$apellidos = strtoupper(trim($body['apellidos'] ?? ''));
$correo    = strtolower(trim($body['correo']    ?? ''));
$telefono  = preg_replace('/\D/', '', trim($body['telefono'] ?? ''));

// ——— Validaciones ———
if (empty($nombres) || empty($apellidos) || empty($correo) || empty($telefono)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El correo no es válido. Debe contener @.']);
    exit;
}

if (strlen($telefono) < 7 || strlen($telefono) > 15) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El teléfono debe tener entre 7 y 15 dígitos.']);
    exit;
}

// ——— Configuración BD: cambiar por tus credenciales Neon ———
$db_host = getenv('PGHOST')     ?: 'p-little-shape-amajueg8-pooler.c-5.us-east-1.aws.neon.tech';
$db_port = getenv('PGPORT')     ?: '5432';
$db_name = getenv('DB_NAME') ?: getenv('PGDATABASE') ?: 'maindb_web';
$db_user = getenv('PGUSER')     ?: 'neondb_owner';
$db_pass = getenv('PGPASSWORD') ?: 'npg_ELnXh7GwWF5d';

// ——— Conexión PDO a PostgreSQL (Neon requiere SSL) ———
try {
    $dsn = "pgsql:host={$db_host};port={$db_port};dbname={$db_name};sslmode=require";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT            => 8,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a la base de datos.',
        'detail'  => $e->getMessage()
    ]);
    exit;
}

// ——— Verificar duplicado por teléfono (llave única) ———
try {
    $stmt = $pdo->prepare('SELECT id FROM "Clientes_web" WHERE "Telefono" = :telefono LIMIT 1');
    $stmt->execute([':telefono' => $telefono]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Este número de teléfono ya está registrado.']);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al verificar el teléfono.']);
    exit;
}

// ——— Insertar registro ———
try {
    $insert = $pdo->prepare('
        INSERT INTO "Clientes_web" ("Nombres", "Apellidos", "Correo", "Telefono")
        VALUES (nextval('"Clientes_web_Id_seq"'::regclass),  :nombres, :apellidos, :correo, :telefono)
    ');
    $insert->execute([
        ':nombres'   => $nombres,
        ':apellidos' => $apellidos,
        ':correo'    => $correo,
        ':telefono'  => $telefono,
    ]);
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Registro exitoso.']);
} catch (PDOException $e) {
    if ($e->getCode() === '23505') {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Este teléfono ya está registrado.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al guardar el registro.']);
    }
}
?>
