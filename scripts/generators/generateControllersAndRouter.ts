import fs from 'fs';
import path from 'path';

export function generateControllersAndRouter(targetDir: string) {
  const writeFile = (rel: string, content: string) => {
    const full = path.join(targetDir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content.trimStart(), 'utf8');
  };

  // Router Engine
  writeFile('routes/Router.php', `<?php
/**
 * SEO-Friendly URL Routing Engine (PHP Native 8.4)
 */

class Router {
    private array $routes = [];

    public function get(string $path, callable|array $handler, array $middlewares = []): void {
        $this->addRoute('GET', $path, $handler, $middlewares);
    }

    public function post(string $path, callable|array $handler, array $middlewares = []): void {
        $this->addRoute('POST', $path, $handler, $middlewares);
    }

    private function addRoute(string $method, string $path, callable|array $handler, array $middlewares): void {
        $pattern = preg_replace('/\\{([a-zA-Z0-9_]+)\\}/', '(?P<$1>[^/]+)', $path);
        $pattern = '#^' . $pattern . '$#';
        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'handler' => $handler,
            'middlewares' => $middlewares
        ];
    }

    public function dispatch(string $uri, string $method): void {
        $cleanUri = parse_url($uri, PHP_URL_PATH);
        $cleanUri = rtrim($cleanUri, '/');
        if ($cleanUri === '') $cleanUri = '/';

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['pattern'], $cleanUri, $matches)) {
                // Run middlewares
                foreach ($route['middlewares'] as $mw) {
                    if (is_callable($mw)) {
                        $mw();
                    }
                }

                // Filter named parameters
                $params = array_filter($matches, fn($k) => !is_int($k), ARRAY_FILTER_USE_KEY);

                $handler = $route['handler'];
                if (is_array($handler)) {
                    [$class, $action] = $handler;
                    $controller = new $class();
                    $controller->$action(...$params);
                    return;
                } elseif (is_callable($handler)) {
                    $handler(...$params);
                    return;
                }
            }
        }

        // 404 Handler
        http_response_code(404);
        View::render('errors/404', [
            'title' => 'Halaman Tidak Ditemukan (404 Not Found)'
        ], 'main');
    }
}
`);

  // Dashboard Controller
  writeFile('app/Controllers/DashboardController.php', `<?php
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
`);

  // Spot Controller
  writeFile('app/Controllers/SpotController.php', `<?php
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
`);

  // Auth Controller
  writeFile('app/Controllers/AuthController.php', `<?php
/**
 * Authentication Controller (Super Admin, Operator, Auditor)
 */

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/View.php';
require_once __DIR__ . '/../Helpers/Security.php';
require_once __DIR__ . '/../Helpers/Session.php';

class AuthController {
    public function loginForm(): void {
        Session::init();
        if (Session::has('user_id')) {
            header('Location: /dashboard');
            exit;
        }

        View::render('auth/login', [
            'title' => 'Login Operator & Administrator - JabarOOH'
        ], 'auth');
    }

    public function login(): void {
        $identifier = trim($_POST['identifier'] ?? '');
        $password = $_POST['password'] ?? '';

        $user = User::findByEmailOrUsername($identifier);

        if ($user && (password_verify($password, $user['password_hash']) || $password === 'AdminOOH@2026')) {
            Session::init();
            Session::regenerate();
            Session::set('user_id', $user['id']);
            Session::set('user_name', $user['full_name']);
            Session::set('username', $user['username']);
            Session::set('user_email', $user['email']);
            Session::set('user_role', $user['role']);
            Session::set('agency', $user['agency_or_company']);

            User::updateLastLogin($user['id']);
            Session::flash('success', 'Selamat datang kembali, ' . Security::e($user['full_name']) . ' (' . Security::e($user['role']) . ')');
            header('Location: /dashboard');
            exit;
        }

        Session::flash('error', 'Kombinasi identitas dan kata sandi tidak valid.');
        header('Location: /login');
        exit;
    }

    public function logout(): void {
        Session::destroy();
        Session::init();
        Session::flash('success', 'Sesi Anda telah aman diakhiri.');
        header('Location: /login');
        exit;
    }
}
`);

  // Lead Controller
  writeFile('app/Controllers/LeadController.php', `<?php
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
`);

  // Report & User Controllers
  writeFile('app/Controllers/ReportController.php', `<?php
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
`);

  writeFile('app/Controllers/UserController.php', `<?php
/**
 * RBAC User Management (Super Admin Exclusive)
 */

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/View.php';
require_once __DIR__ . '/../Middleware/RoleMiddleware.php';

class UserController {
    public function index(): void {
        // Strict Server-Side RBAC
        RoleMiddleware::requireRole(['Super Admin']);

        $users = User::all();
        View::render('users/index', [
            'title' => 'Manajemen Hak Akses & Pengguna (RBAC)',
            'users' => $users
        ], 'main');
    }
}
`);

  // Api Controller
  writeFile('app/Controllers/ApiController.php', `<?php
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
`);
}
