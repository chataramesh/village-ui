import { Component, Input, ContentChild, TemplateRef, ElementRef } from '@angular/core';


@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent {
  /** Class to be applied at card level */
  @Input() cardClass?: string;

  /** To hide header from card */
  @Input() showHeader: boolean = true;

  /** To hide content from card */
  @Input() showContent: boolean = true;

  /** Class to be applied on card header */
  @Input() headerClass?: string;

  /** Class to be applied on action section of mat card */
  @Input() actionClass?: string;

  /** Title of card. Visible at left side of card header */
  @Input() cardTitle?: string;

  /** Padding around card content in px. Default is 24 */
  @Input() padding: number = 24;

  /** Template reference of header actions on right side */
  @ContentChild('headerOptionsTemplate', { read: TemplateRef })
  headerOptionsTemplate!: TemplateRef<any>;

  /** Template reference of header actions besides title at left */
  @ContentChild('headerTitleTemplate', { read: TemplateRef })
  headerTitleTemplate!: TemplateRef<any>;

  /** Template reference for mat-actions at bottom */
  @ContentChild('actionTemplate', { read: TemplateRef })
  actionTemplate!: TemplateRef<any>;
}

