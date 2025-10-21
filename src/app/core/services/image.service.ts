import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export enum ImageCategory {
  ELECTION_CAMPAIGN = 'ELECTION_CAMPAIGN',
  HEALTH_CAMP = 'HEALTH_CAMP',
  VILLAGE_FESTIVAL = 'VILLAGE_FESTIVAL',
  CULTURAL_EVENT = 'CULTURAL_EVENT',
  SPORTS_EVENT = 'SPORTS_EVENT',
  EDUCATION_PROGRAM = 'EDUCATION_PROGRAM',
  COMMUNITY_SERVICE = 'COMMUNITY_SERVICE',
  GOVERNMENT_SCHEME = 'GOVERNMENT_SCHEME',
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  DEVELOPMENT_PROJECT = 'DEVELOPMENT_PROJECT',
  OTHER = 'OTHER'
}

export interface Image {
  id?: string;
  name: string;
  description?: string;
  category: ImageCategory;
  filePath?: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  active: boolean; // Changed from isActive to active to match backend
  createdAt?: string; // Changed to string to match backend response
  updatedAt?: string | null;
  uploadedBy?: string;
  altText?: string;
  fileContent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private imagesSubject = new BehaviorSubject<Image[]>([]);
  public images$ = this.imagesSubject.asObservable();

  constructor(private apiService: ApiService) {}

  // Get all active images (metadata only)
  getAllActiveImages(): Observable<Image[]> {
    return this.apiService.get<Image[]>('images/active');
  }

  // Get image by ID with metadata and file content
  getImageWithFile(id: string): Observable<Image> {
    return this.apiService.get<Image>(`images/${id}/with-file`);
  }

  // Get raw image file
  getImageFile(id: string): Observable<Blob> {
    return this.apiService.get<Blob>(`images/${id}/file`);
  }

  // Create image with file and metadata
  createImageWithFile(formData: FormData): Observable<Image> {
    return this.apiService.post<Image>('images/create-with-file', formData);
  }

  // Get images by category
  getImagesByCategory(category: ImageCategory): Observable<Image[]> {
    return this.apiService.get<Image[]>(`images/category/${category}`);
  }

  // Search images by name
  searchImagesByName(name: string): Observable<Image[]> {
    return this.apiService.get<Image[]>(`images/search?name=${encodeURIComponent(name)}`);
  }

  // Get images grouped by date
  getImagesGroupedByDate(images: Image[]): { [date: string]: Image[] } {
    return images.reduce((groups, image) => {
      if (!image.createdAt) return groups;

      const date = new Date(image.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(image);
      return groups;
    }, {} as { [date: string]: Image[] });
  }

  // Get category display names
  getCategoryDisplayNames(): { [key in ImageCategory]: string } {
    return {
      [ImageCategory.ELECTION_CAMPAIGN]: 'Election Campaign',
      [ImageCategory.HEALTH_CAMP]: 'Health Camp',
      [ImageCategory.VILLAGE_FESTIVAL]: 'Village Festival',
      [ImageCategory.CULTURAL_EVENT]: 'Cultural Event',
      [ImageCategory.SPORTS_EVENT]: 'Sports Event',
      [ImageCategory.EDUCATION_PROGRAM]: 'Education Program',
      [ImageCategory.COMMUNITY_SERVICE]: 'Community Service',
      [ImageCategory.GOVERNMENT_SCHEME]: 'Government Scheme',
      [ImageCategory.DISASTER_RELIEF]: 'Disaster Relief',
      [ImageCategory.DEVELOPMENT_PROJECT]: 'Development Project',
      [ImageCategory.OTHER]: 'Other'
    };
  }

  // Delete image
  deleteImage(id: string): Observable<void> {
    return this.apiService.delete<void>(`images/${id}`);
  }

  // Refresh images (helper method)
  refreshImages(): void {
    this.getAllActiveImages().subscribe({
      next: (images) => this.imagesSubject.next(images),
      error: (error) => console.error('Error refreshing images:', error)
    });
  }
}
