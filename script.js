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
});

// --- ПРЕМИАЛЬНЫЙ КАЛЬКУЛЯТОР С КНОПКОЙ И ОТКАТОМ ---
document.addEventListener('DOMContentLoaded', () => {
  // Элементы
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
  updateCounterDisplay();
  updateNextButton();
  
  // Обработчики выбора программы
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
  
  // Обработчики счетчика детей
  minusBtn.addEventListener('click', () => {
    if (childrenCount > 0) {
      childrenCount--;
      updateCounterDisplay();
    }
  });
  
  plusBtn.addEventListener('click', () => {
    childrenCount++;
    updateCounterDisplay();
  });
  
  // Обработчики навигации
  btnNext.addEventListener('click', () => {
    if (selectedProgram !== null) {
      showStep(2);
    }
  });
  
  btnCalculate.addEventListener('click', () => {
    calculateAndShowResult();
  });
  
  btnBack.forEach(button => {
    button.addEventListener('click', () => {
      if (currentStep === 2) {
        showStep(1);
      } else if (currentStep === 3) {
        showStep(2);
      }
    });
  });
  
  btnConsultation.addEventListener('click', (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение ссылки
    
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
  
  // Функции
  function updateCounterDisplay() {
    counterValue.textContent = childrenCount;
    minusBtn.disabled = childrenCount === 0;
  }
  
  function updateNextButton() {
    btnNext.disabled = selectedProgram === null;
  }
  
  function showStep(stepNumber) {
    // Скрываем все шаги
    document.querySelectorAll('.form-step').forEach(step => {
      step.classList.remove('active');
    });
    
    // Показываем нужный шаг
    document.querySelector(`.form-step[data-step="${stepNumber}"]`).classList.add('active');
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
    resultPlaceholder.style.display = 'block';
    resultActive.style.display = 'none';
  }
  
  function updateSummary() {
    const programName = selectedProgram === 150 ? 'Обычная программа' : 'Ускоренная программа';
    summaryProgram.textContent = programName;
    summaryChildren.textContent = childrenCount;
  }
  
  function calculateAndShowResult() {
    if (selectedProgram !== null && childrenCount >= 0) {
      const baseCost = selectedProgram;
      const childrenCost = childrenCount * CHILD_COST;
      const totalCost = baseCost + childrenCost;
      
      // Обновляем значения
      detailBase.textContent = `${baseCost} 000 €`;
      detailChildren.textContent = `${childrenCost} 000 €`;
      detailTotal.textContent = `${totalCost} 000 €`;
      resultAmount.textContent = totalCost;
      
      // Анимация прогресс-круга
      const circumference = 2 * Math.PI * 54;
      const offset = circumference - (totalCost / 350) * circumference;
      circleProgress.style.strokeDashoffset = offset;
      
      // Показываем активный результат
      resultPlaceholder.style.display = 'none';
      resultActive.style.display = 'block';
      
      // Переходим к шагу 3
      showStep(3);
    }
  }
});

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
    threshold: 0.15, // элемент должен быть виден на 15%
    rootMargin: '0px 0px -50px 0px' // анимация начинается немного раньше
  });

  // Наблюдаем за всеми элементами
  [...revealUpElements, ...revealUpSoftElements].forEach(el => observer.observe(el));
});

// --- РАСКРЫВАЮЩИЕСЯ КАРТОЧКИ ПРОБЛЕМ ---
document.addEventListener('DOMContentLoaded', () => {
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
});

// Плавная прокрутка для стрелочки
document.addEventListener('DOMContentLoaded', () => {
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
});

// Обработчик для кнопки "Почему?"
document.addEventListener('DOMContentLoaded', () => {
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
});