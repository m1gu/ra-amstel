<?php
// Test 1: PHP version
echo "PHP Version: " . phpversion() . "<br>";

// Test 2: Required extensions
echo "PDO: " . (extension_loaded('pdo') ? 'OK' : 'MISSING') . "<br>";
echo "PDO MySQL: " . (extension_loaded('pdo_mysql') ? 'OK' : 'MISSING') . "<br>";

// Test 3: Autoload exists?
$autoload = __DIR__ . '/vendor/autoload.php';
echo "Autoload path: " . $autoload . "<br>";
echo "Autoload exists: " . (file_exists($autoload) ? 'YES' : 'NO') . "<br>";

// Test 4: Config exists?
$config = __DIR__ . '/config/database.php';
echo "Config path: " . $config . "<br>";
echo "Config exists: " . (file_exists($config) ? 'YES' : 'NO') . "<br>";

// Test 5: DB connection
try {
    $dbConfig = require $config;
    $dsn = "mysql:host={$dbConfig['host']};dbname={$dbConfig['db']};charset={$dbConfig['charset']}";
    $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass']);
    echo "DB Connection: OK<br>";
} catch (Exception $e) {
    echo "DB Error: " . $e->getMessage() . "<br>";
}

// Test 6: Try loading autoload
try {
    require $autoload;
    echo "Autoload: OK<br>";
} catch (Exception $e) {
    echo "Autoload Error: " . $e->getMessage() . "<br>";
}
