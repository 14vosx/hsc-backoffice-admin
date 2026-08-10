import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { NewsActionsComponent } from './news-actions.component';

describe('NewsActionsComponent', () => {
  let fixture: ComponentFixture<NewsActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NewsActionsComponent] }).compileComponents();
    fixture = TestBed.createComponent(NewsActionsComponent);
    fixture.componentRef.setInput('itemId', 42);
    fixture.componentRef.setInput('status', 'draft');
    fixture.detectChanges();
  });

  it('should emit edit, publish and remove actions for a draft', () => {
    const component = fixture.componentInstance;
    const edit = vi.fn();
    const publish = vi.fn();
    const remove = vi.fn();
    component.edit.subscribe(edit);
    component.publish.subscribe(publish);
    component.remove.subscribe(remove);

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    buttons[1].click();
    buttons[2].click();

    expect(edit).toHaveBeenCalledWith(42);
    expect(publish).toHaveBeenCalledWith(42);
    expect(remove).toHaveBeenCalledWith(42);
  });

  it('should preserve disabled actions', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });
});
