<?php
declare(strict_types=1);
require __DIR__ . '/../config.php';
requireAdmin();

$pdo = pdo();

// фильтры/пагинация
$status = $_GET['status'] ?? 'new'; // new | processed | spam | all
$perPage = max(10, min(100, (int)($_GET['pp'] ?? 20)));
$page = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $perPage;

$params = [];
$where = '1';
if ($status !== 'all') {
    $where .= ' AND status = :status';
    $params[':status'] = $status;
}
$q = trim($_GET['q'] ?? '');
if ($q !== '') {
    $where .= ' AND (name LIKE :q OR email LIKE :q OR message LIKE :q)';
    $params[':q'] = "%$q%";
}

$total = (int)$pdo->prepare("SELECT COUNT(*) FROM contact_requests WHERE $where")
                 ->execute($params) ?: 0;
$stmtTotal = $pdo->prepare("SELECT COUNT(*) FROM contact_requests WHERE $where");
$stmtTotal->execute($params);
$total = (int)$stmtTotal->fetchColumn();

$sql = "SELECT id, name, email, phone, message, user_agent, INET6_NTOA(ip) AS ip,
               created_at, status
        FROM contact_requests
        WHERE $where
        ORDER BY created_at DESC
        LIMIT :lim OFFSET :off";
$stmt = $pdo->prepare($sql);
foreach ($params as $k=>$v) $stmt->bindValue($k, $v);
$stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
$stmt->bindValue(':off', $offset, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

$csrf = csrfToken();

function urlKeep(array $extra): string {
    $base = array_merge($_GET, $extra);
    return '/admin/index.php?' . http_build_query($base);
}
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Заявки — админка</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:20px}
    header{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
    table{border-collapse:collapse;width:100%;margin-top:12px}
    th,td{border:1px solid #e5e7eb;padding:8px;vertical-align:top}
    th{background:#f8fafc;text-align:left}
    .badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px}
    .s-new{background:#e0f2fe}
    .s-processed{background:#dcfce7}
    .s-spam{background:#fee2e2}
    .actions{display:flex;gap:8px;flex-wrap:wrap}
    .toolbar{display:flex;gap:8px;align-items:center}
    .pager{margin-top:12px;display:flex;gap:6px;align-items:center}
    input,select,button{padding:8px;font:inherit}
    .msg{white-space:pre-wrap}
  </style>
</head>
<body>
<header>
  <h1>Заявки</h1>
  <nav><a href="/admin/logout.php">Выйти</a></nav>
</header>

<form class="toolbar" method="get" action="/admin/index.php">
  <label>Статус:
    <select name="status" onchange="this.form.submit()">
      <option value="new" <?= $status==='new'?'selected':'' ?>>Новые</option>
      <option value="processed" <?= $status==='processed'?'selected':'' ?>>Обработанные</option>
      <option value="spam" <?= $status==='spam'?'selected':'' ?>>Спам</option>
      <option value="all" <?= $status==='all'?'selected':'' ?>>Все</option>
    </select>
  </label>
  <label>На странице:
    <select name="pp" onchange="this.form.submit()">
      <?php foreach ([20,50,100] as $pp): ?>
        <option value="<?=$pp?>" <?= $perPage===$pp?'selected':'' ?>><?=$pp?></option>
      <?php endforeach; ?>
    </select>
  </label>
  <input type="search" name="q" value="<?=h($q)?>" placeholder="Поиск (имя, email, сообщение)">
  <button type="submit">Искать</button>
</form>

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Дата</th>
      <th>Имя / Email / Телефон</th>
      <th>Сообщение</th>
      <th>Тех.инфо</th>
      <th>Статус</th>
      <th>Действия</th>
    </tr>
  </thead>
  <tbody>
  <?php foreach ($rows as $r): ?>
    <tr>
      <td><?= (int)$r['id'] ?></td>
      <td><?= h($r['created_at']) ?></td>
      <td>
        <div><strong><?= h($r['name']) ?></strong></div>
        <?php if ($r['email']): ?><div><?= h($r['email']) ?></div><?php endif; ?>
        <?php if ($r['phone']): ?><div><?= h($r['phone']) ?></div><?php endif; ?>
      </td>
      <td class="msg"><?= h($r['message']) ?></td>
      <td>
        <div>IP: <?= h($r['ip'] ?? '') ?></div>
        <div style="max-width:320px; word-break:break-word">UA: <?= h($r['user_agent']) ?></div>
      </td>
      <td>
        <?php
          $badgeClass = 's-'.$r['status'];
          echo '<span class="badge '.$badgeClass.'">'.h($r['status']).'</span>';
        ?>
      </td>
      <td class="actions">
        <form method="post" action="/admin/update.php" onsubmit="return confirm('Отметить как обработано?')">
          <input type="hidden" name="csrf" value="<?=$csrf?>">
          <input type="hidden" name="id" value="<?=$r['id']?>">
          <input type="hidden" name="action" value="processed">
          <button>Обработано</button>
        </form>
        <form method="post" action="/admin/update.php" onsubmit="return confirm('Пометить как спам?')">
          <input type="hidden" name="csrf" value="<?=$csrf?>">
          <input type="hidden" name="id" value="<?=$r['id']?>">
          <input type="hidden" name="action" value="spam">
          <button>Спам</button>
        </form>
        <form method="post" action="/admin/update.php" onsubmit="return confirm('Удалить запись навсегда?')">
          <input type="hidden" name="csrf" value="<?=$csrf?>">
          <input type="hidden" name="id" value="<?=$r['id']?>">
          <input type="hidden" name="action" value="delete">
          <button>Удалить</button>
        </form>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>

<?php
$pages = max(1, (int)ceil($total / $perPage));
?>
<div class="pager">
  <div>Всего: <?=$total?></div>
  <?php if ($page>1): ?><a href="<?=urlKeep(['page'=>$page-1])?>">← Назад</a><?php endif; ?>
  <span>Стр. <?=$page?> / <?=$pages?></span>
  <?php if ($page<$pages): ?><a href="<?=urlKeep(['page'=>$page+1])?>">Вперёд →</a><?php endif; ?>
</div>
</body>
</html>