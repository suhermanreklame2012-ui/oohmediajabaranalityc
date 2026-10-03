<?php
/**
 * Server-Side RBAC Middleware (Strict Access Control)
 */

class RoleMiddleware {
    public static function requireRole(array $allowedRoles): void {
        AuthMiddleware::check();
        $userRole = Session::get('user_role');

        if (!in_array($userRole, $allowedRoles, true)) {
            http_response_code(403);
            View::render('errors/403', [
                'title' => 'Akses Ditolak (403 Forbidden)',
                'message' => 'Role Anda [' . Security::e($userRole) . '] tidak memiliki wewenang untuk halaman ini.'
            ], 'main');
            exit;
        }
    }
}
