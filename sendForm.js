document.addEventListener('DOMContentLoaded', () => {
    // ставим метку времени РАНО (на рендере)
    const ts = Math.floor(Date.now() / 1000);
    const tsInput = document.getElementById('form_ts');
    if (tsInput) tsInput.value = ts;
  });
  
  document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
  
    // простая локальная проверка длины сообщения
    const msg = (fd.get('message') || '').toString().trim();
    if (msg.length < 5) {
      alert('Сообщение слишком короткое (минимум 5 символов).');
      return;
    }
  
    const res = await fetch(form.action, {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' },
    });
    const data = await res.json();
    console.log(data);
    if (data.ok) {
      alert('Спасибо! Заявка отправлена.');
      form.reset();
      // обновим form_ts после очистки формы
      document.getElementById('form_ts').value = Math.floor(Date.now() / 1000);
    } else {
      alert('Ошибка: ' + (data.errors || []).join(', '));
    }
  });
  