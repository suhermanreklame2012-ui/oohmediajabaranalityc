<?php
/**
 * Dashboard & Interactive GIS Map Controller
 */

require_once __DIR__ . '/../Models/Spot.php';
require_once __DIR__ . '/../Helpers/View.php';

class DashboardController {
    public function index(): void {
        $spots = Spot::all();
        $kpi = Spot::getKpiSummary();

        View::render('dashboard/index', [
            'title' => 'Dashboard Performa Reklame Jawa Barat (JabarOOH)',
            'spots' => $spots,
            'kpi' => $kpi
        ], 'main');
    }
}
