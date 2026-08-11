import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthSessionStore } from '../../../../core/auth/auth-session.store';
import { NewsAdminStore } from '../../../news/state/news-admin.store';
import { SeasonsCompetitiveSummaryApiService } from '../../../seasons/data-access/seasons-competitive-summary-api.service';
import { SeasonsAdminStore } from '../../../seasons/state/seasons-admin.store';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;

  const authSessionStore = {
    user: signal(null),
    role: signal(null),
  };
  const newsStore = {
    items: signal([]),
    loading: signal(false),
    error: signal(null),
    ensureLoaded: vi.fn(() => Promise.resolve()),
  };
  const seasonsStore = {
    items: signal([{
      id: 1,
      slug: 'season-one',
      name: 'Season One',
      description: null,
      coverImageUrl: null,
      startAt: '2026-01-01T00:00:00Z',
      endAt: '2026-02-01T00:00:00Z',
      status: 'active' as const,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }]),
    loading: signal(false),
    error: signal(null),
    ensureLoaded: vi.fn(() => Promise.resolve()),
  };
  const competitiveSummaryApi = {
    index: vi.fn(() => of({
      generatedAt: '2026-01-20T10:31:00Z',
      activeSeasonSlug: 'season-one',
      seasons: [{
        slug: 'season-one',
        name: 'Season One',
        description: null,
        status: 'active' as const,
        startAt: '2026-01-01T00:00:00Z',
        endAt: '2026-02-01T00:00:00Z',
        summary: {
          matches: 1,
          maps: 2,
          rounds: 3,
          players: 4,
          lastMapEndedAt: '2026-01-20T10:30:00Z',
        },
      }],
    })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthSessionStore, useValue: authSessionStore },
        { provide: NewsAdminStore, useValue: newsStore },
        { provide: SeasonsAdminStore, useValue: seasonsStore },
        { provide: SeasonsCompetitiveSummaryApiService, useValue: competitiveSummaryApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should preserve the main administrative links without Material directives', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/news/new');
    expect(hrefs).toContain('/seasons/new');
    expect(hrefs).toContain('/users');
    expect(fixture.nativeElement.querySelector('app-ui-card')).toBeTruthy();
  });

  it('renders an ISO UTC last-map timestamp without a DatePipe error', async () => {
    await fixture.whenStable();

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('20/01/2026');
  });
});
