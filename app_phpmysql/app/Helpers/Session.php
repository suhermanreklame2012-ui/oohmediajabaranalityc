<?php
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
