import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { PrimaryNav } from './primary-nav';

@Component({
  template: '<app-primary-nav (itemSelected)="onSelected()" />',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [PrimaryNav],
})
class TestHostComponent {
  selectedCount = 0;

  onSelected(): void {
    this.selectedCount++;
  }
}

@Component({ template: '' })
class TestRouteComponent {}

describe('PrimaryNav', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TestRouteComponent],
      providers: [
        provideRouter([
          { path: 'dashboard', component: TestRouteComponent },
          { path: 'seasons', component: TestRouteComponent },
          { path: 'seasons/:slug/edit', component: TestRouteComponent },
          { path: 'news', component: TestRouteComponent },
          { path: 'news/:id/edit', component: TestRouteComponent },
          { path: 'users', component: TestRouteComponent },
          { path: 'events', component: TestRouteComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should render only the current administrative navigation items', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('.primary-nav__link')) as HTMLAnchorElement[];
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Dashboard',
      'Seasons',
      'News',
      'Users',
      'Events',
    ]);
  });

  it('should keep Dashboard exact', async () => {
    await router.navigateByUrl('/dashboard');
    fixture.detectChanges();

    const dashboard = fixture.nativeElement.querySelector('a[href="/dashboard"]');
    expect(dashboard.classList.contains('primary-nav__link--active')).toBe(true);
  });

  it('should keep Seasons active on a subroute', async () => {
    await router.navigateByUrl('/seasons/spring/edit');
    fixture.detectChanges();

    const seasons = fixture.nativeElement.querySelector('a[href="/seasons"]');
    expect(seasons.classList.contains('primary-nav__link--active')).toBe(true);
    expect(seasons.getAttribute('aria-current')).toBe('page');
  });

  it('should keep News active on a subroute', async () => {
    await router.navigateByUrl('/news/42/edit');
    fixture.detectChanges();

    const news = fixture.nativeElement.querySelector('a[href="/news"]');
    expect(news.classList.contains('primary-nav__link--active')).toBe(true);
  });

  it('should emit itemSelected when a navigation item is clicked', () => {
    fixture.nativeElement.querySelector('.primary-nav__link').click();
    expect(fixture.componentInstance.selectedCount).toBe(1);
  });
});
