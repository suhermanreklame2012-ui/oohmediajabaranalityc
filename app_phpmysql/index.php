<?php
/**
 * JabarOOH Media Network - Front Controller (PHP Native 8.4)
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/app/Helpers/Security.php';
require_once __DIR__ . '/app/Helpers/Session.php';
require_once __DIR__ . '/app/Helpers/View.php';
require_once __DIR__ . '/app/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/app/Middleware/RoleMiddleware.php';
require_once __DIR__ . '/app/Middleware/CsrfMiddleware.php';
require_once __DIR__ . '/routes/Router.php';

// Set production security headers
Security::setSecurityHeaders();

// Initialize Session
Session::init();

// Validate CSRF for POST / PUT / DELETE
CsrfMiddleware::validate();

// Route Dispatching
require_once __DIR__ . '/app/Controllers/DashboardController.php';
require_once __DIR__ . '/app/Controllers/SpotController.php';
require_once __DIR__ . '/app/Controllers/AuthController.php';
require_once __DIR__ . '/app/Controllers/LeadController.php';
require_once __DIR__ . '/app/Controllers/ReportController.php';
require_once __DIR__ . '/app/Controllers/UserController.php';
require_once __DIR__ . '/app/Controllers/ApiController.php';

$router = new Router();

// Public Routes
$router->get('/', [DashboardController::class, 'index']);
$router->get('/dashboard', [DashboardController::class, 'index']);
$router->get('/titik-reklame', [SpotController::class, 'index']);
$router->get('/titik-reklame/{slug}', [SpotController::class, 'show']);
$router->get('/laporan', [ReportController::class, 'index']);
$router->post('/leads/submit', [LeadController::class, 'store']);

// Authentication Routes
$router->get('/login', [AuthController::class, 'loginForm']);
$router->post('/login', [AuthController::class, 'login']);
$router->get('/logout', [AuthController::class, 'logout']);

// Admin & Staff Protected Routes
$router->get('/leads', [LeadController::class, 'index']);
$router->get('/admin/spots/create', [SpotController::class, 'create']);
$router->post('/admin/spots/store', [SpotController::class, 'store']);

// Super Admin Exclusive Routes (RBAC Enforced)
$router->get('/admin/users', [UserController::class, 'index']);

// API Endpoints
$router->get('/api/spots', [ApiController::class, 'spots']);
$router->get('/api/stats', [ApiController::class, 'stats']);
$router->get('/api/database/export/mysql', [ApiController::class, 'exportMysql']);

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$router->dispatch($uri, $method);
