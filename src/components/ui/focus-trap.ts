const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function trapFocus(event: KeyboardEvent, container?: HTMLElement) {
  if (event.key !== 'Tab' || !container) {
    return;
  }

  const focusable = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => element.offsetWidth || element.offsetHeight || element.getClientRects().length);

  if (!focusable.length) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = container.ownerDocument.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  } else if (!active || !container.contains(active)) {
    event.preventDefault();
    first.focus();
  }
}

export function restoreFocusAfterClose(element?: HTMLElement) {
  if (!element) {
    return;
  }

  setTimeout(() => {
    if (element.ownerDocument.contains(element)) {
      element.focus();
    }
  });
}
