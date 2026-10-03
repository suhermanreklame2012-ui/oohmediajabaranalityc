<?php
/**
 * User Model - Authentication & RBAC
 */

require_once __DIR__ . '/../../config/database.php';

class User {
    public static function findByEmailOrUsername(string $identifier): ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :id1 OR username = :id2 LIMIT 1");
        $stmt->execute([':id1' => $identifier, ':id2' => $identifier]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function all(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT id, username, email, full_name, role, agency_or_company, created_at, last_login_at FROM users ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    public static function updateLastLogin(string $userId): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id");
        $stmt->execute([':id' => $userId]);
    }
}
