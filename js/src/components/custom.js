import hoverintent from 'hoverintent';

export function initCustom() {
    
    document.querySelectorAll('.main-navigation [data-dropdown-toggle]').forEach(($triggerEl) => {
        const dropdownId = $triggerEl.getAttribute('data-dropdown-toggle');
        const $dropdownEl = document.getElementById(dropdownId);
    
        if ($dropdownEl) {
            
            const dropdown = new Dropdown($dropdownEl, $triggerEl,{
                triggerType: 'none',
            },
        {override: true,id: 'dropdownMenu'});
            hoverintent(
                $triggerEl,
                () => {
                    // Show dropdown directly
                    $dropdownEl.classList.remove('hidden');
                    $dropdownEl.classList.add('block');
                },
                () => {
                    const isHoveringDropdown = $dropdownEl.matches(':hover'); // Check if hovering dropdown
                    
                    if (!isHoveringDropdown) {
                        $dropdownEl.classList.remove('block');
                        $dropdownEl.classList.add('hidden');
                    }
                }
            ).options({
                sensitivity: 7,
                interval: 100,
                timeout: 300,
            });
            hoverintent(
                $dropdownEl,
                () => {
                    
                },
                () => {
                    const isHoveringDropdown = $triggerEl.matches(':hover'); // Check if hovering dropdown
                    
                    if (!isHoveringDropdown) {
                        $dropdownEl.classList.remove('block');
                        $dropdownEl.classList.add('hidden');
                    }
                }
            ).options({
                sensitivity: 7,
                interval: 100,
                timeout: 300,
            });
           
    
        } else {
            console.error(`Dropdown element with ID "${dropdownId}" not found.`);
        }
    });
}

if (typeof window !== 'undefined') {
    window.initCustom = initCustom;
}

// Tabs ARIA keyboard navigation (progressive enhancement)
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-tabs-toggle]').forEach(tablist => {
      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
      tabs.forEach((tab, idx) => {
        tab.addEventListener('keydown', function(event) {
          if (event.key === 'ArrowRight') {
            const nextIdx = (idx + 1) % tabs.length;
            tabs[nextIdx].click();
            tabs[nextIdx].focus();
            event.preventDefault();
          } else if (event.key === 'ArrowLeft') {
            const prevIdx = (idx - 1 + tabs.length) % tabs.length;
            tabs[prevIdx].click();
            tabs[prevIdx].focus();
            event.preventDefault();
          } else if (event.key === 'Tab' && !event.shiftKey) {
            // Move focus to panel
            const panelId = tab.getAttribute('data-tabs-target');
            if (panelId) {
              const panel = document.querySelector(panelId);
              if (panel) {
                if (!panel.hasAttribute('tabindex')) {
                  panel.setAttribute('tabindex', '-1');
                }
                panel.dataset.lastTabFocused = tab.id;
                panel.focus();
                event.preventDefault();
              }
            }
          } else if (event.key === 'Tab' && event.shiftKey && idx === 0) {
            // Only on first tab: allow Shift+Tab to move focus out of tablist (do not preventDefault)
            // All other tabs: let browser handle Shift+Tab natively
          }
        });
        // Shift+Tab from panel returns to tab
        const panelId = tab.getAttribute('data-tabs-target');
        if (panelId) {
          const panel = document.querySelector(panelId);
          if (panel) {
            panel.addEventListener('keydown', function(e) {
              if (e.key === 'Tab' && e.shiftKey && panel.dataset.lastTabFocused) {
                const tabToFocus = tabs.find(t => t.id === panel.dataset.lastTabFocused || t.getAttribute('data-tabs-target') === panelId);
                if (tabToFocus) {
                  tabToFocus.focus();
                  e.preventDefault();
                }
                delete panel.dataset.lastTabFocused;
              }
            });
          }
        }
      });
    });
  });
}




// Auto focus for model close button

function getFocusableElements(container) {
    return container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
  }
  
  document.querySelectorAll('[role="dialog"]').forEach((modal) => {
    const triggerBtns = document.querySelectorAll(`[data-modal-toggle="${modal.id}"]`);
    let lastTrigger = null;
  
    // Main content to hide from screen readers when modal is open
    const backgroundAreas = document.querySelectorAll('header, main, footer');
  
    // Track which button opened the modal
    triggerBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        lastTrigger = btn;
      });
    });
  
    // Observe open/close
    const observer = new MutationObserver(() => {
      if (modal.classList.contains('flex')) {
        // 🔹 OPENED
        // Hide background from SR + disable tabbing
        backgroundAreas.forEach(area => {
          area.setAttribute('aria-hidden', 'true');
          area.querySelectorAll('a, button, input, select, textarea, [tabindex]')
              .forEach(el => el.setAttribute('tabindex', '-1'));
        });
  
        // Focus first focusable element (usually Close button)
        const focusableEls = getFocusableElements(modal);
        if (focusableEls.length > 0) {
          focusableEls[0].focus();
        } else {
          modal.setAttribute('tabindex', '-1');
          modal.focus();
        }
  
      } else if (modal.classList.contains('hidden')) {
        // 🔹 CLOSED
        // Restore background
        backgroundAreas.forEach(area => {
          area.removeAttribute('aria-hidden');
          area.querySelectorAll('[tabindex="-1"]').forEach(el => el.removeAttribute('tabindex'));
        });
  
        // Return focus to trigger
        if (lastTrigger) lastTrigger.focus();
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  
    // Trap focus inside modal
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        const focusableEls = getFocusableElements(modal);
        if (focusableEls.length === 0) return;
  
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
  
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (e.key === 'Escape') {
        modal.querySelector('[data-modal-hide]')?.click();
      }
    });
  });


  