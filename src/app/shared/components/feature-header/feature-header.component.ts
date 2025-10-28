import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-feature-header',
  templateUrl: './feature-header.component.html',
  styleUrls: ['./feature-header.component.scss']
})
export class FeatureHeaderComponent {
  @Input() title = '';
  @Input() subtitle: string | null = null;
  @Input() showBack = false;
  @Input() dense = false;
  @Input() actionsAlign: 'left' | 'right' | 'center' = 'right';

  @Output() back = new EventEmitter<void>();

  onBack() {
    this.back.emit();
  }
}
