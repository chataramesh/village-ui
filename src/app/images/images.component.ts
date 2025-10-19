import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ImageService, Image, ImageCategory } from 'src/app/core/services/image.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  images: Image[] = [];
  imagesByDate: { [date: string]: Image[] } = {};
  loading = true;
  error: string | null = null;
  showUploadModal = false;

  currentVillageId: string | null = null;
  private isLoadingImages = false;

  constructor(
    private imageService: ImageService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentVillage();
    this.loadImages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentVillage(): void {
    try {
      const tokenUser = this.tokenService.getCurrentUser();
      if (tokenUser?.village?.id) {
        this.currentVillageId = tokenUser.village.id;
      }
    } catch (error) {
      console.error('Error loading current village:', error);
      this.currentVillageId = null;
    }
  }

  loadImages(): void {
    // Prevent multiple simultaneous API calls
    if (this.isLoadingImages) {
      console.log('Already loading images, skipping duplicate call');
      return;
    }

    this.isLoadingImages = true;
    this.loading = true;
    this.error = null;

    console.log('Loading images...');

    this.imageService.getAllActiveImages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (images) => {
          console.log('Images loaded successfully:', images?.length || 0, 'images');
          this.images = images || [];
          this.imagesByDate = this.imageService.getImagesGroupedByDate(images || []);
          this.loading = false;
          this.isLoadingImages = false;
          // Manually trigger change detection to prevent loops
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading images:', error);
          this.error = 'Failed to load images. Please check your connection and try again.';
          this.loading = false;
          this.isLoadingImages = false;
        }
      });
  }
  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
  }

  onImageUploaded(): void {
    this.closeUploadModal();
    this.loadImages();
  }

  downloadImage(image: Image): void {
    if (image.id) {
      this.imageService.getImageFile(image.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = image.originalFileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          },
          error: (error) => {
            console.error('Error downloading image:', error);
            alert('Failed to download image. Please try again.');
          }
        });
    }
  }

  deleteImage(image: Image): void {
    if (image.id && confirm('Are you sure you want to delete this image?')) {
      this.images = this.images.filter(img => img.id !== image.id);
      this.imagesByDate = this.imageService.getImagesGroupedByDate(this.images);
      alert('Image deleted successfully');
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/village-admin']);
  }

  getDateKeys(): string[] {
    return Object.keys(this.imagesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getCategoryDisplayName(category: ImageCategory): string {
    return this.imageService.getCategoryDisplayNames()[category];
  }

  // onImageError(event: Event, image: Image): void {
  //   const imgElement = event.target as HTMLImageElement;
  //   imgElement.src = 'assets/images/placeholder-image.png';
  //   console.warn('Failed to load image:', image.originalFileName);
  // }

  getCategoryColor(category: ImageCategory): string {
    const colors: { [key in ImageCategory]: string } = {
      [ImageCategory.ELECTION_CAMPAIGN]: '#3b82f6',
      [ImageCategory.HEALTH_CAMP]: '#10b981',
      [ImageCategory.VILLAGE_FESTIVAL]: '#f59e0b',
      [ImageCategory.CULTURAL_EVENT]: '#8b5cf6',
      [ImageCategory.SPORTS_EVENT]: '#ef4444',
      [ImageCategory.EDUCATION_PROGRAM]: '#06b6d4',
      [ImageCategory.COMMUNITY_SERVICE]: '#84cc16',
      [ImageCategory.GOVERNMENT_SCHEME]: '#f97316',
      [ImageCategory.DISASTER_RELIEF]: '#dc2626',
      [ImageCategory.DEVELOPMENT_PROJECT]: '#7c3aed',
      [ImageCategory.OTHER]: '#6b7280'
    };
    return colors[category] || colors[ImageCategory.OTHER];
  }
}
