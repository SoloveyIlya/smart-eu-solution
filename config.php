<?php
declare(strict_types=1);
const DB_DSN  = 'mysql:host=db;port=3306;dbname=demo_contact;charset=utf8mb4';
const DB_USER = 'app';
const DB_PASS = 'app';
function pdo(): PDO {
    static $pdo;
    if ($pdo instanceof PDO) return $pdo;
    $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}