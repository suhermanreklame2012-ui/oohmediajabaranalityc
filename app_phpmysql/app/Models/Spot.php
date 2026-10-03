<?php
/**
 * Spot Model (Titik Reklame) - MySQL 8.0 / MariaDB
 */

require_once __DIR__ . '/../../config/database.php';

class Spot {
    public static function all(array $filters = []): array {
        $pdo = Database::getConnection();
        $sql = "SELECT * FROM spots WHERE 1=1";
        $params = [];

        if (!empty($filters['regency'])) {
            $sql .= " AND regency = :regency";
            $params[':regency'] = $filters['regency'];
        }

        if (!empty($filters['occupancy_status'])) {
            $sql .= " AND occupancy_status = :status";
            $params[':status'] = $filters['occupancy_status'];
        }

        if (!empty($filters['media_type'])) {
            $sql .= " AND media_type = :media_type";
            $params[':media_type'] = $filters['media_type'];
        }

        if (!empty($filters['q'])) {
            $sql .= " AND (name LIKE :q OR road_name LIKE :q OR code LIKE :q OR address LIKE :q)";
            $params[':q'] = '%' . $filters['q'] . '%';
        }

        $sql .= " ORDER BY code ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function findById(string $id): ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM spots WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findBySlug(string $slug): ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM spots WHERE slug = :slug LIMIT 1");
        $stmt->execute([':slug' => $slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function getKpiSummary(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("
            SELECT 
                COUNT(*) as total_spots,
                SUM(CASE WHEN occupancy_status = 'Occupied' THEN 1 ELSE 0 END) as occupied_count,
                SUM(CASE WHEN occupancy_status = 'Available' THEN 1 ELSE 0 END) as available_count,
                SUM(CASE WHEN occupancy_status = 'Reserved' THEN 1 ELSE 0 END) as reserved_count,
                SUM(daily_gross_reach) as total_dgr,
                SUM(vac_daily) as total_vac,
                SUM(CASE WHEN occupancy_status = 'Occupied' THEN rate_per_month_idr ELSE 0 END) as monthly_revenue,
                SUM(rate_per_month_idr) as potential_revenue,
                AVG(cpm_idr) as avg_cpm,
                AVG(effectiveness_score) as avg_effectiveness
            FROM spots
        ");
        $res = $stmt->fetch();
        $total = (int)($res['total_spots'] ?? 0);
        $occ = (int)($res['occupied_count'] ?? 0);
        $res['occupancy_rate_pct'] = $total > 0 ? round(($occ / $total) * 100, 1) : 0;
        return $res;
    }

    public static function create(array $data): string {
        $pdo = Database::getConnection();
        $sql = "INSERT INTO spots (
            id, code, name, slug, regency, district, address, road_name, road_type, corridor_type,
            latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
            viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
            visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
            rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
        ) VALUES (
            :id, :code, :name, :slug, :regency, :district, :address, :road_name, :road_type, :corridor_type,
            :latitude, :longitude, :media_type, :width_m, :height_m, :area_m2, :sides, :orientation,
            :viewing_distance_m, :daily_gross_reach, :vac_daily, :avg_dwell_time_sec, :avg_speed_kmh,
            :visibility_score, :effectiveness_score, :clutter_level, :occupancy_status, :current_brand,
            :rate_per_month_idr, :cpm_idr, :lighting_type, :facing_direction, :target_demographics
        )";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $data['id'],
            ':code' => $data['code'],
            ':name' => $data['name'],
            ':slug' => $data['slug'],
            ':regency' => $data['regency'],
            ':district' => $data['district'] ?? '',
            ':address' => $data['address'],
            ':road_name' => $data['road_name'],
            ':road_type' => $data['road_type'] ?? 'Arteri Primer',
            ':corridor_type' => $data['corridor_type'] ?? 'Komersial & Retail',
            ':latitude' => $data['latitude'],
            ':longitude' => $data['longitude'],
            ':media_type' => $data['media_type'],
            ':width_m' => $data['width_m'],
            ':height_m' => $data['height_m'],
            ':area_m2' => $data['width_m'] * $data['height_m'],
            ':sides' => $data['sides'] ?? 1,
            ':orientation' => $data['orientation'] ?? 'Frontal',
            ':viewing_distance_m' => $data['viewing_distance_m'] ?? 120,
            ':daily_gross_reach' => $data['daily_gross_reach'],
            ':vac_daily' => $data['vac_daily'],
            ':avg_dwell_time_sec' => $data['avg_dwell_time_sec'] ?? 20,
            ':avg_speed_kmh' => $data['avg_speed_kmh'] ?? 25,
            ':visibility_score' => $data['visibility_score'] ?? 90,
            ':effectiveness_score' => $data['effectiveness_score'] ?? 85,
            ':clutter_level' => $data['clutter_level'] ?? 'Sedang',
            ':occupancy_status' => $data['occupancy_status'] ?? 'Available',
            ':current_brand' => $data['current_brand'] ?? '',
            ':rate_per_month_idr' => $data['rate_per_month_idr'],
            ':cpm_idr' => $data['cpm_idr'] ?? 18000,
            ':lighting_type' => $data['lighting_type'] ?? 'Frontlight LED',
            ':facing_direction' => $data['facing_direction'] ?? 'Arus Pusat Kota',
            ':target_demographics' => $data['target_demographics'] ?? 'Urban Commuter'
        ]);

        return $data['id'];
    }

    public static function update(string $id, array $data): bool {
        $pdo = Database::getConnection();
        $fields = [];
        $params = [':id' => $id];

        foreach ($data as $key => $val) {
            $fields[] = "$key = :$key";
            $params[":$key"] = $val;
        }

        if (empty($fields)) return false;

        $sql = "UPDATE spots SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute($params);
    }

    public static function delete(string $id): bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM spots WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
