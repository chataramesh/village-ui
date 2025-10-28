import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  sub?: Subscription;

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toast.toasts$.subscribe(list => {
      this.toasts = list;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  dismiss(id: number) {
    this.toast.dismiss(id);
  }
}
