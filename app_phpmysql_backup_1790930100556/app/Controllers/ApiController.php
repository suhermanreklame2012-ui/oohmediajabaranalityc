<?php
/**
 * JSON REST API Endpoints
 */

require_once __DIR__ . '/../Models/Spot.php';
require_once __DIR__ . '/../Helpers/View.php';

class ApiController {
    public function spots(): void {
        $spots = Spot::all();
        View::json([
            'success' => true,
            'count' => count($spots),
            'data' => $spots
        ]);
    }

    public function stats(): void {
        $kpi = Spot::getKpiSummary();
        View::json([
            'success' => true,
            'stats' => $kpi
        ]);
    }

    public function exportMysql(): void {
        $sqlFile = __DIR__ . '/../../database/database.sql';
        if (!file_exists($sqlFile)) {
            http_response_code(404);
            die("SQL dump not found");
        }
        header('Content-Type: application/sql');
        header('Content-Disposition: attachment; filename="jabarooh_mysql_dump.sql"');
        readfile($sqlFile);
        exit;
    }
}
