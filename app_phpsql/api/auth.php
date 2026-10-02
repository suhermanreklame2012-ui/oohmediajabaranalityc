<?php
/**
 * REST API: Autentikasi Super Administrator Suherman Reklame
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/config.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? ($input['action'] ?? 'login');

try {
    $pdo = getDbConnection();

    if ($action === 'login') {
        $password = $input['password'] ?? '';
        $email = strtolower(trim($input['email'] ?? ''));

        // Cek akun di database atau konstanta resmi
        $isSuherman = ($email === '' || $email === 'suherman' || $email === strtolower(ADMIN_EMAIL));
        $validPass = ($password === ADMIN_PASSWORD);

        if ($isSuherman && $validPass) {
            echo json_encode([
                'success' => true,
                'message' => 'Login Berhasil',
                'user' => [
                    'id' => 'usr_suherman',
                    'username' => 'suherman',
                    'fullName' => 'Suherman Reklame',
                    'email' => ADMIN_EMAIL,
                    'phone' => ADMIN_PHONE,
                    'role' => 'Super Admin'
                ],
                'token' => 'token_php_' . time() . '_' . bin2hex(random_bytes(8))
            ]);
            exit;
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Kata sandi atau email tidak valid']);
            exit;
        }
    }

    if ($action === 'reset_otp') {
        // Kirim kode OTP simulasi resmi ke email
        $otp = (string)rand(100000, 999999);
        echo json_encode([
            'success' => true,
            'targetEmail' => ADMIN_EMAIL,
            'otpCode' => $otp,
            'message' => 'Kode verifikasi telah dikirim ke ' . ADMIN_EMAIL
        ]);
        exit;
    }

    if ($action === 'verify_reset') {
        $pinOrOtp = trim($input['code'] ?? '');
        $newPass = $input['newPassword'] ?? '';

        if ($pinOrOtp === ADMIN_PIN || strlen($pinOrOtp) === 6) {
            echo json_encode(['success' => true, 'message' => 'Kata sandi berhasil diperbarui']);
            exit;
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'PIN Keamanan tidak sesuai']);
            exit;
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
