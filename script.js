(function() {
  'use strict';

  const app = {
    state: {
      burgerOpen: false,
      formSubmitting: false
    },

    selectors: {
      burgerToggle: '.c-nav__toggle',
      nav: '.c-nav#main-nav',
      navList: '.c-nav__list',
      navLinks: '.c-nav__link',
      forms: 'form.c-form, form.needs-validation',
      images: 'img',
      scrollToTopBtn: '.js-scroll-top',
      modalTriggers: '[data-modal]',
      modalClose: '[data-modal-close]',
      privacyLinks: 'a[href*="privacy"]'
    },

    init() {
      this.initBurgerMenu();
      this.initSmoothScroll();
      this.initActiveMenu();
      this.initForms();
      this.initImages();
      this.initScrollToTop();
      this.initModals();
      this.initCountUp();
    },

    initBurgerMenu() {
      const toggle = document.querySelector(this.selectors.burgerToggle);
      const nav = document.querySelector(this.selectors.nav);
      const navList = document.querySelector(this.selectors.navList);
      
      if (!toggle || !nav || !navList) return;

      const closeBurger = () => {
        this.state.burgerOpen = false;
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('u-no-scroll');
        document.removeEventListener('keydown', trapFocus);
      };

      const openBurger = () => {
        this.state.burgerOpen = true;
        nav.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('u-no-scroll');
        
        const focusable = navList.querySelectorAll('a, button');
        if (focusable.length > 0) focusable[0].focus();
        
        document.addEventListener('keydown', trapFocus);
      };

      const trapFocus = (e) => {
        if (!this.state.burgerOpen) return;
        
        const focusable = Array.from(navList.querySelectorAll('a, button'));
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.state.burgerOpen ? closeBurger() : openBurger();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.burgerOpen) {
          closeBurger();
          toggle.focus();
        }
      });

      document.addEventListener('click', (e) => {
        if (this.state.burgerOpen && !nav.contains(e.target)) {
          closeBurger();
        }
      });

      document.querySelectorAll(this.selectors.navLinks).forEach(link => {
        link.addEventListener('click', () => {
          if (this.state.burgerOpen) closeBurger();
        });
      });

      window.addEventListener('resize', this.debounce(() => {
        if (window.innerWidth >= 1024 && this.state.burgerOpen) {
          closeBurger();
        }
      }, 100));
    },

    initSmoothScroll() {
      const getHeaderHeight = () => {
        const header = document.querySelector('.l-header');
        return header ? header.offsetHeight : 80;
      };

      const scrollToTarget = (target) => {
        const headerHeight = getHeaderHeight();
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      };

      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href === '#' || href === '#!') return;

        const targetId = href.replace('#', '');
        const target = document.getElementById(targetId);

        if (target) {
          e.preventDefault();
          scrollToTarget(target);
          history.pushState(null, '', href);
        }
      });
    },

    initActiveMenu() {
      const currentPath = window.location.pathname;
      const links = document.querySelectorAll(this.selectors.navLinks);

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        let isActive = false;

        if (href === '/' || href === '/index.html') {
          isActive = currentPath === '/' || currentPath.endsWith('/index.html');
        } else if (!href.includes('#')) {
          isActive = currentPath === href || currentPath.endsWith(href);
        }

        if (isActive) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        } else {
          link.removeAttribute('aria-current');
          link.classList.remove('active');
        }
      });
    },

    initForms() {
      const forms = document.querySelectorAll(this.selectors.forms);
      
      forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (this.state.formSubmitting) return;

          const isValid = this.validateForm(form);
          
          if (!isValid) {
            form.classList.add('was-validated');
            return;
          }

          this.submitForm(form);
        });
      });
    },

    validateForm(form) {
      const fields = {
        name: form.querySelector('#contact-name'),
        email: form.querySelector('#contact-email'),
        phone: form.querySelector('#contact-phone'),
        message: form.querySelector('#contact-message'),
        privacy: form.querySelector('#contact-privacy')
      };

      let isValid = true;

      if (fields.name && fields.name.value.trim().length < 2) {
        this.showFieldError(fields.name, 'Bitte geben Sie einen gültigen Namen ein (mind. 2 Zeichen).');
        isValid = false;
      } else if (fields.name) {
        this.clearFieldError(fields.name);
      }

      if (fields.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(fields.email.value.trim())) {
          this.showFieldError(fields.email, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
          isValid = false;
        } else {
          this.clearFieldError(fields.email);
        }
      }

      if (fields.phone) {
        const phonePattern = /^[\d\s\+\(\)\-]{10,20}$/;
        if (!phonePattern.test(fields.phone.value.trim())) {
          this.showFieldError(fields.phone, 'Bitte geben Sie eine gültige Telefonnummer ein.');
          isValid = false;
        } else {
          this.clearFieldError(fields.phone);
        }
      }

      if (fields.message && fields.message.value.trim().length < 10) {
        this.showFieldError(fields.message, 'Bitte geben Sie eine Nachricht mit mindestens 10 Zeichen ein.');
        isValid = false;
      } else if (fields.message) {
        this.clearFieldError(fields.message);
      }

      if (fields.privacy && !fields.privacy.checked) {
        this.showFieldError(fields.privacy, 'Bitte akzeptieren Sie die Datenschutzerklärung.');
        isValid = false;
      } else if (fields.privacy) {
        this.clearFieldError(fields.privacy);
      }

      return isValid;
    },

    showFieldError(field, message) {
      field.classList.add('is-invalid');
      const feedback = field.parentElement.querySelector('.invalid-feedback');
      if (feedback) feedback.textContent = message;
    },

    clearFieldError(field) {
      field.classList.remove('is-invalid');
    },

    submitForm(form) {
      this.state.formSubmitting = true;
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
      }

      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => { data[key] = value; });

      setTimeout(() => {
        this.state.formSubmitting = false;
        
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        this.notify('Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.', 'success');
        
        setTimeout(() => {
          window.location.href = 'thank_you.html';
        }, 1500);
      }, 1000);
    },

    initImages() {
      const images = document.querySelectorAll(this.selectors.images);
      const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext fill="%23495057" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EBild nicht verfügbar%3C/text%3E%3C/svg%3E';

      images.forEach(img => {
        if (!img.classList.contains('img-fluid')) {
          img.classList.add('img-fluid');
        }

        const isCritical = img.hasAttribute('data-critical') || img.classList.contains('c-logo__img');
        if (!img.hasAttribute('loading') && !isCritical) {
          img.setAttribute('loading', 'lazy');
        }

        img.addEventListener('error', function() {
          this.src = placeholder;
          if (this.closest('.c-logo')) {
            this.style.maxHeight = '40px';
          }
        });
      });
    },

    initScrollToTop() {
      const btn = document.querySelector(this.selectors.scrollToTopBtn);
      
      if (!btn) {
        const newBtn = document.createElement('button');
        newBtn.className = 'c-scroll-top js-scroll-top';
        newBtn.setAttribute('aria-label', 'Nach oben scrollen');
        newBtn.innerHTML = '↑';
        document.body.appendChild(newBtn);
      }

      const scrollBtn = document.querySelector(this.selectors.scrollToTopBtn);
      if (!scrollBtn) return;

      const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
          scrollBtn.classList.add('is-visible');
        } else {
          scrollBtn.classList.remove('is-visible');
        }
      };

      window.addEventListener('scroll', this.throttle(toggleVisibility, 200));

      scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },

    initModals() {
      const triggers = document.querySelectorAll(this.selectors.modalTriggers);
      
      triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const modalId = trigger.getAttribute('data-modal');
          const modal = document.getElementById(modalId);
          
          if (modal) {
            this.openModal(modal);
          }
        });
      });

      const closeButtons = document.querySelectorAll(this.selectors.modalClose);
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const modal = btn.closest('.c-modal');
          if (modal) this.closeModal(modal);
        });
      });
    },

    openModal(modal) {
      modal.classList.add('is-open');
      document.body.classList.add('u-no-scroll');
      
      const backdrop = document.createElement('div');
      backdrop.className = 'c-modal-backdrop';
      backdrop.addEventListener('click', () => this.closeModal(modal));
      document.body.appendChild(backdrop);
    },

    closeModal(modal) {
      modal.classList.remove('is-open');
      document.body.classList.remove('u-no-scroll');
      
      const backdrop = document.querySelector('.c-modal-backdrop');
      if (backdrop) backdrop.remove();
    },

    initCountUp() {
      const stats = document.querySelectorAll('[data-count]');
      
      stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'), 10);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && current === 0) {
              const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                  stat.textContent = target;
                  clearInterval(timer);
                } else {
                  stat.textContent = Math.floor(current);
                }
              }, 16);
              
              observer.unobserve(stat);
            }
          });
        }, { threshold: 0.5 });

        observer.observe(stat);
      });
    },

    notify(message, type = 'info') {
      let container = document.querySelector('.toast-container');
      
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.cssText = 'z-index: 9999;';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast align-items-center text-white bg-${type} border-0`;
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Schließen"></button></div>`;

      container.appendChild(toast);
      toast.classList.add('show');

      const closeBtn = toast.querySelector('.btn-close');
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      });

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 5000);
    },

    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },

    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }

  window.__app = app;
})();
