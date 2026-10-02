<?php
/**
 * REST API: Titik Reklame (GET, POST, PUT, DELETE)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/config.php';

try {
    $pdo = getDbConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM billboard_spots ORDER BY spot_code ASC");
        $rows = $stmt->fetchAll();

        // If database is empty, seed from data/initial_spots.json automatically!
        if (empty($rows)) {
            $jsonFile = __DIR__ . '/../data/initial_spots.json';
            if (file_exists($jsonFile)) {
                $rawJson = file_get_contents($jsonFile);
                $spotsArray = json_decode($rawJson, true);
                if (is_array($spotsArray)) {
                    returnResponse(true, $spotsArray, count($spotsArray), 'seeded_json');
                }
            }
        }

        $formatted = [];
        foreach ($rows as $row) {
            $formatted[] = [
                'id' => $row['spot_id'],
                'code' => $row['spot_code'],
                'name' => $row['name'],
                'regency' => $row['regency'],
                'district' => $row['district'] ?? '',
                'address' => $row['address'],
                'roadName' => $row['road_name'],
                'roadType' => $row['road_type'],
                'corridorType' => $row['corridor_type'],
                'coordinates' => [
                    'lat' => (float)$row['latitude'],
                    'lng' => (float)$row['longitude']
                ],
                'type' => $row['media_type'],
                'dimensions' => [
                    'width' => (float)$row['width_m'],
                    'height' => (float)$row['height_m'],
                    'areaM2' => (float)$row['area_m2'],
                    'sides' => (int)($row['sides'] ?? 1)
                ],
                'orientation' => $row['orientation'],
                'heightAboveGroundM' => 9.0,
                'viewingDistanceM' => (float)$row['viewing_distance_m'],
                'dailyGrossReach' => (int)$row['daily_gross_reach'],
                'vacDaily' => (int)$row['vac_daily'],
                'avgDwellTimeSec' => (float)$row['avg_dwell_time_sec'],
                'avgSpeedKmh' => (float)$row['avg_speed_kmh'],
                'trafficBreakdown' => [
                    'motorcycles' => 55,
                    'privateCars' => 35,
                    'publicTransport' => 7,
                    'commercialTrucks' => 3
                ],
                'visibilityScore' => (float)$row['visibility_score'],
                'clutterLevel' => $row['clutter_level'],
                'effectivenessScore' => (float)$row['effectiveness_score'],
                'occupancyStatus' => $row['occupancy_status'],
                'currentBrand' => $row['current_brand'] ?? '',
                'ratePerMonthIdr' => (int)$row['rate_per_month_idr'],
                'cpmIdr' => (float)$row['cpm_idr'],
                'lightingType' => $row['lighting_type'],
                'facingDirection' => $row['facing_direction'],
                'powerConsumptionKw' => 15,
                'targetDemographics' => $row['target_demographics'] ?? 'SES A/B'
            ];
        }

        returnResponse(true, $formatted, count($formatted), 'database');
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Data tidak lengkap']);
            exit;
        }

        $id = $input['id'] ?? ('spot_' . time());
        $code = $input['code'] ?? ('BDG-' . rand(100, 999));

        $stmt = $pdo->prepare("INSERT INTO billboard_spots (
            spot_id, spot_code, name, regency, district, address, road_name, road_type, corridor_type,
            latitude, longitude, media_type, width_m, height_m, area_m2, sides, orientation,
            viewing_distance_m, daily_gross_reach, vac_daily, avg_dwell_time_sec, avg_speed_kmh,
            visibility_score, effectiveness_score, clutter_level, occupancy_status, current_brand,
            rate_per_month_idr, cpm_idr, lighting_type, facing_direction, target_demographics
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?
        )");

        $stmt->execute([
            $id, $code, $input['name'], $input['regency'] ?? 'Kota Bandung', $input['district'] ?? '',
            $input['address'] ?? $input['name'], $input['roadName'] ?? 'Jl. Utama', $input['roadType'] ?? 'Jalan Arteri Primer', $input['corridorType'] ?? 'Jalur Komersial & Retail',
            $input['coordinates']['lat'] ?? -6.9175, $input['coordinates']['lng'] ?? 107.6191, $input['type'] ?? 'Billboard Statis',
            $input['dimensions']['width'] ?? 12, $input['dimensions']['height'] ?? 6, $input['dimensions']['areaM2'] ?? 72, $input['dimensions']['sides'] ?? 1, $input['orientation'] ?? 'Frontal',
            $input['viewingDistanceM'] ?? 120, $input['dailyGrossReach'] ?? 50000, $input['vacDaily'] ?? 35000, $input['avgDwellTimeSec'] ?? 15, $input['avgSpeedKmh'] ?? 30,
            $input['visibilityScore'] ?? 8.5, $input['effectivenessScore'] ?? 80, $input['clutterLevel'] ?? 'Sedang', $input['occupancyStatus'] ?? 'Tersedia', $input['currentBrand'] ?? '',
            $input['ratePerMonthIdr'] ?? 35000000, $input['cpmIdr'] ?? 18500, $input['lightingType'] ?? 'Frontlight LED', $input['facingDirection'] ?? 'Arah Kota',
            $input['targetDemographics'] ?? 'SES A/B'
        ]);

        echo json_encode(['success' => true, 'message' => 'Titik berhasil disimpan', 'id' => $id]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function returnResponse($success, $data, $count, $source) {
    echo json_encode([
        'success' => $success,
        'source' => $source,
        'count' => $count,
        'data' => $data
    ]);
    exit;
}
