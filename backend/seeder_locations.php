<?php
/**
 * Standalone Seeder for Store Locations
 * Usage (Local): php backend/seeder_locations.php
 * Usage (cPanel): php api/seeder_locations.php
 */

require_once __DIR__ . '/vendor/autoload.php';
$config = require __DIR__ . '/config/database.php';

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], $config['options']);

    echo "--- STORE LOCATIONS SEEDER START ---\n";

    // 1. Limpiar datos previos
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("TRUNCATE TABLE store_locations");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "Table truncated.\n";

    $cities = [
        'Guayaquil' => [
            'Urdesa Central',
            'Urdesa Norte',
            'Kennedy Norte',
            'Kennedy Vieja',
            'Mall del Sol',
            'CityMall',
            'Riocentro Entre Ríos',
            'Riocentro Ceibos',
            'Riocentro Sur',
            'Riocentro El Dorado',
            'Plaza Quil',
            'San Marino'
        ],
        'Quito' => [
            'La Carolina',
            'La Mariscal',
            'Quicentro Shopping',
            'Centro Comercial El Jardín',
            'Cumbayá',
            'Tumbaco',
            'Valle de los Chillos',
            'Condado Shopping',
            'CCI',
            'Scala Shopping',
            'Iñaquito',
            'Gonzalez Suarez'
        ],
        'Cuenca' => [
            'Centro Histórico',
            'Av. Remigio Crespo',
            'Mall del Río',
            'Totoracocha',
            'Monay Shopping',
            'Sullana',
            'Puertas del Sol',
            'El Ejido',
            'Don Bosco',
            'Calle Larga',
            'Yanuncay',
            'Baños'
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO store_locations (city, store_name, address, is_active, display_order) VALUES (?, ?, ?, 1, ?)");

    foreach ($cities as $city => $stores) {
        echo "Processing $city...\n";
        foreach ($stores as $index => $store) {
            $storeName = "LISTO! $store";
            $address = "Av. Principal de $store y Calle " . rand(1, 100);
            $stmt->execute([$city, $storeName, $address, $index]);
        }
    }

    echo "--- SEEDER FINISHED SUCCESSFULLY ---\n";

} catch (PDOException $e) {
    die("Database Error: " . $e->getMessage());
} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
