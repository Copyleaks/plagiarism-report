import { Injectable } from '@angular/core';

@Injectable()
export class DirectionService {
  private _dir: 'rtl' | 'ltr' = 'ltr';

  get dir() {
    return this._dir;
  }

  setDir(value: 'rtl' | 'ltr') {
    this._dir = value;
  }
}
