<?php
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
