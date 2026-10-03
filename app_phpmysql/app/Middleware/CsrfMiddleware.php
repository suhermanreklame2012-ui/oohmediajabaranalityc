<?php
/**
 * CSRF Protection Middleware for POST / PUT / DELETE
 */

class CsrfMiddleware {
    public static function validate(): void {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'], true)) {
            $token = $_POST['csrf_token'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null);
            if (!Security::validateCsrf($token)) {
                http_response_code(403);
                View::render('errors/403', [
                    'title' => 'Validasi Keamanan Gagal (403 CSRF)',
                    'message' => 'Token keamanan sesi tidak valid atau telah kedaluwarsa. Silakan muat ulang halaman.'
                ], 'main');
                exit;
            }
        }
    }
}
