<?php
declare(strict_types=1);
require __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim($_POST['user'] ?? '');
    $pass = (string)($_POST['pass'] ?? '');
    $csrf = $_POST['csrf'] ?? '';
    checkCsrf($csrf);

    if ($user === ADMIN_USER && $pass === 'sesadmin123') {
        $_SESSION['admin_logged_in'] = true;
        header('Location: /admin/index.php');
        exit;
    } else {
        $error = 'Неверные логин или пароль';
    }
}
$csrf = csrfToken();
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Вход в админку</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;max-width:420px;margin:40px auto;padding:0 16px}form{display:grid;gap:12px}input,button,select,textarea{padding:10px;font:inherit} .error{color:#b00020}</style>
</head>
<body>
  <h1>Админ-панель</h1>
  <?php if (!empty($error)): ?><p class="error"><?=h($error)?></p><?php endif; ?>
  <form method="post" action="/admin/login.php" autocomplete="off">
    <input type="hidden" name="csrf" value="<?=$csrf?>">
    <label>Логин<br><input name="user" required autofocus></label>
    <label>Пароль<br><input name="pass" type="password" required></label>
    <button type="submit">Войти</button>
  </form>
</body>
</html>