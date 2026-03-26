(() => {
  'use strict';

  const Core = {
    version: '1.0.0',
    init() {
      this.theme.init();
      this.accordion.init();
      this.tabs.init();
      this.modal.init();
      this.drawer.init();
      this.dropdown.init();
      this.toast.init();
      this.tooltip.init();
      this.carousel.init();
      this.lazyImages.init();
      this.ripple.init();
      this.smoothScroll.init();
      this.forms.init();
      this.toggle.init();
      this.details.init();
      this.tableSort.init();
      this.clipboard.init();
      this.rating.init();
      this.counter.init();
      this.scrollSpy.init();
      this.stickyHeader.init();
      this.passwordToggle.init();
      this.charCounter.init();
      this.floatLabel.init();
      this.searchFilter.init();
      this.contextMenu.init();
      this.resizable.init();
      this.hotkeys.init();
      this.debug.init();
    }
  };

  Core.theme = {
    key: 'core-theme',
    themes: ['light', 'dark', 'midnight', 'amoled', 'aura', 'forest', 'ocean', 'volcano'],
    current: 'dark',
    init() {
      const saved = localStorage.getItem(this.key);
      const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      this.set(saved || preferred);
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(this.key)) this.set(e.matches ? 'dark' : 'light');
      });
      document.querySelectorAll('[data-theme-toggle]').forEach(el => {
        el.addEventListener('click', () => {
          const next = this.themes[(this.themes.indexOf(this.current) + 1) % this.themes.length];
          this.set(next);
        });
      });
      document.querySelectorAll('[data-set-theme]').forEach(el => {
        el.addEventListener('click', () => this.set(el.dataset.setTheme));
      });
    },
    set(theme) {
      if (!this.themes.includes(theme)) theme = 'dark';
      this.current = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.key, theme);
      document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    },
    get() { return this.current; }
  };

  Core.accordion = {
    init() {
      document.addEventListener('click', e => {
        const header = e.target.closest('.accordion-header');
        if (!header) return;
        const item = header.closest('.accordion-item');
        const content = item?.querySelector('.accordion-content');
        const accordion = item?.closest('.accordion');
        if (!content) return;
        const isOpen = header.classList.contains('active');
        if (accordion && !accordion.hasAttribute('data-multi')) {
          accordion.querySelectorAll('.accordion-header.active').forEach(h => {
            if (h !== header) {
              h.classList.remove('active');
              const c = h.closest('.accordion-item')?.querySelector('.accordion-content');
              if (c) { c.classList.remove('open'); c.style.maxHeight = '0'; }
            }
          });
        }
        if (isOpen) {
          header.classList.remove('active');
          content.classList.remove('open');
          content.style.maxHeight = '0';
        } else {
          header.classList.add('active');
          content.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  };

  Core.tabs = {
    init() {
      document.addEventListener('click', e => {
        const btn = e.target.closest('.tab-button');
        if (!btn) return;
        const tabs = btn.closest('.tabs');
        if (!tabs) return;
        const target = btn.dataset.tab;
        tabs.querySelectorAll('.tab-button').forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        if (target) {
          tabs.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === target));
        } else {
          const idx = Array.from(btn.parentElement.children).indexOf(btn);
          tabs.querySelectorAll('.tab-panel').forEach((p, i) => p.classList.toggle('active', i === idx));
        }
      });
      document.querySelectorAll('.tabs').forEach(tabs => {
        const first = tabs.querySelector('.tab-button');
        if (first && !tabs.querySelector('.tab-button.active')) first.click();
      });
    }
  };

  Core.modal = {
    stack: [],
    init() {
      document.addEventListener('click', e => {
        const trigger = e.target.closest('[data-modal-open]');
        if (trigger) { this.open(trigger.dataset.modalOpen); return; }
        const close = e.target.closest('[data-modal-close], .modal-close');
        if (close) { this.close(close.dataset.modalClose || this.stack[this.stack.length - 1]); return; }
        if (e.target.classList.contains('modal-overlay')) this.close(this.stack[this.stack.length - 1]);
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this.stack.length) this.close(this.stack[this.stack.length - 1]);
      });
    },
    open(id) {
      const modal = typeof id === 'string' ? document.getElementById(id) : id;
      if (!modal) return;
      let overlay = modal.closest('.modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
        overlay.appendChild(modal);
      }
      overlay.style.display = 'flex';
      requestAnimationFrame(() => overlay.style.opacity = '1');
      document.body.style.overflow = 'hidden';
      this.stack.push(id);
      modal.dispatchEvent(new CustomEvent('modal:open'));
      const first = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (first) first.focus();
    },
    close(id) {
      const modal = typeof id === 'string' ? document.getElementById(id) : id;
      const overlay = modal?.closest('.modal-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.style.display = 'none'; }, 280);
      }
      this.stack = this.stack.filter(s => s !== id);
      if (!this.stack.length) document.body.style.overflow = '';
      modal?.dispatchEvent(new CustomEvent('modal:close'));
    }
  };

  Core.drawer = {
    init() {
      document.addEventListener('click', e => {
        const trigger = e.target.closest('[data-drawer-open]');
        if (trigger) { this.open(trigger.dataset.drawerOpen); return; }
        const close = e.target.closest('[data-drawer-close], .drawer-close');
        if (close) { this.close(close.dataset.drawerClose || close.closest('.drawer')?.id); return; }
        if (e.target.classList.contains('modal-overlay') && e.target.querySelector('.drawer')) {
          const drawer = e.target.querySelector('.drawer');
          if (drawer) this.close(drawer.id);
        }
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          const open = document.querySelector('.drawer.open');
          if (open) this.close(open.id);
        }
      });
    },
    open(id) {
      const drawer = document.getElementById(id);
      if (!drawer) return;
      let overlay = drawer.closest('.modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
        overlay.appendChild(drawer);
      }
      overlay.style.display = 'flex';
      requestAnimationFrame(() => { overlay.style.opacity = '1'; drawer.classList.add('open'); });
      document.body.style.overflow = 'hidden';
    },
    close(id) {
      const drawer = document.getElementById(id);
      if (!drawer) return;
      drawer.classList.remove('open');
      const overlay = drawer.closest('.modal-overlay');
      if (overlay) {
        setTimeout(() => { overlay.style.opacity = '0'; setTimeout(() => overlay.style.display = 'none', 300); }, 0);
      }
      document.body.style.overflow = '';
    }
  };

  Core.dropdown = {
    active: null,
    init() {
      document.addEventListener('click', e => {
        const trigger = e.target.closest('[data-dropdown]');
        if (trigger) {
          const menuId = trigger.dataset.dropdown;
          const menu = document.getElementById(menuId) || trigger.nextElementSibling;
          if (!menu?.classList.contains('dropdown-menu')) return;
          const isOpen = menu.style.display === 'block';
          this.closeAll();
          if (!isOpen) { menu.style.display = 'block'; this.active = menu; this.position(trigger, menu); }
          e.stopPropagation();
          return;
        }
        if (!e.target.closest('.dropdown-menu')) this.closeAll();
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeAll(); });
      window.addEventListener('resize', () => this.closeAll());
    },
    position(trigger, menu) {
      const rect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < menu.offsetHeight && spaceAbove > spaceBelow) {
        menu.style.top = 'auto';
        menu.style.bottom = '100%';
      } else {
        menu.style.top = '';
        menu.style.bottom = '';
      }
    },
    closeAll() {
      document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = '');
      this.active = null;
    }
  };

  Core.toast = {
    container: null,
    timers: new Map(),
    init() {
      this.container = document.querySelector('.toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
      }
    },
    show(message, type = 'default', duration = 4000, options = {}) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ', default: '' };
      const colors = { success: 'var(--accent-success)', error: 'var(--accent-error)', warning: 'var(--accent-warning)', info: 'var(--accent-info)', default: 'var(--accent-primary)' };
      toast.innerHTML = `
        ${icons[type] ? `<span style="color:${colors[type]};font-weight:700;flex-shrink:0;">${icons[type]}</span>` : ''}
        <span style="flex:1;">${message}</span>
        ${options.action ? `<button class="btn btn-ghost btn-sm" data-toast-action>${options.action.label}</button>` : ''}
        <button style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);padding:0;font-size:16px;line-height:1;flex-shrink:0;" data-toast-dismiss>✕</button>
      `;
      if (options.action) {
        toast.querySelector('[data-toast-action]').addEventListener('click', () => { options.action.fn(); this.remove(toast); });
      }
      toast.querySelector('[data-toast-dismiss]').addEventListener('click', () => this.remove(toast));
      this.container.appendChild(toast);
      if (duration > 0) {
        const t = setTimeout(() => this.remove(toast), duration);
        this.timers.set(toast, t);
      }
      return toast;
    },
    remove(toast) {
      if (this.timers.has(toast)) { clearTimeout(this.timers.get(toast)); this.timers.delete(toast); }
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    },
    success(msg, opts) { return this.show(msg, 'success', 4000, opts); },
    error(msg, opts) { return this.show(msg, 'error', 6000, opts); },
    warning(msg, opts) { return this.show(msg, 'warning', 5000, opts); },
    info(msg, opts) { return this.show(msg, 'info', 4000, opts); }
  };

  Core.tooltip = {
    init() {
      let current = null;
      document.addEventListener('mouseover', e => {
        const el = e.target.closest('[data-tooltip]');
        if (!el || current === el) return;
        this.show(el);
        current = el;
      });
      document.addEventListener('mouseout', e => {
        const el = e.target.closest('[data-tooltip]');
        if (el) { this.hide(el); current = null; }
      });
      document.addEventListener('focusin', e => {
        const el = e.target.closest('[data-tooltip]');
        if (el) this.show(el);
      });
      document.addEventListener('focusout', e => {
        const el = e.target.closest('[data-tooltip]');
        if (el) this.hide(el);
      });
    },
    show(el) {
      let tip = el.querySelector('.tooltip-content');
      if (!tip) {
        tip = document.createElement('div');
        tip.className = 'tooltip-content';
        tip.textContent = el.dataset.tooltip;
        el.style.position = 'relative';
        el.appendChild(tip);
      }
      tip.style.opacity = '1';
      tip.style.transform = 'translateX(-50%) translateY(0)';
    },
    hide(el) {
      const tip = el.querySelector('.tooltip-content');
      if (tip) { tip.style.opacity = '0'; tip.style.transform = 'translateX(-50%) translateY(4px)'; }
    }
  };

  Core.carousel = {
    instances: new Map(),
    init() {
      document.querySelectorAll('.carousel').forEach(c => this.setup(c));
    },
    setup(carousel) {
      const track = carousel.querySelector('.carousel-track');
      const slides = carousel.querySelectorAll('.carousel-slide');
      const prev = carousel.querySelector('.carousel-btn--prev');
      const next = carousel.querySelector('.carousel-btn--next');
      const dotsContainer = carousel.querySelector('.carousel-dots');
      if (!track || !slides.length) return;
      let current = 0;
      const total = slides.length;
      const dots = [];
      if (dotsContainer) {
        slides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
          dot.addEventListener('click', () => goTo(i));
          dotsContainer.appendChild(dot);
          dots.push(dot);
        });
      }
      const goTo = idx => {
        current = ((idx % total) + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
        carousel.dispatchEvent(new CustomEvent('carousel:change', { detail: { index: current } }));
      };
      prev?.addEventListener('click', () => goTo(current - 1));
      next?.addEventListener('click', () => goTo(current + 1));
      let startX = 0;
      track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
      }, { passive: true });
      const interval = parseInt(carousel.dataset.autoplay);
      if (interval > 0) setInterval(() => goTo(current + 1), interval);
      this.instances.set(carousel, { goTo, current: () => current, total });
    }
  };

  Core.lazyImages = {
    init() {
      if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
          img.addEventListener('load', () => img.classList.add('loaded'));
          if (img.complete) img.classList.add('loaded');
        });
        return;
      }
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) img.src = img.dataset.src;
            img.addEventListener('load', () => img.classList.add('loaded'));
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });
      document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
    }
  };

  Core.ripple = {
    init() {
      document.addEventListener('click', e => {
        const el = e.target.closest('[data-ripple], button:not([data-no-ripple]), .btn:not([data-no-ripple])');
        if (!el || el.disabled) return;
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const ripple = document.createElement('span');
        ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,0.18);transform:scale(0);pointer-events:none;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;animation:ripple 0.6s ease-out forwards;`;
        const prev = el.style.overflow;
        el.style.overflow = 'hidden';
        el.style.position = el.style.position || 'relative';
        el.appendChild(ripple);
        setTimeout(() => { ripple.remove(); el.style.overflow = prev; }, 700);
      });
    }
  };

  Core.smoothScroll = {
    init() {
      document.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = parseInt(link.dataset.scrollOffset) || parseInt(document.documentElement.style.getPropertyValue('--scroll-offset')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        history.pushState(null, '', '#' + id);
      });
    }
  };

  Core.forms = {
    init() {
      document.querySelectorAll('form[data-validate]').forEach(form => {
        form.addEventListener('submit', e => {
          if (!form.checkValidity()) {
            e.preventDefault();
            form.querySelectorAll(':invalid').forEach(field => {
              field.classList.add('is-error');
              let err = field.nextElementSibling;
              if (!err || !err.classList.contains('form-error')) {
                err = document.createElement('span');
                err.className = 'form-error';
                field.after(err);
              }
              err.textContent = field.validationMessage;
            });
          }
        });
        form.querySelectorAll('input, textarea, select').forEach(field => {
          field.addEventListener('input', () => {
            field.classList.toggle('is-error', !field.validity.valid);
            field.classList.toggle('is-success', field.validity.valid && field.value.length > 0);
            const err = field.nextElementSibling;
            if (err?.classList.contains('form-error')) err.textContent = field.validity.valid ? '' : field.validationMessage;
          });
        });
      });
    }
  };

  Core.toggle = {
    init() {
      document.addEventListener('change', e => {
        const toggle = e.target.closest('.toggle-input, .switch-input');
        if (!toggle) return;
        toggle.dispatchEvent(new CustomEvent('toggle:change', { bubbles: true, detail: { checked: toggle.checked } }));
        const target = toggle.dataset.toggleTarget;
        if (target) {
          document.querySelectorAll(target).forEach(el => el.classList.toggle('hidden', !toggle.checked));
        }
      });
    }
  };

  Core.details = {
    init() {
      document.querySelectorAll('details').forEach(el => {
        el.addEventListener('toggle', () => {
          if (el.open) el.dispatchEvent(new CustomEvent('details:open'));
          else el.dispatchEvent(new CustomEvent('details:close'));
        });
      });
    }
  };

  Core.tableSort = {
    init() {
      document.querySelectorAll('table[data-sortable], .table[data-sortable]').forEach(table => {
        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(th => {
          th.style.cursor = 'pointer';
          th.style.userSelect = 'none';
          th.addEventListener('click', () => {
            const col = Array.from(th.parentElement.children).indexOf(th);
            const asc = th.dataset.sortDir !== 'asc';
            headers.forEach(h => { h.dataset.sortDir = ''; h.querySelector('.sort-icon')?.remove(); });
            th.dataset.sortDir = asc ? 'asc' : 'desc';
            const icon = document.createElement('span');
            icon.className = 'sort-icon';
            icon.textContent = asc ? ' ↑' : ' ↓';
            icon.style.color = 'var(--accent-primary)';
            th.appendChild(icon);
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            rows.sort((a, b) => {
              const aVal = a.cells[col]?.textContent.trim() || '';
              const bVal = b.cells[col]?.textContent.trim() || '';
              const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
              const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ''));
              if (!isNaN(aNum) && !isNaN(bNum)) return asc ? aNum - bNum : bNum - aNum;
              return asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            });
            rows.forEach(r => tbody.appendChild(r));
          });
        });
      });
    }
  };

  Core.clipboard = {
    init() {
      document.addEventListener('click', e => {
        const btn = e.target.closest('[data-copy]');
        if (!btn) return;
        const text = btn.dataset.copy || btn.closest('[data-copy-container]')?.querySelector('[data-copy-target]')?.textContent;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.textContent;
          btn.textContent = btn.dataset.copySuccess || 'Copied!';
          setTimeout(() => btn.textContent = orig, 2000);
          Core.toast.success('Copied to clipboard');
        }).catch(() => Core.toast.error('Failed to copy'));
      });
    }
  };

  Core.rating = {
    init() {
      document.querySelectorAll('.rating-group[data-interactive]').forEach(group => {
        const stars = group.querySelectorAll('.rating-star');
        let saved = parseInt(group.dataset.value) || 0;
        const render = val => stars.forEach((s, i) => s.classList.toggle('filled', i < val));
        render(saved);
        stars.forEach((star, i) => {
          star.addEventListener('mouseover', () => render(i + 1));
          star.addEventListener('mouseout', () => render(saved));
          star.addEventListener('click', () => {
            saved = i + 1;
            group.dataset.value = saved;
            render(saved);
            group.dispatchEvent(new CustomEvent('rating:change', { bubbles: true, detail: { value: saved } }));
          });
        });
      });
    }
  };

  Core.counter = {
    init() {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const end = parseFloat(el.dataset.count);
          const duration = parseInt(el.dataset.countDuration) || 2000;
          const prefix = el.dataset.countPrefix || '';
          const suffix = el.dataset.countSuffix || '';
          const decimals = (el.dataset.count.split('.')[1] || '').length;
          let start = null;
          const step = ts => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            el.textContent = prefix + (end * ease).toFixed(decimals) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.unobserve(el);
        });
      }, { threshold: 0.5 });
      document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
    }
  };

  Core.scrollSpy = {
    init() {
      const navLinks = document.querySelectorAll('[data-scrollspy]');
      if (!navLinks.length) return;
      const sections = Array.from(navLinks).map(link => {
        const id = link.dataset.scrollspy || link.getAttribute('href')?.slice(1);
        return id ? document.getElementById(id) : null;
      }).filter(Boolean);
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const id = entry.target.id;
          const link = document.querySelector(`[data-scrollspy="${id}"], [href="#${id}"]`);
          if (link) link.classList.toggle('active', entry.isIntersecting);
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      sections.forEach(s => observer.observe(s));
    }
  };

  Core.stickyHeader = {
    init() {
      const header = document.querySelector('header, .site-header, .header');
      if (!header) return;
      let last = 0;
      const onScroll = () => {
        const y = window.scrollY;
        header.classList.toggle('header--scrolled', y > 20);
        header.classList.toggle('header--hidden', y > last + 10 && y > 100);
        last = y;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  };

  Core.passwordToggle = {
    init() {
      document.addEventListener('click', e => {
        const btn = e.target.closest('[data-password-toggle]');
        if (!btn) return;
        const input = document.getElementById(btn.dataset.passwordToggle) || btn.closest('.input-wrapper')?.querySelector('input');
        if (!input) return;
        const isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        btn.textContent = isText ? '👁' : '🙈';
        btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
      });
    }
  };

  Core.charCounter = {
    init() {
      document.querySelectorAll('[data-maxlength]').forEach(input => {
        const max = parseInt(input.dataset.maxlength);
        input.setAttribute('maxlength', max);
        const counter = document.createElement('span');
        counter.className = 'form-hint';
        counter.style.textAlign = 'right';
        counter.style.display = 'block';
        input.after(counter);
        const update = () => {
          const rem = max - input.value.length;
          counter.textContent = `${input.value.length} / ${max}`;
          counter.style.color = rem < 20 ? 'var(--accent-warning)' : rem < 5 ? 'var(--accent-error)' : '';
        };
        input.addEventListener('input', update);
        update();
      });
    }
  };

  Core.floatLabel = {
    init() {
      document.querySelectorAll('.float-label').forEach(group => {
        const input = group.querySelector('input, textarea');
        if (!input) return;
        const check = () => group.classList.toggle('has-value', input.value.length > 0 || document.activeElement === input);
        input.addEventListener('input', check);
        input.addEventListener('focus', check);
        input.addEventListener('blur', check);
        check();
      });
    }
  };

  Core.searchFilter = {
    init() {
      document.querySelectorAll('[data-search-filter]').forEach(input => {
        const targetSelector = input.dataset.searchFilter;
        const items = document.querySelectorAll(targetSelector);
        input.addEventListener('input', () => {
          const q = input.value.toLowerCase().trim();
          items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = !q || text.includes(q) ? '' : 'none';
          });
        });
      });
    }
  };

  Core.contextMenu = {
    active: null,
    init() {
      document.addEventListener('contextmenu', e => {
        const trigger = e.target.closest('[data-context-menu]');
        if (!trigger) return;
        e.preventDefault();
        this.close();
        const menuId = trigger.dataset.contextMenu;
        const menu = document.getElementById(menuId);
        if (!menu) return;
        menu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
        menu.style.top = Math.min(e.clientY, window.innerHeight - 200) + 'px';
        menu.style.display = 'block';
        this.active = menu;
      });
      document.addEventListener('click', () => this.close());
      document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
    },
    close() {
      if (this.active) { this.active.style.display = ''; this.active = null; }
    }
  };

  Core.resizable = {
    init() {
      document.querySelectorAll('[data-resizable]').forEach(el => {
        const handle = document.createElement('div');
        handle.style.cssText = 'position:absolute;right:0;bottom:0;width:14px;height:14px;cursor:se-resize;background:linear-gradient(135deg,transparent 50%,var(--border-primary) 50%);border-bottom-right-radius:var(--radius);';
        el.style.position = 'relative';
        el.style.overflow = 'hidden';
        el.appendChild(handle);
        let startX, startY, startW, startH;
        handle.addEventListener('mousedown', e => {
          e.preventDefault();
          startX = e.clientX; startY = e.clientY;
          startW = el.offsetWidth; startH = el.offsetHeight;
          const onMove = e => {
            el.style.width = Math.max(200, startW + e.clientX - startX) + 'px';
            el.style.height = Math.max(100, startH + e.clientY - startY) + 'px';
          };
          const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        });
      });
    }
  };

  Core.hotkeys = {
    handlers: {},
    init() {
      document.addEventListener('keydown', e => {
        const key = [e.ctrlKey ? 'ctrl' : '', e.shiftKey ? 'shift' : '', e.altKey ? 'alt' : '', e.metaKey ? 'meta' : '', e.key.toLowerCase()].filter(Boolean).join('+');
        const handler = this.handlers[key];
        if (handler) { e.preventDefault(); handler(e); }
      });
    },
    register(combo, fn) {
      this.handlers[combo.toLowerCase()] = fn;
    },
    unregister(combo) {
      delete this.handlers[combo.toLowerCase()];
    }
  };

  Core.debug = {
    el: null,
    visible: false,
    activeTab: 'overview',
    perfObserver: null,
    logs: [],
    networkRequests: [],
    startTime: Date.now(),
    originalConsole: {},
    mutationCount: 0,
    mutationObserver: null,
    rafId: null,
    frameCount: 0,
    lastFrameTime: performance.now(),
    fps: 0,
    resourceTimings: [],
    eventLog: [],

    init() {
      if (window.innerWidth < 1024) return;
      this.interceptConsole();
      this.interceptNetwork();
      this.observeMutations();
      this.trackFPS();
      this.captureResourceTimings();
      Core.hotkeys.register('ctrl+shift+d', () => this.toggle());
      window.CoreDebug = this;
    },

    interceptConsole() {
      ['log', 'warn', 'error', 'info', 'debug', 'table', 'group', 'groupEnd', 'time', 'timeEnd'].forEach(method => {
        this.originalConsole[method] = console[method].bind(console);
        console[method] = (...args) => {
          this.originalConsole[method](...args);
          this.logs.push({ type: method, args: args.map(a => { try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); } catch { return String(a); } }), time: new Date().toISOString(), stack: new Error().stack?.split('\n')[2]?.trim() || '' });
          if (this.logs.length > 500) this.logs.shift();
          if (this.visible && this.activeTab === 'console') this.renderTab(this.activeTab);
        };
      });
    },

    interceptNetwork() {
      const self = this;
      const origFetch = window.fetch;
      window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        const method = args[1]?.method || 'GET';
        const start = performance.now();
        const entry = { id: self.networkRequests.length, url, method, status: 'pending', duration: 0, size: 0, type: 'fetch', time: new Date().toISOString(), initiator: new Error().stack?.split('\n')[2]?.trim() || '' };
        self.networkRequests.push(entry);
        return origFetch.apply(this, args).then(async res => {
          entry.status = res.status;
          entry.duration = Math.round(performance.now() - start);
          entry.contentType = res.headers.get('content-type') || '';
          const clone = res.clone();
          const blob = await clone.blob().catch(() => null);
          if (blob) entry.size = blob.size;
          if (self.visible && self.activeTab === 'network') self.renderTab(self.activeTab);
          return res;
        }).catch(err => { entry.status = 'error'; entry.error = err.message; entry.duration = Math.round(performance.now() - start); throw err; });
      };
      const origXHR = window.XMLHttpRequest;
      window.XMLHttpRequest = function() {
        const xhr = new origXHR();
        const entry = { id: self.networkRequests.length, url: '', method: 'GET', status: 'pending', duration: 0, size: 0, type: 'xhr', time: new Date().toISOString() };
        self.networkRequests.push(entry);
        const origOpen = xhr.open;
        xhr.open = function(method, url, ...rest) { entry.url = url; entry.method = method; origOpen.apply(this, [method, url, ...rest]); };
        const start = performance.now();
        xhr.addEventListener('loadend', () => {
          entry.status = xhr.status;
          entry.duration = Math.round(performance.now() - start);
          entry.size = xhr.responseText?.length || 0;
          entry.contentType = xhr.getResponseHeader('content-type') || '';
          if (self.visible && self.activeTab === 'network') self.renderTab(self.activeTab);
        });
        return xhr;
      };
    },

    observeMutations() {
      this.mutationObserver = new MutationObserver(mutations => {
        this.mutationCount += mutations.length;
      });
      this.mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    },

    trackFPS() {
      const tick = ts => {
        this.frameCount++;
        const delta = ts - this.lastFrameTime;
        if (delta >= 1000) {
          this.fps = Math.round((this.frameCount * 1000) / delta);
          this.frameCount = 0;
          this.lastFrameTime = ts;
          if (this.visible && this.activeTab === 'performance') this.renderTab(this.activeTab);
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    },

    captureResourceTimings() {
      const obs = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'resource') {
            this.resourceTimings.push({
              name: entry.name.split('/').pop().substring(0, 60),
              fullUrl: entry.name,
              type: entry.initiatorType,
              duration: Math.round(entry.duration),
              size: entry.transferSize || 0,
              encoded: entry.encodedBodySize || 0,
              decoded: entry.decodedBodySize || 0,
              ttfb: Math.round(entry.responseStart - entry.requestStart),
              start: Math.round(entry.startTime)
            });
          }
        });
      });
      try { obs.observe({ entryTypes: ['resource', 'navigation', 'paint', 'largest-contentful-paint'] }); } catch(e) {}
    },

    collectData() {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const paint = {};
      performance.getEntriesByType('paint').forEach(e => paint[e.name] = Math.round(e.startTime));
      const memory = performance.memory || {};
      const conn = navigator.connection || {};
      const resources = performance.getEntriesByType('resource');
      const totalTransfer = resources.reduce((a, r) => a + (r.transferSize || 0), 0);
      const totalDecode = resources.reduce((a, r) => a + (r.decodedBodySize || 0), 0);

      return {
        page: {
          title: document.title,
          url: location.href,
          origin: location.origin,
          protocol: location.protocol,
          referrer: document.referrer || 'Direct',
          domain: location.hostname,
          path: location.pathname,
          hash: location.hash,
          readyState: document.readyState,
          charset: document.characterSet,
          lang: document.documentElement.lang,
          dir: document.documentElement.dir || 'ltr',
          doctype: document.doctype?.name || 'html',
          compatMode: document.compatMode,
          lastModified: document.lastModified,
          cookie: document.cookie ? document.cookie.split(';').length + ' cookies' : 'None',
          visibility: document.visibilityState,
          theme: document.documentElement.getAttribute('data-theme') || 'none'
        },
        timing: {
          domContentLoaded: Math.round((nav.domContentLoadedEventEnd || 0) - (nav.fetchStart || 0)),
          load: Math.round((nav.loadEventEnd || 0) - (nav.fetchStart || 0)),
          ttfb: Math.round((nav.responseStart || 0) - (nav.fetchStart || 0)),
          dns: Math.round((nav.domainLookupEnd || 0) - (nav.domainLookupStart || 0)),
          tcp: Math.round((nav.connectEnd || 0) - (nav.connectStart || 0)),
          tls: nav.secureConnectionStart > 0 ? Math.round((nav.connectEnd || 0) - (nav.secureConnectionStart || 0)) : 0,
          request: Math.round((nav.responseStart || 0) - (nav.requestStart || 0)),
          response: Math.round((nav.responseEnd || 0) - (nav.responseStart || 0)),
          domParsing: Math.round((nav.domInteractive || 0) - (nav.responseEnd || 0)),
          domProcessing: Math.round((nav.domComplete || 0) - (nav.domInteractive || 0)),
          sessionDuration: Math.round((Date.now() - this.startTime) / 1000),
          fcp: paint['first-contentful-paint'] || 0,
          fp: paint['first-paint'] || 0
        },
        memory: {
          usedJSHeap: memory.usedJSHeapSize ? (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB' : 'N/A',
          totalJSHeap: memory.totalJSHeapSize ? (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB' : 'N/A',
          jsHeapLimit: memory.jsHeapSizeLimit ? (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB' : 'N/A',
          heapUsagePercent: memory.usedJSHeapSize && memory.jsHeapSizeLimit ? Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) + '%' : 'N/A'
        },
        dom: {
          elements: document.querySelectorAll('*').length,
          scripts: document.scripts.length,
          stylesheets: document.styleSheets.length,
          images: document.images.length,
          links: document.links.length,
          forms: document.forms.length,
          iframes: document.querySelectorAll('iframe').length,
          videos: document.querySelectorAll('video').length,
          audios: document.querySelectorAll('audio').length,
          customElements: document.querySelectorAll('[data-component]').length,
          depth: this.getDOMDepth(),
          bodyHTML: Math.round(document.body.innerHTML.length / 1024) + ' KB',
          mutations: this.mutationCount,
          textNodes: this.getTextNodeCount(),
          comments: this.getCommentCount()
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          screenWidth: screen.width,
          screenHeight: screen.height,
          devicePixelRatio: window.devicePixelRatio,
          orientation: screen.orientation?.type || (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'),
          colorDepth: screen.colorDepth,
          scrollX: Math.round(window.scrollX),
          scrollY: Math.round(window.scrollY),
          documentHeight: document.documentElement.scrollHeight,
          documentWidth: document.documentElement.scrollWidth,
          breakpoint: window.innerWidth >= 1400 ? 'xl' : window.innerWidth >= 1200 ? 'lg' : window.innerWidth >= 768 ? 'md' : window.innerWidth >= 480 ? 'sm' : 'xs'
        },
        network: {
          type: conn.effectiveType || conn.type || 'unknown',
          downlink: conn.downlink ? conn.downlink + ' Mbps' : 'N/A',
          rtt: conn.rtt ? conn.rtt + ' ms' : 'N/A',
          saveData: conn.saveData || false,
          online: navigator.onLine,
          totalRequests: this.networkRequests.length,
          totalResources: resources.length,
          transferSize: this.formatBytes(totalTransfer),
          decodedSize: this.formatBytes(totalDecode)
        },
        browser: {
          userAgent: navigator.userAgent,
          vendor: navigator.vendor,
          platform: navigator.platform,
          language: navigator.language,
          languages: navigator.languages?.join(', ') || navigator.language,
          cookiesEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack || 'unspecified',
          maxTouchPoints: navigator.maxTouchPoints,
          hardwareConcurrency: navigator.hardwareConcurrency,
          deviceMemory: navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A',
          serviceWorker: 'serviceWorker' in navigator ? 'Supported' : 'Not supported',
          webGL: this.getWebGLInfo(),
          webRTC: typeof RTCPeerConnection !== 'undefined' ? 'Supported' : 'Not supported',
          localStorage: this.getStorageSize('localStorage'),
          sessionStorage: this.getStorageSize('sessionStorage'),
          indexedDB: typeof indexedDB !== 'undefined' ? 'Available' : 'N/A'
        },
        storage: this.getStorageData(),
        css: {
          variables: this.getCSSVars(),
          theme: document.documentElement.getAttribute('data-theme') || 'none',
          sheets: this.getStylesheetInfo()
        },
        fps: this.fps,
        logs: this.logs,
        networkRequests: this.networkRequests,
        resources: this.resourceTimings.slice(-100)
      };
    },

    getDOMDepth() {
      let max = 0;
      const walk = (node, depth) => {
        if (depth > max) max = depth;
        Array.from(node.children || []).forEach(c => walk(c, depth + 1));
      };
      walk(document.documentElement, 0);
      return max;
    },

    getTextNodeCount() {
      const iter = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
      let count = 0;
      while (iter.nextNode()) count++;
      return count;
    },

    getCommentCount() {
      const iter = document.createNodeIterator(document.body, NodeFilter.SHOW_COMMENT);
      let count = 0;
      while (iter.nextNode()) count++;
      return count;
    },

    getWebGLInfo() {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'Not supported';
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL).substring(0, 40) : 'Supported';
      } catch { return 'Error'; }
    },

    getStorageSize(type) {
      try {
        const s = window[type];
        if (!s) return 'N/A';
        let size = 0;
        for (let i = 0; i < s.length; i++) { const k = s.key(i); size += k.length + (s.getItem(k) || '').length; }
        return `${s.length} items (${this.formatBytes(size * 2)})`;
      } catch { return 'N/A'; }
    },

    getStorageData() {
      const result = { localStorage: {}, sessionStorage: {}, cookies: [] };
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); result.localStorage[k] = localStorage.getItem(k)?.substring(0, 100); } } catch {}
      try { for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); result.sessionStorage[k] = sessionStorage.getItem(k)?.substring(0, 100); } } catch {}
      try { result.cookies = document.cookie.split(';').map(c => c.trim()).filter(Boolean); } catch {}
      return result;
    },

    getCSSVars() {
      const vars = {};
      try {
        const styles = getComputedStyle(document.documentElement);
        const names = ['--bg-primary','--bg-secondary','--bg-card','--text-primary','--text-secondary','--accent-primary','--accent-hover','--border-primary','--border-focus','--radius','--padding','--gap','--font-size-base','--font-body','--font-display'];
        names.forEach(v => { vars[v] = styles.getPropertyValue(v).trim(); });
      } catch {}
      return vars;
    },

    getStylesheetInfo() {
      return Array.from(document.styleSheets).map(s => ({
        href: s.href ? s.href.split('/').pop().substring(0, 50) : 'inline',
        rules: (() => { try { return s.cssRules?.length || 0; } catch { return 'cross-origin'; } })(),
        disabled: s.disabled,
        media: s.media?.mediaText || 'all'
      }));
    },

    formatBytes(b) {
      if (b === 0) return '0 B';
      const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(b) / Math.log(k));
      return (b / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    },

    getScore(ms) {
      if (ms === 0 || ms === undefined) return { c: '#666', l: 'N/A' };
      if (ms < 500) return { c: '#30d158', l: 'Fast' };
      if (ms < 1500) return { c: '#ffd60a', l: 'Moderate' };
      return { c: '#ff453a', l: 'Slow' };
    },

    toggle() {
      if (this.visible) this.close();
      else this.open();
    },

    open() {
      if (this.el) { this.el.remove(); this.el = null; }
      this.visible = true;
      this.render();
    },

    close() {
      if (this.el) {
        this.el.style.opacity = '0';
        this.el.style.transform = 'translate(-50%, -50%) scale(0.96)';
        setTimeout(() => { this.el?.remove(); this.el = null; }, 220);
      }
      this.visible = false;
    },

    render() {
      const data = this.collectData();
      const overlay = document.createElement('div');
      overlay.id = '__core-debug-overlay';
      overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);z-index:2147483647;display:flex;align-items:center;justify-content:center;`;
      overlay.addEventListener('click', e => { if (e.target === overlay) this.close(); });

      const panel = document.createElement('div');
      panel.id = '__core-debug';
      panel.style.cssText = `
        width:min(1180px,96vw);height:min(780px,92vh);
        background:#0d0d0f;border:1px solid #252528;border-radius:12px;
        display:flex;flex-direction:column;overflow:hidden;
        box-shadow:0 30px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.04);
        font-family:'Menlo','Cascadia Code','Fira Code',monospace;font-size:12px;color:#e8e8ed;
        transition:opacity 0.2s ease,transform 0.2s ease;
      `;

      const tabs = ['Overview','Performance','DOM','Network','Resources','Console','Storage','CSS','Browser'];
      const tabBar = document.createElement('div');
      tabBar.style.cssText = `display:flex;align-items:center;background:#111113;border-bottom:1px solid #252528;padding:0 16px;gap:2px;flex-shrink:0;`;

      const titleEl = document.createElement('div');
      titleEl.style.cssText = `color:#8e8e93;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding-right:16px;border-right:1px solid #252528;margin-right:8px;white-space:nowrap;`;
      titleEl.innerHTML = `⚙ DevTools`;
      tabBar.appendChild(titleEl);

      const tabsWrapper = document.createElement('div');
      tabsWrapper.style.cssText = `display:flex;align-items:center;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none;`;
      tabsWrapper.style.cssText += `-ms-overflow-style:none;`;

      tabs.forEach(t => {
        const btn = document.createElement('button');
        btn.dataset.debugTab = t.toLowerCase();
        btn.style.cssText = `padding:10px 14px;background:none;border:none;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;color:#6e6e73;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap;transition:color 0.15s,border-color 0.15s;`;
        btn.textContent = t;
        btn.addEventListener('click', () => this.switchTab(t.toLowerCase(), data));
        btn.addEventListener('mouseover', () => { if (btn.dataset.debugTab !== this.activeTab) btn.style.color = '#aeaeb2'; });
        btn.addEventListener('mouseout', () => { if (btn.dataset.debugTab !== this.activeTab) btn.style.color = '#6e6e73'; });
        tabsWrapper.appendChild(btn);
      });
      tabBar.appendChild(tabsWrapper);

      const closeBtn = document.createElement('button');
      closeBtn.style.cssText = `margin-left:8px;padding:6px 10px;background:#252528;border:1px solid #3a3a3c;border-radius:6px;cursor:pointer;font-family:inherit;font-size:12px;color:#aeaeb2;flex-shrink:0;transition:background 0.15s,color 0.15s;`;
      closeBtn.innerHTML = '✕ Close';
      closeBtn.addEventListener('click', () => this.close());
      closeBtn.addEventListener('mouseover', () => { closeBtn.style.background = '#3a3a3c'; closeBtn.style.color = '#fff'; });
      closeBtn.addEventListener('mouseout', () => { closeBtn.style.background = '#252528'; closeBtn.style.color = '#aeaeb2'; });
      tabBar.appendChild(closeBtn);
      panel.appendChild(tabBar);

      const shortcut = document.createElement('div');
      shortcut.style.cssText = `background:#0a0a0a;border-bottom:1px solid #1a1a1a;padding:5px 16px;font-size:10px;color:#48484a;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;`;
      shortcut.innerHTML = `<span>Core DevTools v${Core.version} — Press <kbd style="background:#1a1a1a;border:1px solid #3a3a3c;border-radius:3px;padding:1px 5px;">Ctrl+Shift+D</kbd> to toggle</span><span style="color:#3a3a3c;">Session: ${Math.round((Date.now() - this.startTime) / 1000)}s active</span>`;
      panel.appendChild(shortcut);

      const body = document.createElement('div');
      body.id = '__debug-body';
      body.style.cssText = `flex:1;overflow:auto;padding:16px;`;
      panel.appendChild(body);

      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      this.el = overlay;

      setTimeout(() => { panel.style.opacity = '1'; }, 10);
      this.switchTab(this.activeTab, data);
    },

    switchTab(tab, data) {
      this.activeTab = tab;
      if (!data) data = this.collectData();
      const tabBtns = document.querySelectorAll('[data-debug-tab]');
      tabBtns.forEach(btn => {
        const isActive = btn.dataset.debugTab === tab;
        btn.style.color = isActive ? '#419cff' : '#6e6e73';
        btn.style.borderBottomColor = isActive ? '#419cff' : 'transparent';
      });
      this.renderTab(tab, data);
    },

    renderTab(tab, data) {
      if (!data) data = this.collectData();
      const body = document.getElementById('__debug-body');
      if (!body) return;
      const renders = {
        overview: () => this.renderOverview(data),
        performance: () => this.renderPerformance(data),
        dom: () => this.renderDOM(data),
        network: () => this.renderNetwork(data),
        resources: () => this.renderResources(data),
        console: () => this.renderConsole(data),
        storage: () => this.renderStorage(data),
        css: () => this.renderCSS(data),
        browser: () => this.renderBrowser(data)
      };
      body.innerHTML = renders[tab] ? renders[tab]() : '';
    },

    row(label, value, color) {
      return `<div style="display:flex;align-items:baseline;gap:8px;padding:5px 0;border-bottom:1px solid #1a1a1a;">
        <span style="color:#6e6e73;min-width:200px;flex-shrink:0;font-size:11px;">${label}</span>
        <span style="color:${color || '#e8e8ed'};word-break:break-all;font-size:12px;">${value}</span>
      </div>`;
    },

    card(title, content, extra) {
      return `<div style="background:#111113;border:1px solid #252528;border-radius:8px;overflow:hidden;${extra || ''}">
        <div style="padding:8px 14px;background:#0d0d0f;border-bottom:1px solid #252528;font-size:11px;font-weight:700;color:#8e8e93;letter-spacing:0.08em;text-transform:uppercase;">${title}</div>
        <div style="padding:12px 14px;">${content}</div>
      </div>`;
    },

    metric(label, value, sub, color) {
      return `<div style="background:#111113;border:1px solid #252528;border-radius:8px;padding:12px 14px;">
        <div style="font-size:10px;color:#6e6e73;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">${label}</div>
        <div style="font-size:22px;font-weight:700;color:${color || '#e8e8ed'};letter-spacing:-0.02em;">${value}</div>
        ${sub ? `<div style="font-size:10px;color:#48484a;margin-top:2px;">${sub}</div>` : ''}
      </div>`;
    },

    grid(cols, items) {
      return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;">${items.join('')}</div>`;
    },

    timingBar(label, value, max, color) {
      const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
      const score = this.getScore(value);
      return `<div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:11px;">
          <span style="color:#aeaeb2;">${label}</span>
          <span style="color:${color || score.c};">${value > 0 ? value + 'ms' : 'N/A'} <span style="color:${score.c};font-size:10px;">${value > 0 ? score.l : ''}</span></span>
        </div>
        <div style="height:4px;background:#1a1a1a;border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${color || score.c};border-radius:4px;transition:width 0.4s ease;"></div>
        </div>
      </div>`;
    },

    renderOverview(d) {
      const t = d.timing;
      const maxTime = Math.max(t.load, t.domContentLoaded, 500);
      return `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${this.card('Page Info', [
              this.row('Title', d.page.title),
              this.row('URL', d.page.url),
              this.row('Protocol', d.page.protocol, d.page.protocol === 'https:' ? '#30d158' : '#ff453a'),
              this.row('Theme', d.page.theme, '#a78bfa'),
              this.row('Ready State', d.page.readyState, '#30d158'),
              this.row('Charset', d.page.charset),
              this.row('Language', d.page.lang),
              this.row('Referrer', d.page.referrer),
              this.row('Last Modified', d.page.lastModified),
              this.row('Cookies', d.page.cookie),
            ].join(''))}
            ${this.card('Viewport', [
              this.row('Viewport', `${d.viewport.width} × ${d.viewport.height} px`),
              this.row('Screen', `${d.viewport.screenWidth} × ${d.viewport.screenHeight} px`),
              this.row('Device Pixel Ratio', d.viewport.devicePixelRatio + 'x'),
              this.row('Orientation', d.viewport.orientation),
              this.row('Breakpoint', d.viewport.breakpoint, '#419cff'),
              this.row('Scroll Position', `${d.viewport.scrollX}, ${d.viewport.scrollY}`),
              this.row('Document Size', `${d.viewport.documentWidth} × ${d.viewport.documentHeight} px`),
            ].join(''))}
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${this.card(`Load Timings`, `
              ${this.timingBar('First Paint', t.fp, maxTime)}
              ${this.timingBar('First Contentful Paint', t.fcp, maxTime)}
              ${this.timingBar('DOM Content Loaded', t.domContentLoaded, maxTime)}
              ${this.timingBar('Full Page Load', t.load, maxTime)}
              ${this.timingBar('Time to First Byte', t.ttfb, maxTime)}
              ${this.timingBar('DNS Lookup', t.dns, maxTime, '#7b79f7')}
              ${this.timingBar('TCP Connect', t.tcp, maxTime, '#7b79f7')}
              ${this.timingBar('TLS Handshake', t.tls, maxTime, '#7b79f7')}
              ${this.timingBar('Server Request', t.request, maxTime, '#06b6d4')}
              ${this.timingBar('Server Response', t.response, maxTime, '#06b6d4')}
              ${this.timingBar('DOM Parsing', t.domParsing, maxTime, '#fb923c')}
              ${this.timingBar('DOM Processing', t.domProcessing, maxTime, '#fb923c')}
            `)}
            ${this.card('Quick Stats', this.grid(2, [
              this.metric('DOM Elements', d.dom.elements),
              this.metric('Resources', d.network.totalResources),
              this.metric('JS Heap', d.memory.usedJSHeap, d.memory.totalJSHeap, '#7b79f7'),
              this.metric('Mutations', d.dom.mutations),
              this.metric('Network Req', d.network.totalRequests),
              this.metric('Transfer', d.network.transferSize, 'decoded: ' + d.network.decodedSize),
              this.metric('FPS', d.fps, 'live', d.fps >= 55 ? '#30d158' : d.fps >= 30 ? '#ffd60a' : '#ff453a'),
              this.metric('Session', t.sessionDuration + 's', 'elapsed'),
            ]))}
          </div>
        </div>`;
    },

    renderPerformance(d) {
      const t = d.timing; const m = d.memory;
      const heapPct = parseFloat(m.heapUsagePercent) || 0;
      return `
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${this.grid(4, [
            this.metric('Live FPS', d.fps, 'frames/sec', d.fps >= 55 ? '#30d158' : d.fps >= 30 ? '#ffd60a' : '#ff453a'),
            this.metric('JS Heap Used', m.usedJSHeap, 'of ' + m.jsHeapLimit, '#7b79f7'),
            this.metric('Heap Total', m.totalJSHeap, 'allocated'),
            this.metric('DOM Mutations', d.dom.mutations, 'since load'),
          ])}
          ${this.card('Navigation Timing Waterfall', `
            <div style="padding:8px 0;">
              ${[
                ['DNS Lookup', t.dns, '#7b79f7'],
                ['TCP Connect', t.tcp, '#7b79f7'],
                ['TLS Handshake', t.tls, '#a78bfa'],
                ['Time to First Byte', t.ttfb, '#06b6d4'],
                ['Server Request', t.request, '#38bdf8'],
                ['Server Response', t.response, '#38bdf8'],
                ['DOM Parsing', t.domParsing, '#fb923c'],
                ['DOM Processing', t.domProcessing, '#fb923c'],
                ['First Paint', t.fp, '#30d158'],
                ['First Contentful Paint', t.fcp, '#30d158'],
                ['DOM Content Loaded', t.domContentLoaded, '#4ade80'],
                ['Full Page Load', t.load, '#ffd60a'],
              ].map(([l, v, c]) => this.timingBar(l, v, Math.max(t.load, 1000), c)).join('')}
            </div>
          `)}
          ${this.card('Memory Heap', `
            <div style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px;">
                <span style="color:#aeaeb2;">Heap Usage</span>
                <span style="color:${heapPct > 80 ? '#ff453a' : '#30d158'};">${m.heapUsagePercent}</span>
              </div>
              <div style="height:8px;background:#1a1a1a;border-radius:4px;overflow:hidden;">
                <div style="height:100%;width:${heapPct}%;background:${heapPct > 80 ? '#ff453a' : heapPct > 50 ? '#ffd60a' : '#30d158'};border-radius:4px;transition:width 0.4s;"></div>
              </div>
            </div>
            ${this.row('Used JS Heap', m.usedJSHeap)}
            ${this.row('Total JS Heap', m.totalJSHeap)}
            ${this.row('JS Heap Limit', m.jsHeapLimit)}
            ${this.row('Usage', m.heapUsagePercent, heapPct > 80 ? '#ff453a' : '#30d158')}
          `)}
          ${this.card('Paint Events', `
            ${this.row('First Paint (FP)', t.fp > 0 ? t.fp + ' ms' : 'N/A', this.getScore(t.fp).c)}
            ${this.row('First Contentful Paint (FCP)', t.fcp > 0 ? t.fcp + ' ms' : 'N/A', this.getScore(t.fcp).c)}
            ${this.row('DOM Interactive', t.domParsing > 0 ? t.domParsing + ' ms' : 'N/A')}
            ${this.row('DOM Complete', t.domProcessing > 0 ? t.domProcessing + ' ms' : 'N/A')}
          `)}
        </div>`;
    },

    renderDOM(d) {
      const dom = d.dom;
      const sheets = d.css.sheets;
      return `
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${this.grid(4, [
            this.metric('Elements', dom.elements),
            this.metric('DOM Depth', dom.depth),
            this.metric('Scripts', dom.scripts),
            this.metric('Stylesheets', dom.stylesheets),
          ])}
          ${this.grid(2, [
            this.card('Element Inventory', [
              this.row('Total Elements', dom.elements),
              this.row('DOM Depth', dom.depth),
              this.row('Text Nodes', dom.textNodes),
              this.row('Comment Nodes', dom.comments),
              this.row('HTML Size (body)', dom.bodyHTML),
              this.row('DOM Mutations', dom.mutations),
            ].join('')),
            this.card('Asset Inventory', [
              this.row('Scripts', dom.scripts),
              this.row('Stylesheets', dom.stylesheets),
              this.row('Images', dom.images),
              this.row('Links', dom.links),
              this.row('Forms', dom.forms),
              this.row('iFrames', dom.iframes),
              this.row('Videos', dom.videos),
              this.row('Audios', dom.audios),
            ].join('')),
          ])}
          ${this.card('Loaded Stylesheets', `
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:11px;">
                <thead><tr style="color:#6e6e73;border-bottom:1px solid #252528;">
                  <th style="text-align:left;padding:6px 8px;">File</th>
                  <th style="text-align:left;padding:6px 8px;">Rules</th>
                  <th style="text-align:left;padding:6px 8px;">Media</th>
                  <th style="text-align:left;padding:6px 8px;">Status</th>
                </tr></thead>
                <tbody>
                  ${sheets.map(s => `<tr style="border-bottom:1px solid #1a1a1a;">
                    <td style="padding:6px 8px;color:#e8e8ed;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${s.href}">${s.href}</td>
                    <td style="padding:6px 8px;color:#aeaeb2;">${s.rules}</td>
                    <td style="padding:6px 8px;color:#6e6e73;">${s.media}</td>
                    <td style="padding:6px 8px;color:${s.disabled ? '#ff453a' : '#30d158'};">${s.disabled ? 'Disabled' : 'Active'}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          `)}
        </div>`;
    },

    renderNetwork(d) {
      const reqs = d.networkRequests;
      const statusColor = s => typeof s === 'number' ? (s < 300 ? '#30d158' : s < 400 ? '#ffd60a' : '#ff453a') : '#6e6e73';
      return `
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${this.grid(4, [
            this.metric('Total Requests', reqs.length),
            this.metric('Pending', reqs.filter(r => r.status === 'pending').length, '', '#ffd60a'),
            this.metric('Errors', reqs.filter(r => r.status === 'error' || r.status >= 400).length, '', '#ff453a'),
            this.metric('Avg Duration', reqs.length ? Math.round(reqs.reduce((a, r) => a + (r.duration || 0), 0) / reqs.length) + 'ms' : '0ms'),
          ])}
          ${this.card(`Requests (${reqs.length})`, `
            ${reqs.length === 0 ? '<div style="color:#48484a;padding:20px;text-align:center;">No requests captured yet</div>' : `
            <div style="overflow:auto;max-height:400px;">
              <table style="width:100%;border-collapse:collapse;font-size:11px;min-width:700px;">
                <thead style="position:sticky;top:0;background:#0d0d0f;"><tr style="color:#6e6e73;border-bottom:1px solid #252528;">
                  <th style="text-align:left;padding:7px 8px;">#</th>
                  <th style="text-align:left;padding:7px 8px;">Method</th>
                  <th style="text-align:left;padding:7px 8px;">URL</th>
                  <th style="text-align:left;padding:7px 8px;">Status</th>
                  <th style="text-align:left;padding:7px 8px;">Type</th>
                  <th style="text-align:left;padding:7px 8px;">Duration</th>
                  <th style="text-align:left;padding:7px 8px;">Size</th>
                  <th style="text-align:left;padding:7px 8px;">Time</th>
                </tr></thead>
                <tbody>
                  ${reqs.slice(-100).reverse().map(r => `<tr style="border-bottom:1px solid #1a1a1a;">
                    <td style="padding:6px 8px;color:#6e6e73;">${r.id}</td>
                    <td style="padding:6px 8px;color:#419cff;font-weight:700;">${r.method}</td>
                    <td style="padding:6px 8px;color:#e8e8ed;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.url}">${r.url}</td>
                    <td style="padding:6px 8px;color:${statusColor(r.status)};font-weight:700;">${r.status}</td>
                    <td style="padding:6px 8px;color:#6e6e73;">${r.type}</td>
                    <td style="padding:6px 8px;color:${r.duration > 1000 ? '#ff453a' : r.duration > 300 ? '#ffd60a' : '#30d158'};">${r.duration > 0 ? r.duration + 'ms' : '-'}</td>
                    <td style="padding:6px 8px;color:#aeaeb2;">${r.size > 0 ? this.formatBytes(r.size) : '-'}</td>
                    <td style="padding:6px 8px;color:#48484a;white-space:nowrap;">${r.time.split('T')[1].split('.')[0]}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>`}
          `)}
        </div>`;
    },

    renderResources(d) {
      const res = d.resources;
      const typeColors = { script: '#419cff', link: '#a78bfa', img: '#30d158', fetch: '#06b6d4', xmlhttprequest: '#fb923c', css: '#f472b6', font: '#fbbf24', other: '#6e6e73' };
      return `
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${this.grid(4, [
            this.metric('Resources', res.length),
            this.metric('Scripts', res.filter(r => r.type === 'script').length, '', '#419cff'),
            this.metric('Images', res.filter(r => r.type === 'img').length, '', '#30d158'),
            this.metric('Fonts', res.filter(r => r.type === 'css' || r.type === 'font').length, '', '#fbbf24'),
          ])}
          ${this.card(`Resource Timings (${res.length})`, `
            ${res.length === 0 ? '<div style="color:#48484a;padding:20px;text-align:center;">No resource timings captured</div>' : `
            <div style="overflow:auto;max-height:400px;">
              <table style="width:100%;border-collapse:collapse;font-size:11px;min-width:700px;">
                <thead style="position:sticky;top:0;background:#0d0d0f;"><tr style="color:#6e6e73;border-bottom:1px solid #252528;">
                  <th style="text-align:left;padding:7px 8px;">Name</th>
                  <th style="text-align:left;padding:7px 8px;">Type</th>
                  <th style="text-align:left;padding:7px 8px;">Duration</th>
                  <th style="text-align:left;padding:7px 8px;">TTFB</th>
                  <th style="text-align:left;padding:7px 8px;">Transfer</th>
                  <th style="text-align:left;padding:7px 8px;">Decoded</th>
                  <th style="text-align:left;padding:7px 8px;">Start</th>
                </tr></thead>
                <tbody>
                  ${res.map(r => `<tr style="border-bottom:1px solid #1a1a1a;">
                    <td style="padding:6px 8px;color:#e8e8ed;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.fullUrl}">${r.name}</td>
                    <td style="padding:6px 8px;"><span style="background:${typeColors[r.type] || '#6e6e73'}22;color:${typeColors[r.type] || '#6e6e73'};padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;">${r.type}</span></td>
                    <td style="padding:6px 8px;color:${r.duration > 1000 ? '#ff453a' : r.duration > 300 ? '#ffd60a' : '#30d158'};">${r.duration}ms</td>
                    <td style="padding:6px 8px;color:#aeaeb2;">${r.ttfb}ms</td>
                    <td style="padding:6px 8px;color:#aeaeb2;">${this.formatBytes(r.size)}</td>
                    <td style="padding:6px 8px;color:#6e6e73;">${this.formatBytes(r.decoded)}</td>
                    <td style="padding:6px 8px;color:#48484a;">${r.start}ms</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>`}
          `)}
        </div>`;
    },

    renderConsole(d) {
      const typeColors = { log: '#e8e8ed', warn: '#ffd60a', error: '#ff453a', info: '#419cff', debug: '#6e6e73', table: '#a78bfa', group: '#06b6d4', groupEnd: '#06b6d4', time: '#30d158', timeEnd: '#30d158' };
      const typeBg = { warn: '#ffd60a0d', error: '#ff453a0d', info: '#419cff0d', debug: '#0d0d0f' };
      return `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            ${['all','log','warn','error','info','debug'].map(t => `<button onclick="window.CoreDebug._consoleFilter='${t}';window.CoreDebug.renderTab('console');" style="padding:4px 10px;background:${(this._consoleFilter||'all')===t?'#252528':'transparent'};border:1px solid #252528;border-radius:5px;cursor:pointer;font-family:inherit;font-size:11px;color:${(this._consoleFilter||'all')===t?'#e8e8ed':'#6e6e73'};transition:all 0.1s;">${t.toUpperCase()}</button>`).join('')}
            <button onclick="window.CoreDebug.logs=[];window.CoreDebug.renderTab('console');" style="padding:4px 10px;background:transparent;border:1px solid #252528;border-radius:5px;cursor:pointer;font-family:inherit;font-size:11px;color:#ff453a;margin-left:auto;">Clear</button>
          </div>
          ${this.card(`Console (${d.logs.length} entries)`, `
            ${d.logs.length === 0 ? '<div style="color:#48484a;padding:20px;text-align:center;">No console output captured</div>' : `
            <div style="display:flex;flex-direction:column;gap:2px;max-height:500px;overflow-y:auto;">
              ${d.logs.filter(l => !this._consoleFilter || this._consoleFilter === 'all' || l.type === this._consoleFilter).slice(-200).reverse().map(l => `
                <div style="display:flex;gap:10px;padding:6px 8px;border-radius:4px;background:${typeBg[l.type] || 'transparent'};border-left:2px solid ${typeColors[l.type] || '#3a3a3c'};">
                  <span style="color:${typeColors[l.type] || '#6e6e73'};font-weight:700;min-width:44px;font-size:10px;flex-shrink:0;padding-top:1px;">${l.type.toUpperCase()}</span>
                  <span style="color:#aeaeb2;font-size:10px;min-width:80px;flex-shrink:0;padding-top:1px;">${l.time.split('T')[1].split('.')[0]}</span>
                  <span style="color:${typeColors[l.type] || '#e8e8ed'};flex:1;white-space:pre-wrap;word-break:break-all;font-size:11px;">${l.args.join(' ')}</span>
                </div>
              `).join('')}
            </div>`}
          `)}
        </div>`;
    },

    renderStorage(d) {
      const s = d.storage;
      const lsKeys = Object.keys(s.localStorage);
      const ssKeys = Object.keys(s.sessionStorage);
      return `
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${this.grid(3, [
            this.metric('localStorage', lsKeys.length + ' items'),
            this.metric('sessionStorage', ssKeys.length + ' items'),
            this.metric('Cookies', s.cookies.length + ' cookies'),
          ])}
          ${this.card(`localStorage (${lsKeys.length})`, `
            ${lsKeys.length === 0 ? '<div style="color:#48484a;padding:12px;text-align:center;">Empty</div>' : `
            <div style="overflow:auto;max-height:250px;">
              <table style="width:100%;border-collapse:collapse;font-size:11px;">
                <thead><tr style="color:#6e6e73;border-bottom:1px solid #252528;">
                  <th style="text-align:left;padding:6px 8px;min-width:160px;">Key</th>
                  <th style="text-align:left;padding:6px 8px;">Value</th>
                </tr></thead>
                <tbody>${lsKeys.map(k => `<tr style="border-bottom:1px solid #1a1a1a;">
                  <td style="padding:6px 8px;color:#a78bfa;font-weight:700;">${k}</td>
                  <td style="padding:6px 8px;color:#aeaeb2;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${s.localStorage[k]}">${s.localStorage[k]}</td>
                </tr>`).join('')}</tbody>
              </table>
            </div>`}
          `)}
          ${this.card(`sessionStorage (${ssKeys.length})`, `
            ${ssKeys.length === 0 ? '<div style="color:#48484a;padding:12px;text-align:center;">Empty</div>' : `
            <div style="overflow:auto;max-height:200px;">
              <table style="width:100%;border-collapse:collapse;font-size:11px;">
                <thead><tr style="color:#6e6e73;border-bottom:1px solid #252528;">
                  <th style="text-align:left;padding:6px 8px;min-width:160px;">Key</th>
                  <th style="text-align:left;padding:6px 8px;">Value</th>
                </tr></thead>
                <tbody>${ssKeys.map(k => `<tr style="border-bottom:1px solid #1a1a1a;">
                  <td style="padding:6px 8px;color:#419cff;font-weight:700;">${k}</td>
                  <td style="padding:6px 8px;color:#aeaeb2;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${s.sessionStorage[k]}">${s.sessionStorage[k]}</td>
                </tr>`).join('')}</tbody>
              </table>
            </div>`}
          `)}
          ${this.card(`Cookies (${s.cookies.length})`, `
            ${s.cookies.length === 0 ? '<div style="color:#48484a;padding:12px;text-align:center;">No cookies</div>' : `
            <div style="display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto;">
              ${s.cookies.map(c => `<div style="padding:6px 8px;background:#1a1a1a;border-radius:5px;color:#aeaeb2;font-size:11px;word-break:break-all;">${c}</div>`).join('')}
            </div>`}
          `)}
        </div>`;
    },

    renderCSS(d) {
      const vars = d.css.variables;
      const varKeys = Object.keys(vars);
      return `
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${this.grid(3, [
            this.metric('Active Theme', d.css.theme, '', '#a78bfa'),
            this.metric('CSS Variables', varKeys.length + ' tracked'),
            this.metric('Stylesheets', d.css.sheets.length),
          ])}
          ${this.card('Computed CSS Variables', `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;max-height:400px;overflow-y:auto;">
              ${varKeys.map(k => {
                const v = vars[k];
                const isColor = v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl');
                return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:#1a1a1a;border-radius:5px;">
                  ${isColor ? `<div style="width:14px;height:14px;background:${v};border-radius:3px;border:1px solid #3a3a3c;flex-shrink:0;"></div>` : ''}
                  <div style="flex:1;min-width:0;">
                    <div style="color:#a78bfa;font-size:10px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${k}</div>
                    <div style="color:#aeaeb2;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${v}">${v || '(empty)'}</div>
                  </div>
                </div>`;
              }).join('')}
            </div>
          `)}
          ${this.card('Available Themes', `
            <div style="display:flex;gap:8px;flex-wrap:wrap;padding:4px 0;">
              ${Core.theme.themes.map(t => `
                <button onclick="Core.theme.set('${t}');window.CoreDebug.renderTab('css');" style="padding:6px 14px;background:${Core.theme.current===t?'#419cff22':'#1a1a1a'};border:1px solid ${Core.theme.current===t?'#419cff':'#252528'};border-radius:6px;cursor:pointer;font-family:inherit;font-size:12px;color:${Core.theme.current===t?'#419cff':'#aeaeb2'};font-weight:700;transition:all 0.15s;">${t}</button>
              `).join('')}
            </div>
          `)}
        </div>`;
    },

    renderBrowser(d) {
      const b = d.browser;
      const net = d.network;
      return `
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${this.grid(4, [
            this.metric('CPU Cores', b.hardwareConcurrency, 'logical'),
            this.metric('Device RAM', b.deviceMemory, 'GB'),
            this.metric('Touch Points', b.maxTouchPoints),
            this.metric('Pixel Ratio', d.viewport.devicePixelRatio + 'x'),
          ])}
          ${this.grid(2, [
            this.card('Browser & Platform', [
              this.row('Vendor', b.vendor),
              this.row('Platform', b.platform),
              this.row('Language', b.language),
              this.row('Languages', b.languages),
              this.row('Cookies Enabled', b.cookiesEnabled ? 'Yes' : 'No', b.cookiesEnabled ? '#30d158' : '#ff453a'),
              this.row('Do Not Track', b.doNotTrack),
              this.row('User Agent', b.userAgent.substring(0, 80) + '...'),
            ].join('')),
            this.card('Capabilities', [
              this.row('WebGL', b.webGL, '#30d158'),
              this.row('WebRTC', b.webRTC, b.webRTC.includes('Supported') ? '#30d158' : '#ff453a'),
              this.row('Service Worker', b.serviceWorker, b.serviceWorker.includes('Supported') ? '#30d158' : '#ff453a'),
              this.row('IndexedDB', b.indexedDB, b.indexedDB === 'Available' ? '#30d158' : '#6e6e73'),
              this.row('localStorage', b.localStorage),
              this.row('sessionStorage', b.sessionStorage),
            ].join('')),
          ])}
          ${this.card('Network', [
            this.row('Connection Type', net.type, '#419cff'),
            this.row('Effective Downlink', net.downlink),
            this.row('Round Trip Time', net.rtt),
            this.row('Save Data Mode', net.saveData ? 'On' : 'Off', net.saveData ? '#ffd60a' : '#30d158'),
            this.row('Online Status', net.online ? 'Online' : 'Offline', net.online ? '#30d158' : '#ff453a'),
            this.row('Total Resources', net.totalResources + ''),
            this.row('Transfer Size', net.transferSize),
            this.row('Decoded Size', net.decodedSize),
          ].join(''))}
        </div>`;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Core.init());
  } else {
    Core.init();
  }

  window.Core = Core;
})();