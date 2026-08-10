import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app-footer.css',
})
export class AppFooter {
  protected readonly currentYear = new Date().getFullYear();
}
