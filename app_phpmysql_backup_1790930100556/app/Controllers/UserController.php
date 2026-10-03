<?php
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
