// Header + menu logic (robust)
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const burger = document.querySelector('.burger-menu');
  const mainNav = document.querySelector('.main-nav');
  const navOverlay = document.querySelector('.nav-overlay');
  const navLinks = document.querySelectorAll('.nav-links a');
  const menuCloseBtn = document.querySelector('.menu-close-btn');

  if (!header) { console.warn('Header .site-header not found'); return; }

  // Универсальный getter скролла
  function getScrollTop() {
    return window.pageYOffset
        ?? document.documentElement.scrollTop
        ?? document.body.scrollTop
        ?? 0;
  }

  function checkScroll() {
    const y = getScrollTop();
    header.classList.toggle('scrolled', y > 50);
  }

  // rAF-троттлинг
  let ticking = false;
  function onAnyScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        checkScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Подвешиваемся только к window - это основной источник скролла
  window.addEventListener('scroll', onAnyScroll, { passive: true });
  
  // Дополнительно слушаем на document для подстраховки
  document.addEventListener('scroll', onAnyScroll, { passive: true, capture: true });
  
  // Также слушаем на documentElement для старых браузеров
  document.documentElement.addEventListener('scroll', onAnyScroll, { passive: true });

  // Первичный вызов
  checkScroll();

  // --- Меню ---
  function openMenu() {
    burger?.classList.add('active');
    mainNav?.classList.add('active');
    navOverlay?.classList.add('active');
    header.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    burger?.classList.remove('active');
    mainNav?.classList.remove('active');
    navOverlay?.classList.remove('active');
    header.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  burger?.addEventListener('click', () => {
    burger.classList.contains('active') ? closeMenu() : openMenu();
  });
  menuCloseBtn?.addEventListener('click', closeMenu);
  navOverlay?.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href') || '';
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href;
        closeMenu();
        setTimeout(() => {
          const target = document.querySelector(targetId);
          if (target) {
            const navHeight = header.offsetHeight || 0;
            const top = target.getBoundingClientRect().top + (window.pageYOffset || 0) - navHeight - 8;
            window.scrollTo({ top, behavior: 'smooth' });
          } else {
            console.warn('Anchor target not found:', targetId);
          }
        }, 340);
      }
    });
  });

  // Один resize-хендлер
  window.addEventListener('resize', () => {
    checkScroll();
    if (window.innerWidth > 768) closeMenu();
  }, { passive: true });

  // Esc закрывает меню
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // --- ПРЕМИАЛЬНЫЙ КАЛЬКУЛЯТОР С КНОПКОЙ И ОТКАТОМ ---
  const programOptions = document.querySelectorAll('.program-option');
  const counterValue = document.querySelector('.counter-value');
  const minusBtn = document.querySelector('.counter-btn.minus');
  const plusBtn = document.querySelector('.counter-btn.plus');
  const btnNext = document.querySelector('.btn-next');
  const btnBack = document.querySelectorAll('.btn-back');
  const btnCalculate = document.querySelector('.btn-calculate');
  const btnConsultation = document.querySelector('.btn-consultation');
  
  const resultPlaceholder = document.querySelector('.result-placeholder');
  const resultActive = document.querySelector('.result-active');
  const circleProgress = document.querySelector('.circle-progress');
  const resultAmount = document.querySelector('.result-amount');
  const detailBase = document.querySelector('#detail-base');
  const detailChildren = document.querySelector('#detail-children');
  const detailTotal = document.querySelector('#detail-total');
  
  const summaryProgram = document.querySelector('#summary-program');
  const summaryChildren = document.querySelector('#summary-children');
  
  // Состояние
  let selectedProgram = null;
  let childrenCount = 0;
  let currentStep = 1;
  
  // Стоимость за ребенка
  const CHILD_COST = 20;
  
  // Инициализация
  if (counterValue) updateCounterDisplay();
  if (btnNext) updateNextButton();
  
  // Обработчики выбора программы
  if (programOptions) {
    programOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Снимаем выделение со всех опций
        programOptions.forEach(opt => {
          opt.querySelector('.option-card').classList.remove('selected');
        });
        
        // Выделяем выбранную опцию
        option.querySelector('.option-card').classList.add('selected');
        selectedProgram = parseInt(option.dataset.value);
        
        // Активируем кнопку "Продолжить"
        updateNextButton();
      });
    });
  }
  
  // Обработчики счетчика детей
  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      if (childrenCount > 0) {
        childrenCount--;
        updateCounterDisplay();
      }
    });
  }
  
  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      childrenCount++;
      updateCounterDisplay();
    });
  }
  
  // Обработчики навигации
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (selectedProgram !== null) {
        showStep(2);
      }
    });
  }
  
  if (btnCalculate) {
    btnCalculate.addEventListener('click', () => {
      calculateAndShowResult();
    });
  }
  
  if (btnBack) {
    btnBack.forEach(button => {
      button.addEventListener('click', () => {
        if (currentStep === 2) {
          showStep(1);
        } else if (currentStep === 3) {
          showStep(2);
        }
      });
    });
  }
  
  if (btnConsultation) {
    btnConsultation.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Плавная прокрутка к секции feedback-section
      const feedbackSection = document.getElementById('contacts');
      if (feedbackSection) {
        const header = document.querySelector('.site-header');
        const navHeight = header ? header.offsetHeight : 0;
        const targetPosition = feedbackSection.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  }
  
  // Функции калькулятора
  function updateCounterDisplay() {
    if (counterValue) counterValue.textContent = childrenCount;
    if (minusBtn) minusBtn.disabled = childrenCount === 0;
  }
  
  function updateNextButton() {
    if (btnNext) btnNext.disabled = selectedProgram === null;
  }
  
  function showStep(stepNumber) {
    // Скрываем все шаги
    document.querySelectorAll('.form-step').forEach(step => {
      step.classList.remove('active');
    });
    
    // Показываем нужный шаг
    const targetStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (targetStep) targetStep.classList.add('active');
    currentStep = stepNumber;
    
    // Обновляем сводку на шаге 3
    if (stepNumber === 3) {
      updateSummary();
    }
    
    // Скрываем результат при возврате к шагам 1 или 2
    if (stepNumber === 1 || stepNumber === 2) {
      hideResult();
    }
  }
  
  function hideResult() {
    if (resultPlaceholder) resultPlaceholder.style.display = 'block';
    if (resultActive) resultActive.style.display = 'none';
  }
  
  function updateSummary() {
    if (summaryProgram) {
      const programName = selectedProgram === 150 ? 'Обычная программа' : 'Ускоренная программа';
      summaryProgram.textContent = programName;
    }
    if (summaryChildren) summaryChildren.textContent = childrenCount;
  }
  
  function calculateAndShowResult() {
    if (selectedProgram !== null && childrenCount >= 0) {
      const baseCost = selectedProgram;
      const childrenCost = childrenCount * CHILD_COST;
      const totalCost = baseCost + childrenCost;
      
      // Обновляем значения
      if (detailBase) detailBase.textContent = `${baseCost} 000 €`;
      if (detailChildren) detailChildren.textContent = `${childrenCost} 000 €`;
      if (detailTotal) detailTotal.textContent = `${totalCost} 000 €`;
      if (resultAmount) resultAmount.textContent = totalCost;
      
      // Анимация прогресс-круга
      if (circleProgress) {
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (totalCost / 350) * circumference;
        circleProgress.style.strokeDashoffset = offset;
      }
      
      // Показываем активный результат
      if (resultPlaceholder) resultPlaceholder.style.display = 'none';
      if (resultActive) resultActive.style.display = 'block';
      
      // Переходим к шагу 3
      showStep(3);
    }
  }

// --- Reveal Up анимация при скролле ---
document.addEventListener('DOMContentLoaded', () => {
  // Элементы для анимации с разными эффектами
  const revealUpElements = document.querySelectorAll(
    '.challenge-item, .advantage-column, .program-option, .criteria-item'
  );
  
  const revealUpSoftElements = document.querySelectorAll(
    '.benefits-list li, .subtext-list li'
  );

  // Добавляем классы reveal up с задержками для создания каскадного эффекта
  revealUpElements.forEach((el, index) => {
    el.classList.add('reveal-up');
    
    // Добавляем задержки для создания волнового эффекта
    if (index % 3 === 1) el.classList.add('delay-1');
    if (index % 3 === 2) el.classList.add('delay-2');
  });

  // Мягкая анимация для текстовых элементов
  revealUpSoftElements.forEach((el, index) => {
    el.classList.add('reveal-up-soft');
    
    // Добавляем небольшие задержки
    if (index % 2 === 1) el.classList.add('delay-1');
  });

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Анимация один раз
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  // Наблюдаем за всеми элементами
  [...revealUpElements, ...revealUpSoftElements].forEach(el => observer.observe(el));

  // --- РАСКРЫВАЮЩИЕСЯ КАРТОЧКИ ПРОБЛЕМ ---
  const toggleButtons = document.querySelectorAll('.toggle-arrow');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const card = this.closest('.challenge-item');
      const hiddenContent = card.querySelector('.hidden-content');
      
      // Переключаем классы активности
      hiddenContent.classList.toggle('active');
      this.classList.toggle('active');
      
      // Обновляем aria-атрибут для доступности
      const isExpanded = hiddenContent.classList.contains('active');
      this.setAttribute('aria-expanded', isExpanded);
      
      // Прокручиваем к карточке если она не полностью видна
      if (isExpanded) {
        const rect = card.getBoundingClientRect();
        if (rect.bottom > window.innerHeight || rect.top < 0) {
          card.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }
      }
    });
  });
  
  // Закрытие карточек при клике вне области
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.challenge-item.expandable')) {
      document.querySelectorAll('.hidden-content.active').forEach(content => {
        content.classList.remove('active');
      });
      document.querySelectorAll('.toggle-arrow.active').forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Плавная прокрутка для стрелочки
  const scrollArrow = document.querySelector('.scroll-arrow');
  
  if (scrollArrow) {
    scrollArrow.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        const header = document.querySelector('.site-header');
        const navHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  }

  // Обработчик для кнопки "Почему?"
  const whyButton = document.querySelector('.why-button');
  const confidentialSecondary = document.querySelector('.confidential-secondary');
  
  if (whyButton && confidentialSecondary) {
    whyButton.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      // Переключаем состояние
      this.setAttribute('aria-expanded', !isExpanded);
      confidentialSecondary.classList.toggle('hidden');
      
      // Плавная прокрутка к раскрытому контенту
      if (!isExpanded) {
        setTimeout(() => {
          confidentialSecondary.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }, 300);
      }
    });
  }

  // --- reCAPTCHA v3 и обработка формы ---
  const feedbackForm = document.querySelector('.feedback-form');
  const submitBtn = document.querySelector('.feedback-btn');
  const formMessage = document.getElementById('formMessage');
  
  if (!feedbackForm) return;

  // Загрузка reCAPTCHA v3
  function loadRecaptcha() {
    // Проверяем, не загружен ли уже скрипт
    if (document.querySelector('script[src*="recaptcha"]')) return;
    
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=6LdpWeErAAAAAEECRPZ1lu-L-9Ln_JsQMfE7QDn4'; 
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  // Получение токена reCAPTCHA
  function getRecaptchaToken() {
    return new Promise((resolve) => {
      if (typeof grecaptcha === 'undefined') {
        console.warn('reCAPTCHA not loaded');
        resolve(null);
        return;
      }
      
      grecaptcha.ready(() => {
        grecaptcha.execute('6LdpWeErAAAAAEECRPZ1lu-L-9Ln_JsQMfE7QDn4', { action: 'submit' }) 
          .then((token) => {
            resolve(token);
          })
          .catch((error) => {
            console.error('reCAPTCHA error:', error);
            resolve(null);
          });
      });
    });
  }

  // Показать сообщение формы
  function showMessage(text, type = 'success') {
    if (!formMessage) return;
    
    formMessage.textContent = text;
    formMessage.style.display = 'block';
    formMessage.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
    formMessage.style.color = type === 'success' ? '#155724' : '#721c24';
    formMessage.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    
    setTimeout(() => {
      if (formMessage) formMessage.style.display = 'none';
    }, 5000);
  }

  // Валидация формы
  function validateForm(formData) {
    const name = formData.get('name')?.trim() || '';
    const email = formData.get('contact')?.trim() || '';
    
    if (!name) {
      throw new Error('Пожалуйста, введите ваше имя');
    }
    
    if (!email) {
      throw new Error('Пожалуйста, введите email');
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Пожалуйста, введите корректный email');
    }
    
    return true;
  }

  // Обработка отправки формы
  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const originalText = submitBtn?.innerHTML || '';
    if (submitBtn) {
      submitBtn.innerHTML = '<span>Отправка...</span>';
      submitBtn.disabled = true;
    }
    
    try {
      const formData = new FormData(feedbackForm);
      
      // Валидация
      validateForm(formData);
      
      // Получаем токен reCAPTCHA
      const recaptchaToken = await getRecaptchaToken();
      
      if (!recaptchaToken) {
        throw new Error('Ошибка проверки безопасности. Пожалуйста, попробуйте еще раз.');
      }
      
      // Создаем скрытое поле для токена, если его нет
      let recaptchaField = document.getElementById('recaptchaResponse');
      if (!recaptchaField) {
        recaptchaField = document.createElement('input');
        recaptchaField.type = 'hidden';
        recaptchaField.name = 'recaptcha_response';
        recaptchaField.id = 'recaptchaResponse';
        feedbackForm.appendChild(recaptchaField);
      }
      recaptchaField.value = recaptchaToken;
      
      // Имитация успешной отправки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showMessage('Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.', 'success');
      feedbackForm.reset();
      
    } catch (error) {
      console.error('Form submission error:', error);
      showMessage(error.message || 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    }
  });

  // Загружаем reCAPTCHA при загрузке страницы
  loadRecaptcha();
});
});

(function(){
  fetch('/site_settings.json', {cache: 'no-store'}).then(function(res){
    if (!res.ok) throw new Error('no settings');
    return res.json();
  }).then(function(s){
    if (!s) return;

    // ========= PHONE =========
    if (s.phone) {
      var digitsForHref = s.phone.replace(/[^\d+]/g, '');
      // Обновляем href у всех ссылок, имеющих data-site="phone"
      document.querySelectorAll('[data-site="phone"]').forEach(function(el){
        try { el.setAttribute('href', 'tel:' + digitsForHref); } catch(e){}
      });
      // Обновляем текст в помеченных местах (не трогаем другие надписи)
      document.querySelectorAll('[data-site-display="phone"]').forEach(function(el){
        el.textContent = s.phone;
      });
      // Обновляем inline onclick с tel: если встречается
      document.querySelectorAll('[onclick]').forEach(function(b){
        var v = b.getAttribute('onclick');
        if (v && v.indexOf("tel:") !== -1) {
          b.setAttribute('onclick', "window.location.href='tel:" + digitsForHref + "'");
        }
      });
    }

    // ========= EMAIL =========
    if (s.email) {
      document.querySelectorAll('[data-site="email"]').forEach(function(el){
        try { el.setAttribute('href', 'mailto:' + s.email); } catch(e){}
      });
    }

    // ========= WHATSAPP =========
    if (s.whatsapp) {
      var waDigits = s.whatsapp.replace(/\D/g,'');
      if (waDigits.length) {
        document.querySelectorAll('[data-site="wa"]').forEach(function(el){
          try { el.setAttribute('href', 'https://wa.me/' + waDigits); } catch(e){}
        });
      }
    }

  }).catch(function(){ /* fallback: ничего не делаем, остаются статические значения */ });
})();

// Управление видимостью кнопок на основе настроек
class ButtonVisibilityManager {
  constructor() {
      this.settings = null;
      this.init();
  }

  async init() {
      try {
          // Загружаем настройки из JSON файла
          const response = await fetch('/site_settings.json');
          if (!response.ok) {
              throw new Error('Failed to load settings');
          }
          this.settings = await response.json();
          this.applyButtonVisibility();
      } catch (error) {
          console.warn('Could not load button visibility settings:', error);
          // Если файл не загрузился, показываем все кнопки по умолчанию
          this.showAllButtons();
      }
  }

  applyButtonVisibility() {
      if (!this.settings) return;

      const buttonsContainer = document.querySelector('.contact-buttons');
      if (!buttonsContainer) return;

      let visibleButtons = [];

      // Управление кнопкой телефона
      const phoneBtn = document.querySelector('.elegant-btn[data-button-type="phone"]');
      if (phoneBtn) {
          const isVisible = this.settings.show_phone_btn !== 0;
          phoneBtn.style.display = isVisible ? 'flex' : 'none';
          if (isVisible) visibleButtons.push(phoneBtn);
      }

      // Управление кнопкой email
      const emailBtn = document.querySelector('.elegant-btn[data-button-type="email"]');
      if (emailBtn) {
          const isVisible = this.settings.show_email_btn !== 0;
          emailBtn.style.display = isVisible ? 'flex' : 'none';
          if (isVisible) visibleButtons.push(emailBtn);
      }

      // Управление кнопкой WhatsApp
      const waBtn = document.querySelector('.elegant-btn[data-button-type="wa"]');
      if (waBtn) {
          const isVisible = this.settings.show_wa_btn !== 0;
          waBtn.style.display = isVisible ? 'flex' : 'none';
          if (isVisible) visibleButtons.push(waBtn);
      }

      // Обновляем классы контейнера в зависимости от количества видимых кнопок
      this.updateContainerLayout(visibleButtons.length);
  }

  updateContainerLayout(visibleCount) {
      const buttonsContainer = document.querySelector('.contact-buttons');
      if (!buttonsContainer) return;

      // Удаляем все существующие классы компоновки
      buttonsContainer.classList.remove('hidden', 'one-button', 'two-buttons', 'three-buttons');

      // Добавляем соответствующий класс в зависимости от количества видимых кнопок
      switch (visibleCount) {
          case 0:
              buttonsContainer.classList.add('hidden');
              break;
          case 1:
              buttonsContainer.classList.add('one-button');
              break;
          case 2:
              buttonsContainer.classList.add('two-buttons');
              break;
          case 3:
              buttonsContainer.classList.add('three-buttons');
              break;
      }
  }

  showAllButtons() {
      const buttons = document.querySelectorAll('.elegant-btn');
      buttons.forEach(btn => {
          btn.style.display = 'flex';
      });
      this.updateContainerLayout(3);
  }
}

// Инициализация менеджера видимости кнопок
document.addEventListener('DOMContentLoaded', function() {
  new ButtonVisibilityManager();
  
  // Также обновляем видимость при изменении настроек (если нужно в реальном времени)
  if (typeof window.updateButtonVisibility === 'undefined') {
      window.updateButtonVisibility = function() {
          new ButtonVisibilityManager();
      };
  }
});