<?php
/**
 * CRM Lead Model
 */

require_once __DIR__ . '/../../config/database.php';

class Lead {
    public static function all(): array {
        $pdo = Database::getConnection();
        $sql = "SELECT l.*, s.name as spot_name, s.code as spot_code, s.regency as spot_regency 
                FROM crm_leads l 
                LEFT JOIN spots s ON l.spot_id = s.id 
                ORDER BY l.created_at DESC";
        $stmt = $pdo->query($sql);
        return $stmt->fetchAll();
    }

    public static function create(array $data): string {
        $pdo = Database::getConnection();
        $id = 'lead_' . bin2hex(random_bytes(6));
        $stmt = $pdo->prepare("
            INSERT INTO crm_leads (id, client_name, brand_name, email, phone, spot_id, budget_idr, campaign_duration_months, status, notes)
            VALUES (:id, :client_name, :brand_name, :email, :phone, :spot_id, :budget_idr, :duration, 'Baru', :notes)
        ");
        $stmt->execute([
            ':id' => $id,
            ':client_name' => $data['client_name'],
            ':brand_name' => $data['brand_name'] ?? '-',
            ':email' => $data['email'] ?? null,
            ':phone' => $data['phone'] ?? null,
            ':spot_id' => $data['spot_id'] ?? null,
            ':budget_idr' => $data['budget_idr'] ?? 0,
            ':duration' => $data['campaign_duration_months'] ?? 1,
            ':notes' => $data['notes'] ?? ''
        ]);
        return $id;
    }
}
