import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningEvaluationComponent } from './opening-evaluation.component';

describe('OpeningEvaluationComponent', () => {
  let component: OpeningEvaluationComponent;
  let fixture: ComponentFixture<OpeningEvaluationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpeningEvaluationComponent]
    });
    fixture = TestBed.createComponent(OpeningEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
