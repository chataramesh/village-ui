import { Component, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ImageService, Image, ImageCategory } from 'src/app/core/services/image.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() villageId?: string;
  @Output() onUpload = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  uploadForm: FormGroup;
  selectedFiles: File[] = [];
  uploading = false;
  uploadProgress = 0;
  error: string | null = null;
  categories = Object.values(ImageCategory);

  // Drag and drop states
  isDragOver = false;

  constructor(
    private fb: FormBuilder,
    private imageService: ImageService,
    private tokenService: TokenService
  ) {
    this.uploadForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: [ImageCategory.OTHER, Validators.required],
      altText: ['']
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // File selection methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  private addFiles(files: File[]): void {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      this.error = 'Only image files are allowed.';
      return;
    }

    if (this.selectedFiles.length + imageFiles.length > 10) {
      this.error = 'Maximum 10 files can be uploaded at once.';
      return;
    }

    this.selectedFiles.push(...imageFiles);
    this.error = null;
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  uploadImages(): void {
    if (this.uploadForm.invalid || this.selectedFiles.length === 0) {
      return;
    }

    this.uploading = true;
    this.error = null;

    this.selectedFiles.forEach((file, index) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', this.uploadForm.value.name);
      formData.append('description', this.uploadForm.value.description);
      formData.append('category', this.uploadForm.value.category);
      formData.append('altText', this.uploadForm.value.altText || '');
      formData.append('active', 'true');

      // Include village ID if available
      if (this.villageId) {
        formData.append('villageId', this.villageId);
      }

      this.imageService.createImageWithFile(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.uploadProgress = ((index + 1) / this.selectedFiles.length) * 100;

            if (index === this.selectedFiles.length - 1) {
              this.uploading = false;
              this.uploadProgress = 100;
              this.onUpload.emit();
            }
          },
          error: (error) => {
            console.error('Upload error:', error);
            this.error = 'Failed to upload image. Please try again.';
            this.uploading = false;
          }
        });
    });
  }

  cancel(): void {
    this.onCancel.emit();
  }

  // Utility methods
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatFileName(name: string): string {
    return name.length > 20 ? name.substring(0, 17) + '...' : name;
  }

  getCategoryDisplayName(category: ImageCategory): string {
    return this.imageService.getCategoryDisplayNames()[category];
  }
}
