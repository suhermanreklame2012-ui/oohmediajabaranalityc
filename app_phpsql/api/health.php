<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';

try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("SELECT COUNT(*) as spot_count FROM billboard_spots");
    $count = $stmt->fetchColumn();

    echo json_encode([
        'status' => 'OK',
        'app' => 'JabarOOH Enterprise Portal',
        'php_version' => phpversion(),
        'driver' => DB_DRIVER,
        'spot_count' => (int)$count,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'DEGRADED',
        'error' => $e->getMessage()
    ]);
}
