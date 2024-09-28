// import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { ChessboardComponent } from './chessboard/chessboard.component';
import { OpeningEvaluationComponent } from './opening-evaluation/opening-evaluation.component';

@NgModule({
  declarations: [
    AppComponent,
    ChessboardComponent,
    OpeningEvaluationComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
