import fs from 'fs';
import path from 'path';

export function generateHelpersAndMiddleware(targetDir: string) {
  const writeFile = (rel: string, content: string) => {
    const full = path.join(targetDir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content.trimStart(), 'utf8');
  };

  // 1. Security Helper
  writeFile('app/Helpers/Security.php', `<?php
/**
 * Security & Sanitization Helper (PHP Native 8.4)
 */

class Security {
    public static function e(?string $value): string {
        return htmlspecialchars((string)($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function csrfToken(): string {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (empty($_SESSION['_csrf_token'])) {
            $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['_csrf_token'];
    }

    public static function csrfField(): string {
        return '<input type="hidden" name="csrf_token" value="' . self::csrfToken() . '">';
    }

    public static function validateCsrf(?string $token): bool {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (empty($token) || empty($_SESSION['_csrf_token'])) {
            return false;
        }
        return hash_equals($_SESSION['_csrf_token'], $token);
    }

    public static function slugify(string $text): string {
        $text = preg_replace('~[^\\pL\\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);
        return empty($text) ? 'item-' . time() : $text;
    }

    public static function setSecurityHeaders(): void {
        header("X-Content-Type-Options: nosniff");
        header("X-Frame-Options: SAMEORIGIN");
        header("X-XSS-Protection: 1; mode=block");
        header("Referrer-Policy: strict-origin-when-cross-origin");
    }
}
`);

  // 2. Session Helper
  writeFile('app/Helpers/Session.php', `<?php
/**
 * Session Security Helper
 */

class Session {
    public static function init(): void {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', '1');
            ini_set('session.use_only_cookies', '1');
            ini_set('session.cookie_samesite', 'Lax');
            if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
                ini_set('session.cookie_secure', '1');
            }
            session_start();
        }
    }

    public static function set(string $key, mixed $value): void {
        self::init();
        $_SESSION[$key] = $value;
    }

    public static function get(string $key, mixed $default = null): mixed {
        self::init();
        return $_SESSION[$key] ?? $default;
    }

    public static function has(string $key): bool {
        self::init();
        return isset($_SESSION[$key]);
    }

    public static function remove(string $key): void {
        self::init();
        unset($_SESSION[$key]);
    }

    public static function flash(string $key, ?string $message = null): ?string {
        self::init();
        if ($message !== null) {
            $_SESSION['_flash'][$key] = $message;
            return null;
        }
        $val = $_SESSION['_flash'][$key] ?? null;
        unset($_SESSION['_flash'][$key]);
        return $val;
    }

    public static function regenerate(): void {
        self::init();
        session_regenerate_id(true);
    }

    public static function destroy(): void {
        self::init();
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    }
}
`);

  // 3. View Helper
  writeFile('app/Helpers/View.php', `<?php
/**
 * View Renderer
 */

class View {
    public static function render(string $viewPath, array $data = [], string $layout = 'main'): void {
        extract($data);
        $viewFile = __DIR__ . '/../../views/' . $viewPath . '.php';
        
        if (!file_exists($viewFile)) {
            http_response_code(500);
            die("View template [$viewPath] not found.");
        }

        ob_start();
        require $viewFile;
        $content = ob_get_clean();

        $layoutFile = __DIR__ . '/../../views/layouts/' . $layout . '.php';
        if (file_exists($layoutFile)) {
            require $layoutFile;
        } else {
            echo $content;
        }
    }

    public static function json(mixed $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}
`);

  // 4. Auth & Role Middlewares
  writeFile('app/Middleware/AuthMiddleware.php', `<?php
/**
 * Authentication Middleware
 */

class AuthMiddleware {
    public static function check(): void {
        Session::init();
        if (!Session::has('user_id')) {
            Session::flash('error', 'Silakan login terlebih dahulu untuk mengakses menu ini.');
            header('Location: /login');
            exit;
        }
    }

    public static function guest(): void {
        Session::init();
        if (Session::has('user_id')) {
            header('Location: /dashboard');
            exit;
        }
    }
}
`);

  writeFile('app/Middleware/RoleMiddleware.php', `<?php
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
`);

  writeFile('app/Middleware/CsrfMiddleware.php', `<?php
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
`);
}
