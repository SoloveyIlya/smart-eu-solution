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
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    .msg{white-space:pre-wrap}
    .badge-status{font-size:0.75em}
  </style>
</head>
<body class="bg-light">
<div class="container-fluid py-4">
  <div class="row">
    <div class="col-12">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h2 mb-0">
          <i class="bi bi-inbox me-2"></i>Заявки
        </h1>
        <a href="/admin/logout.php" class="btn btn-outline-danger">
          <i class="bi bi-box-arrow-right me-1"></i>Выйти
        </a>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <form method="get" action="/admin/index.php" class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Статус:</label>
              <select name="status" class="form-select" onchange="this.form.submit()">
                <option value="new" <?= $status==='new'?'selected':'' ?>>Новые</option>
                <option value="processed" <?= $status==='processed'?'selected':'' ?>>Обработанные</option>
                <option value="spam" <?= $status==='spam'?'selected':'' ?>>Спам</option>
                <option value="all" <?= $status==='all'?'selected':'' ?>>Все</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">На странице:</label>
              <select name="pp" class="form-select" onchange="this.form.submit()">
                <?php foreach ([20,50,100] as $pp): ?>
                  <option value="<?=$pp?>" <?= $perPage===$pp?'selected':'' ?>><?=$pp?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-md-5">
              <label class="form-label">Поиск:</label>
              <input type="search" name="q" class="form-control" value="<?=h($q)?>" placeholder="Поиск (имя, email, сообщение)">
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button type="submit" class="btn btn-primary w-100">
                <i class="bi bi-search me-1"></i>Искать
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th class="text-center" style="width: 60px;">ID</th>
                  <th style="width: 140px;">Дата</th>
                  <th style="width: 200px;">Контакт</th>
                  <th>Сообщение</th>
                  <th style="width: 200px;">Тех.инфо</th>
                  <th class="text-center" style="width: 100px;">Статус</th>
                  <th class="text-center" style="width: 200px;">Действия</th>
                </tr>
              </thead>
              <tbody>
              <?php foreach ($rows as $r): ?>
                <tr>
                  <td class="text-center">
                    <span class="badge bg-secondary"><?= (int)$r['id'] ?></span>
                  </td>
                  <td>
                    <small class="text-muted"><?= h($r['created_at']) ?></small>
                  </td>
                  <td>
                    <div class="fw-bold"><?= h($r['name']) ?></div>
                    <?php if ($r['email']): ?>
                      <div class="small text-primary">
                        <i class="bi bi-envelope me-1"></i><?= h($r['email']) ?>
                      </div>
                    <?php endif; ?>
                    <?php if ($r['phone']): ?>
                      <div class="small text-success">
                        <i class="bi bi-telephone me-1"></i><?= h($r['phone']) ?>
                      </div>
                    <?php endif; ?>
                  </td>
                  <td class="msg"><?= h($r['message']) ?></td>
                  <td>
                    <div class="small">
                      <div><strong>IP:</strong> <?= h($r['ip'] ?? '') ?></div>
                      <div class="text-break" style="max-width:180px;">
                        <strong>UA:</strong> <?= h($r['user_agent']) ?>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <?php
                      $badgeClass = match($r['status']) {
                        'new' => 'bg-primary',
                        'processed' => 'bg-success',
                        'spam' => 'bg-danger',
                        default => 'bg-secondary'
                      };
                      echo '<span class="badge '.$badgeClass.' badge-status">'.h($r['status']).'</span>';
                    ?>
                  </td>
                  <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                      <form method="post" action="/admin/update.php" class="d-inline" onsubmit="return confirm('Отметить как обработано?')">
                        <input type="hidden" name="csrf" value="<?=$csrf?>">
                        <input type="hidden" name="id" value="<?=$r['id']?>">
                        <input type="hidden" name="action" value="processed">
                        <button type="submit" class="btn btn-success btn-sm">
                          <i class="bi bi-check"></i>
                        </button>
                      </form>
                      <form method="post" action="/admin/update.php" class="d-inline" onsubmit="return confirm('Пометить как спам?')">
                        <input type="hidden" name="csrf" value="<?=$csrf?>">
                        <input type="hidden" name="id" value="<?=$r['id']?>">
                        <input type="hidden" name="action" value="spam">
                        <button type="submit" class="btn btn-warning btn-sm">
                          <i class="bi bi-exclamation-triangle"></i>
                        </button>
                      </form>
                      <form method="post" action="/admin/update.php" class="d-inline" onsubmit="return confirm('Удалить запись навсегда?')">
                        <input type="hidden" name="csrf" value="<?=$csrf?>">
                        <input type="hidden" name="id" value="<?=$r['id']?>">
                        <input type="hidden" name="action" value="delete">
                        <button type="submit" class="btn btn-danger btn-sm">
                          <i class="bi bi-trash"></i>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <?php
      $pages = max(1, (int)ceil($total / $perPage));
      ?>
      <div class="d-flex justify-content-between align-items-center mt-4">
        <div class="text-muted">
          <i class="bi bi-info-circle me-1"></i>Всего записей: <strong><?=$total?></strong>
        </div>
        <?php if ($pages > 1): ?>
          <nav aria-label="Пагинация">
            <ul class="pagination pagination-sm mb-0">
              <?php if ($page > 1): ?>
                <li class="page-item">
                  <a class="page-link" href="<?=urlKeep(['page'=>$page-1])?>">
                    <i class="bi bi-chevron-left"></i>
                  </a>
                </li>
              <?php endif; ?>
              
              <li class="page-item active">
                <span class="page-link"><?=$page?> / <?=$pages?></span>
              </li>
              
              <?php if ($page < $pages): ?>
                <li class="page-item">
                  <a class="page-link" href="<?=urlKeep(['page'=>$page+1])?>">
                    <i class="bi bi-chevron-right"></i>
                  </a>
                </li>
              <?php endif; ?>
            </ul>
          </nav>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>