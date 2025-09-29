// Header + menu logic (robust)
document.addEventListener('DOMContentLoaded', function() {
  const header = document.getElementById('main-header');
  const burger = document.querySelector('.burger-menu');
  const mainNav = document.querySelector('.main-nav');
  const navOverlay = document.querySelector('.nav-overlay');
  const navLinks = document.querySelectorAll('.nav-links a');
  const headerPhone = document.querySelector('.header-phone');

  if (!header) {
    console.warn('Header element not found (#main-header).');
    return;
  }

  // Ensure initial state
  function applyScrolledState() {
    if (window.scrollY > 50) {
      if (!header.classList.contains('scrolled')) header.classList.add('scrolled');
      // as a fallback ensure computed style visible
      header.style.backgroundColor = header.style.backgroundColor || '';
    } else {
      header.classList.remove('scrolled');
      header.style.backgroundColor = '';
    }
  }

  // run on load and scroll
  applyScrolledState();
  window.addEventListener('scroll', applyScrolledState);

  // Menu open/close
  function openMenu() {
    burger.classList.add('active');
    mainNav.classList.add('active');
    navOverlay.classList.add('active');
    header.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    burger.classList.remove('active');
    mainNav.classList.remove('active');
    navOverlay.classList.remove('active');
    header.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', function() {
    if (burger.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navOverlay.addEventListener('click', closeMenu);

  // Clean link handling:
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href') || '';

      // If it's an in-page anchor (#...), handle smooth scroll.
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href;
        closeMenu();

        // Wait until menu closed animation finished (match CSS transition ~300-400ms)
        setTimeout(() => {
          const target = document.querySelector(targetId);
          if (target) {
            const navHeight = header.offsetHeight || 0;
            const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 8; // -8 px для отступа
            window.scrollTo({ top, behavior: 'smooth' });
          } else {
            // если цель не найдена — просто скроллим наверх или логируем
            console.warn('Anchor target not found:', targetId);
          }
        }, 340); // соответствует transition в CSS
      } else {
        // Для внешних ссылок/tel/mailto — пусть работают по умолчанию
        // Ничего не делаем
      }
    });
  });

  // Закрыть Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMenu();
  });

  // На ресайзе — если экран широкий — закрываем мобильное меню
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) closeMenu();
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
  
  btnConsultation.addEventListener('click', () => {
    // Здесь можно добавить логику для открытия формы консультации
    alert('Спасибо за интерес! С вами свяжется наш специалист для консультации.');
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

// Добавьте этот код в ваш script.js для обработки формы

// Обработчик формы обратной связи
document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.querySelector('.feedback-form');
  
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Получаем данные формы
      const formData = new FormData(feedbackForm);
      const phone = formData.get('phone');
      const message = formData.get('message');
      
      // Валидация телефона (базовая)
      if (!phone || phone.trim() === '') {
        alert('Пожалуйста, введите номер телефона');
        return;
      }
      
      // Временно показываем сообщение об успехе
      alert('Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.');
      
      // Очищаем форму
      feedbackForm.reset();
    });
  }
});

