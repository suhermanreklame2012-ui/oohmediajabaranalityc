<?php
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
