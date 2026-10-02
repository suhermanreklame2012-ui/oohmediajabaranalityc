<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';
try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("SELECT COUNT(*) as spot_count FROM billboard_spots");
    $count = (int)$stmt->fetchColumn();
    echo json_encode([
        'success' => true,
        'driver' => DB_DRIVER,
        'totalSpots' => $count,
        'dbStatus' => 'connected',
        'serverTime' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
