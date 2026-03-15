<?php
/**
 * Standalone Seeder for Video Gallery Mock Data
 * Usage (Local): php backend/seeder_videos.php
 * Usage (cPanel): php api/seeder_videos.php
 */

require_once __DIR__ . '/vendor/autoload.php';
$config = require __DIR__ . '/config/database.php';

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], $config['options']);

    echo "--- AMSTEL WEBAR SEEDER START ---\n";

    // 1. Limpiar datos previos
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("TRUNCATE TABLE tournament_videos");
    $pdo->exec("TRUNCATE TABLE tournament_phases");
    $pdo->exec("TRUNCATE TABLE tournament_finals");
    $pdo->exec("TRUNCATE TABLE tournaments");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "Tables truncated.\n";

    // 2. Torneos (2022 - 2026)
    $tournamentsData = [
        ['year' => 2026, 'name' => 'CONMEBOL LIBERTADORES 2026'],
        ['year' => 2025, 'name' => 'CONMEBOL LIBERTADORES 2025'],
        ['year' => 2024, 'name' => 'CONMEBOL LIBERTADORES 2024'],
        ['year' => 2023, 'name' => 'CONMEBOL LIBERTADORES 2023'],
        ['year' => 2022, 'name' => 'CONMEBOL LIBERTADORES 2022'],
    ];

    $stmtTournament = $pdo->prepare("INSERT INTO tournaments (year, name, display_order, is_active) VALUES (?, ?, ?, 1)");
    $tournamentIds = [];
    foreach ($tournamentsData as $index => $t) {
        $stmtTournament->execute([$t['year'], $t['name'], $index]);
        $tournamentIds[$t['year']] = $pdo->lastInsertId();
    }
    echo "Tournaments inserted.\n";

    // 3. Fases base
    $phasesBase = [
        ['name' => 'FASE 1', 'has_sub_phases' => 1, 'order' => 1],
        ['name' => 'FASE 2', 'has_sub_phases' => 0, 'order' => 2],
        ['name' => 'FASE 3', 'has_sub_phases' => 0, 'order' => 3],
        ['name' => 'FASE GRUPOS', 'has_sub_phases' => 1, 'order' => 4],
        ['name' => 'OCTAVOS', 'has_sub_phases' => 1, 'order' => 5],
        ['name' => 'CUARTOS', 'has_sub_phases' => 1, 'order' => 6],
        ['name' => 'SEMIS', 'has_sub_phases' => 1, 'order' => 7],
        ['name' => 'FINAL', 'has_sub_phases' => 0, 'order' => 8],
    ];

    // 4. Prepare Statements
    $stmtPhase = $pdo->prepare("INSERT INTO tournament_phases (tournament_id, name, slug, phase_type, has_sub_phases, display_order, is_unlocked) VALUES (?, ?, ?, 'knockout', ?, ?, ?)");
    $stmtVideo = $pdo->prepare("INSERT INTO tournament_videos (phase_id, sub_phase, title, video_url, thumbnail_url, video_type, display_order, is_active) VALUES (?, ?, ?, '/amstel/assets/videos/test-video.mp4', ?, 'mp4', ?, 1)");
    $stmtFinal = $pdo->prepare("INSERT INTO tournament_finals (tournament_id, team_home_name, team_home_logo_url, team_away_name, team_away_logo_url, score_home, score_away, stadium_name, match_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    // 5. Replicar para cada año deseado (2022 - 2026)
    foreach ($tournamentIds as $year => $tid) {
        echo "Processing Year: $year...\n";

        $currentYearPhaseIds = [];
        foreach ($phasesBase as $p) {
            $slug = strtolower(str_replace(' ', '-', $p['name'])) . "-$year";
            $isUnlocked = ($p['name'] === 'FASE 1') ? 1 : 0;
            $stmtPhase->execute([$tid, $p['name'], $slug, $p['has_sub_phases'], $p['order'], $isUnlocked]);
            $currentYearPhaseIds[$p['name']] = $pdo->lastInsertId();
        }

        // Generar videos para todas las fases
        foreach ($phasesBase as $p) {
            $phaseId = $currentYearPhaseIds[$p['name']];

            // SI ES 2025: Poblamos con 5 videos por fase.
            // OTROS AÑOS: Solo 1 video placeholder por fase.
            if ($year == 2025) {
                $numVideos = ($p['name'] === 'FINAL') ? 1 : 5;
            } else {
                $numVideos = 1;
            }

            for ($i = 1; $i <= $numVideos; $i++) {
                $subPhase = null;
                if ($p['has_sub_phases']) {
                    if ($p['name'] === 'FASE GRUPOS') {
                        $subPhase = "FECHA $i";
                    } else {
                        $subPhase = ($i % 2 === 0) ? 'VUELTA' : 'IDA';
                    }
                }

                $stmtVideo->execute([
                    $phaseId,
                    $subPhase,
                    "{$p['name']} - PARTIDO #$i",
                    "/amstel/assets/images/thumbnail-partido.png",
                    $i
                ]);
            }
        }

        // Finales Data (Scoreboard)
        $stmtFinal->execute([
            $tid,
            'Palmeiras',
            '/amstel/assets/images/escudo-palmeiras.png',
            'Flamengo',
            '/amstel/assets/images/escudo-flamengo.png',
            ($year == 2025) ? 1 : 0, // Score real mock para 2025
            ($year == 2025) ? 0 : 0,
            'Estadio Monumental de Ate',
            "$year-11-20"
        ]);
    }

    echo "--- SEEDER FINISHED SUCCESSFULLY ---\n";

} catch (PDOException $e) {
    die("Database Error: " . $e->getMessage());
} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
