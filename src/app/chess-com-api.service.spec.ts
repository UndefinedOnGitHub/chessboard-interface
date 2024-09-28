import { TestBed } from '@angular/core/testing';

import { ChessComApiService } from './chess-com-api.service';

describe('ChessComApiService', () => {
  let service: ChessComApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChessComApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
