<?php
declare(strict_types=1);
require __DIR__ . '/../config.php';
requireAdmin();

$id = (int)($_GET['id'] ?? 0);
if ($id<=0) { header('Location:/admin/index.php'); exit; }

$pdo = pdo();
$stmt = $pdo->prepare("SELECT id, name, email, phone, message, user_agent, INET6_NTOA(ip) AS ip, created_at, status, meta
                       FROM contact_requests WHERE id=:id");
$stmt->execute([':id'=>$id]);
$r = $stmt->fetch();
if (!$r) { http_response_code(404); exit('Not found'); }
$csrf = csrfToken();
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Заявка #<?= (int)$r['id'] ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:20px} pre{white-space:pre-wrap;word-wrap:break-word;background:#f8fafc;padding:12px}</style>
</head>
<body>
  <p><a href="/admin/index.php">← к списку</a></p>
  <h1>Заявка #<?= (int)$r['id'] ?></h1>
  <p><strong>Дата:</strong> <?=h($r['created_at'])?></p>
  <p><strong>Имя:</strong> <?=h($r['name'])?></p>
  <p><strong>Email:</strong> <?=h($r['email'])?></p>
  <p><strong>Телефон:</strong> <?=h($r['phone'])?></p>
  <p><strong>IP:</strong> <?=h($r['ip'])?></p>
  <p><strong>User-Agent:</strong> <?=h($r['user_agent'])?></p>
  <p><strong>Статус:</strong> <?=h($r['status'])?></p>
  <p><strong>Сообщение:</strong></p>
  <pre><?=h($r['message'])?></pre>
  <?php if ($r['meta']): ?>
    <p><strong>Meta (JSON):</strong></p>
    <pre><?=h($r['meta'])?></pre>
  <?php endif; ?>

  <form method="post" action="/admin/update.php" style="display:flex;gap:8px;flex-wrap:wrap">
    <input type="hidden" name="csrf" value="<?=$csrf?>">
    <input type="hidden" name="id" value="<?=$r['id']?>">
    <button name="action" value="processed">Обработано</button>
    <button name="action" value="spam">Спам</button>
    <button name="action" value="delete" onclick="return confirm('Удалить?')">Удалить</button>
  </form>
</body>
</html>