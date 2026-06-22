import { isDevMode } from '@angular/core';

const DEBUG_ENABLED = false;

export function isDebug(): boolean {
  return isDevMode() && DEBUG_ENABLED;
}
