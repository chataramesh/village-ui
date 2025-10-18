/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills here.
 *
 * For more information, see: https://angular.io/guide/browser-support
 */

// Polyfills for Angular
import 'zone.js/dist/zone';  // Included with Angular CLI.

// Basic global polyfills for browser compatibility
declare const global: any;

// Global polyfill (for libraries that expect it)
(window as any).global = window;

// Process polyfill for browser environment
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {},
    version: '1.0.0',
    browser: true,
    platform: 'browser'
  };
}

// Buffer polyfill using a simple implementation
if (typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = {
    from: function(data: any) {
      if (typeof data === 'string') {
        return btoa(unescape(encodeURIComponent(data)));
      }
      return data;
    },
    alloc: function(size: number) {
      return new Array(size);
    }
  };
}
