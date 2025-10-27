import { Injectable, NgZone } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Platform } from '@angular/cdk/platform';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root'
})
export class BackNavigationService {
  private backButtonHandler: (() => void) | null = null;
  private history: string[] = [];
  private lastBackPress = 0;

  constructor(
    private router: Router,
    private location: Location,
    private platform: Platform,
    private ngZone: NgZone
  ) {}

  initialize(): void {
    // Handle browser back button
    this.handleBrowserBack();

    // Handle mobile hardware back button (for Capacitor apps)
    this.handleMobileBackButton();

    // Handle mobile swipe gestures
    this.handleSwipeGestures();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const nav = this.router.getCurrentNavigation();
        const isBackForward = (nav?.trigger === 'popstate') || !!(event.restoredState && event.restoredState.navigationId && event.restoredState.navigationId < event.id);
        if (isBackForward && this.history.length > 0) {
          this.history.pop();
        }
      }
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  private handleBrowserBack(): void {
    // Listen for browser back button events
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', (event) => {
        this.ngZone.run(() => {
          // Check if we can go back in history
          if (this.canGoBack()) {
            // Let Angular router handle it normally
            return;
          } else {
            // If we can't go back, navigate to a default route or show confirmation
            event.preventDefault();
            this.handleAppExit();
          }
        });
      });
    }
  }

  private handleMobileBackButton(): void {
    // For Capacitor apps, handle hardware back button
    if (this.platform.ANDROID || this.platform.IOS) {
      App.addListener('backButton', async () => {
        this.ngZone.run(() => {
          if (this.canGoBack()) {
            this.location.back();
            return;
          }

          if (this.router.url !== '/dashboard') {
            this.router.navigate(['/dashboard']);
            return;
          }

          if (this.platform.ANDROID) {
            const now = Date.now();
            if (now - this.lastBackPress < 1000) {
              App.exitApp();
            } else {
              this.lastBackPress = now;
            }
          }
        });
      });
    }
  }

  private handleSwipeGestures(): void {
    // Add swipe gesture handling for mobile
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      let startX: number;
      let startY: number;
      let startTime: number;

      document.addEventListener('touchstart', (e: TouchEvent) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
      });

      document.addEventListener('touchend', (e: TouchEvent) => {
        if (startX === undefined || startY === undefined) return;

        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const timeDiff = Date.now() - startTime;

        if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 60 && Math.abs(deltaY) < 80 && timeDiff < 400) {
          if (startX < 24) {
            e.preventDefault();
            this.ngZone.run(() => {
              this.goBack();
            });
          }
        }
      });
    }
  }

  private canGoBack(): boolean {
    // Check if Angular router can go back
    return this.history.length > 1;
  }

  goBack(): boolean {
    if (this.canGoBack()) {
      this.location.back();
      return true;
    } else {
      // If we can't go back in history, navigate to dashboard
      this.router.navigate(['/dashboard']);
      return true;
    }
  }

  private handleAppExit(): void {
    // For web apps, navigate to dashboard instead of closing
    // For mobile apps, you might want to show exit confirmation
    if (this.platform.ANDROID) {
      App.exitApp();
      return;
    }
    this.router.navigate(['/dashboard']);
  }

  setBackButtonHandler(handler: () => void): void {
    this.backButtonHandler = handler;
  }

  clearBackButtonHandler(): void {
    this.backButtonHandler = null;
  }
}
