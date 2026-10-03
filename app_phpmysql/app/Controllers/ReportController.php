<?php
/**
 * Executive Report Generator
 */

require_once __DIR__ . '/../Models/Spot.php';
require_once __DIR__ . '/../Helpers/View.php';

class ReportController {
    public function index(): void {
        $spots = Spot::all();
        $kpi = Spot::getKpiSummary();
        View::render('reports/index', [
            'title' => 'Laporan Eksekutif Kinerja Reklame OOH Jawa Barat',
            'spots' => $spots,
            'kpi' => $kpi
        ], 'main');
    }
}
