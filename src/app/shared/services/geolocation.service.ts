import { Injectable } from '@angular/core';
import { TokenService } from 'src/app/core/services/token.service';
import { UsersService } from 'src/app/users/users.service';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private tokenService:TokenService,private usersService:UsersService) { }


   ensureUserLocation(): Promise<void> {
    try {
      const tokenUser = this.tokenService.getCurrentUser();
      const userId = tokenUser?.userId;
      if (!userId) return Promise.resolve();

      return new Promise<void>((resolve, reject) => {
        this.usersService.getUserById(userId).subscribe({
          next: (user: any) => {
            const hasLatLng =
              (user && (((user.latitude != null && user.latitude != 0) && (user.longitude != null && user.longitude != 0))));
            if (hasLatLng) {
              resolve();
              return;
            }

            this.getCurrentCoordinates()
              .then(({ lat, lng }) => {
                const update: any = { ...user };
                update.latitude = lat;
                update.longitude = lng;
                // if (update.lat === undefined) update.lat = lat;
                // if (update.lng === undefined) update.lng = lng;

                this.usersService.updateUser(user.id || userId, update).subscribe({
                  next: () => {
                    console.log('User location updated');
                    resolve();
                  },
                  error: (e) => {
                    console.warn('Failed to update user location', e);
                    reject(e);
                  }
                });
              })
              .catch((err) => {
                console.warn('Geolocation error or permission denied', err);
                reject(err);
              });
          },
          error: (e) => {
            console.warn('Failed to load user for location check', e);
            reject(e);
          }
        });
      });
    } catch (e) {
      console.warn('ensureUserLocation error', e);
      return Promise.reject(e);
    }
  }

  getCurrentCoordinates(): Promise<{ lat: number; lng: number }> {
    // Try browser geolocation first
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    }
    // Fallback: Capacitor Geolocation if available at runtime
    const maybeCap = (window as any)?.Capacitor?.Plugins || (window as any)?.Capacitor?.Geolocation;
    if (maybeCap && (maybeCap.Geolocation || (window as any)?.Capacitor?.Geolocation)) {
      const Geolocation = maybeCap.Geolocation || (window as any).Capacitor.Geolocation;
      return Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 }).then((pos: any) => ({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }));
    }
    return Promise.reject(new Error('Geolocation not supported'));
  }
}
