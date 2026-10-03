<?php
/**
 * Billboard & DOOH Spot Controller
 */

require_once __DIR__ . '/../Models/Spot.php';
require_once __DIR__ . '/../Helpers/View.php';
require_once __DIR__ . '/../Helpers/Security.php';
require_once __DIR__ . '/../Helpers/Session.php';
require_once __DIR__ . '/../Middleware/RoleMiddleware.php';

class SpotController {
    public function index(): void {
        $regency = $_GET['regency'] ?? '';
        $status = $_GET['status'] ?? '';
        $type = $_GET['type'] ?? '';
        $q = $_GET['q'] ?? '';

        $spots = Spot::all([
            'regency' => $regency,
            'occupancy_status' => $status,
            'media_type' => $type,
            'q' => $q
        ]);

        View::render('spots/index', [
            'title' => 'Inventaris Titik Reklame OOH Jawa Barat',
            'spots' => $spots,
            'filters' => ['regency' => $regency, 'status' => $status, 'type' => $type, 'q' => $q]
        ], 'main');
    }

    public function show(string $slug): void {
        $spot = Spot::findBySlug($slug);
        if (!$spot) {
            // Coba by ID jika bukan slug
            $spot = Spot::findById($slug);
        }

        if (!$spot) {
            http_response_code(404);
            View::render('errors/404', ['title' => 'Titik Reklame Tidak Ditemukan'], 'main');
            return;
        }

        View::render('spots/detail', [
            'title' => $spot['name'] . ' - Spesifikasi OOH Jawa Barat',
            'spot' => $spot
        ], 'main');
    }

    public function create(): void {
        RoleMiddleware::requireRole(['Super Admin', 'Operator Lapangan']);
        View::render('spots/create', [
            'title' => 'Tambah Titik Reklame Baru'
        ], 'main');
    }

    public function store(): void {
        RoleMiddleware::requireRole(['Super Admin', 'Operator Lapangan']);
        
        $name = trim($_POST['name'] ?? '');
        $code = trim($_POST['code'] ?? '');
        if (empty($name) || empty($code)) {
            Session::flash('error', 'Nama dan Kode Titik wajib diisi.');
            header('Location: /admin/spots/create');
            exit;
        }

        $slug = Security::slugify($code . '-' . $name);
        $id = 'spot_' . bin2hex(random_bytes(6));

        $data = [
            'id' => $id,
            'code' => $code,
            'name' => $name,
            'slug' => $slug,
            'regency' => $_POST['regency'] ?? 'Kota Bandung',
            'district' => $_POST['district'] ?? '',
            'address' => $_POST['address'] ?? '',
            'road_name' => $_POST['road_name'] ?? $name,
            'latitude' => (float)($_POST['latitude'] ?? -6.9175),
            'longitude' => (float)($_POST['longitude'] ?? 107.6191),
            'media_type' => $_POST['media_type'] ?? 'LED Videotron',
            'width_m' => (float)($_POST['width_m'] ?? 12),
            'height_m' => (float)($_POST['height_m'] ?? 6),
            'daily_gross_reach' => (int)($_POST['daily_gross_reach'] ?? 50000),
            'vac_daily' => (int)($_POST['vac_daily'] ?? 35000),
            'occupancy_status' => $_POST['occupancy_status'] ?? 'Available',
            'rate_per_month_idr' => (int)($_POST['rate_per_month_idr'] ?? 45000000)
        ];

        Spot::create($data);
        Session::flash('success', 'Titik reklame baru berhasil ditambahkan.');
        header('Location: /titik-reklame/' . $slug);
        exit;
    }
}
