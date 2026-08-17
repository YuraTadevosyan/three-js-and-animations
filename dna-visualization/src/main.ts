import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    // No zone.js in the bundle at all: change detection is driven entirely by
    // signal writes. The render loop runs on its own rAF and only touches
    // signals when something the UI shows has actually changed, so a 60fps
    // scene does not imply 60 change-detection passes.
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
  ],
}).catch((error: unknown) => {
  console.error(error);
});
