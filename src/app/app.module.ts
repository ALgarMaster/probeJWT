import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent, // Здесь регистрируем компонент
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([]), // Тут указываем ваши маршруты
  ],
  providers: [],
  bootstrap: [AppComponent], // Запуск приложения с AppComponent
})
export class AppModule {}
