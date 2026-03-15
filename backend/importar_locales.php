<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/src/SimpleXLSX.php';
$config = require __DIR__ . '/config/database.php';

use Shuchkin\SimpleXLSX;

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    if ($_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $tmpName = $_FILES['file']['tmp_name'];
        if ($xlsx = SimpleXLSX::parse($tmpName)) {
            try {
                // Connect to DB
                $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
                $pdo = new PDO($dsn, $config['user'], $config['pass'], $config['options']);

                // TRUNCATE causes an implicit commit in MySQL, so it must happen BEFORE the transaction starts.
                $pdo->exec("TRUNCATE TABLE store_locations");

                // Start transaction
                $pdo->beginTransaction();

                // Prepare insert statement
                $stmt = $pdo->prepare("INSERT INTO store_locations (city, store_name, address, is_active, display_order) VALUES (?, ?, ?, 1, 0)");

                $rows = $xlsx->rows();
                $inserted = 0;

                foreach ($rows as $index => $row) {
                    // Skip header row
                    if ($index === 0 && stripos($row[1], 'CIUDAD') !== false) {
                        continue;
                    }

                    // Map columns based on locales-listo.xlsx:
                    // [0] #, [1] CIUDAD, [2] PROVINCIA, [3] NOMBRE DEL LOCAL, [4] DIRECCION
                    $city = trim($row[1] ?? '');
                    $store_name = trim($row[3] ?? '');
                    $address = trim($row[4] ?? '');

                    // Only insert if it has at least city or store name
                    if (!empty($city) || !empty($store_name)) {
                        $stmt->execute([$city, $store_name, $address]);
                        $inserted++;
                    }
                }

                $pdo->commit();
                $message = "<div style='color: green; font-weight: bold;'>¡Éxito! Se limpiaron los datos demo y se insertaron {$inserted} locales correctamente.</div>";

            } catch (Exception $e) {
                // If a transaction is active, try to roll it back safely
                try {
                    if (isset($pdo) && $pdo->inTransaction()) {
                        $pdo->rollBack();
                    }
                } catch (Exception $rollbackEx) {}
                
                $message = "<div style='color: red;'>Error en base de datos: " . $e->getMessage() . "</div>";
            }
        } else {
            $message = "<div style='color: red;'>Error al leer el archivo Excel: " . SimpleXLSX::parseError() . "</div>";
        }
    } else {
        $message = "<div style='color: red;'>Error al subir el archivo.</div>";
    }
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Importador de Locales - Amstel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            padding: 2rem;
        }

        .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #d32f2f;
        }

        .upload-area {
            border: 2px dashed #ccc;
            padding: 2rem;
            text-align: center;
            margin: 1.5rem 0;
            border-radius: 8px;
            background: #fafafa;
        }

        button {
            background: #d32f2f;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 1rem;
            border-radius: 4px;
            cursor: pointer;
        }

        button:hover {
            background: #b71c1c;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>Importador de Locales (Excel)</h1>
        <p>Sube el archivo <strong>locales-listo.xlsx</strong> para limpiar los datos demo actuales y cargar la lista
            final.</p>

        <?php if ($message)
            echo "<p>{$message}</p>"; ?>

        <form action="" method="post" enctype="multipart/form-data">
            <div class="upload-area">
                <input type="file" name="file" accept=".xlsx" required>
            </div>
            <div style="text-align: center;">
                <button type="submit">Limpiar e Importar Locales</button>
            </div>
        </form>
    </div>
</body>

</html>