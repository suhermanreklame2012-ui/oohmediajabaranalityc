<?php
/**
 * CRM Leads Controller
 */

require_once __DIR__ . '/../Models/Lead.php';
require_once __DIR__ . '/../Helpers/View.php';
require_once __DIR__ . '/../Helpers/Session.php';
require_once __DIR__ . '/../Middleware/RoleMiddleware.php';

class LeadController {
    public function index(): void {
        RoleMiddleware::requireRole(['Super Admin', 'Operator Lapangan']);
        $leads = Lead::all();
        View::render('leads/index', [
            'title' => 'Pipeline CRM & Prospek Klien Billboard',
            'leads' => $leads
        ], 'main');
    }

    public function store(): void {
        $clientName = trim($_POST['client_name'] ?? '');
        if (empty($clientName)) {
            Session::flash('error', 'Nama kontak klien wajib diisi.');
            header('Location: ' . ($_SERVER['HTTP_REFERER'] ?? '/'));
            exit;
        }

        Lead::create([
            'client_name' => $clientName,
            'brand_name' => $_POST['brand_name'] ?? '-',
            'email' => $_POST['email'] ?? '',
            'phone' => $_POST['phone'] ?? '',
            'spot_id' => $_POST['spot_id'] ?? null,
            'budget_idr' => (int)($_POST['budget_idr'] ?? 0),
            'campaign_duration_months' => (int)($_POST['campaign_duration_months'] ?? 1),
            'notes' => $_POST['notes'] ?? ''
        ]);

        Session::flash('success', 'Permintaan reservasi dan booking berhasil dikirim ke tim OOH Media.');
        header('Location: ' . ($_SERVER['HTTP_REFERER'] ?? '/'));
        exit;
    }
}
