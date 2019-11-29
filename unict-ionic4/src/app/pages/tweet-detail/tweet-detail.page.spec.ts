import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TweetDetailPage } from './tweet-detail.page';

describe('TweetDetailPage', () => {
  let component: TweetDetailPage;
  let fixture: ComponentFixture<TweetDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TweetDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TweetDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
