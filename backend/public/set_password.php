<?php
$config = require __DIR__ . '/config/database.php';
$dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
$pdo = new PDO($dsn, $config['user'], $config['pass']);

$password = 'amstel2026';  // ← Tu contraseña deseada
$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = 'admin@amstel.ec'");
$stmt->execute([$hash]);

echo "Password actualizado para admin@amstel.ec<br>";
echo "Hash: " . $hash;
