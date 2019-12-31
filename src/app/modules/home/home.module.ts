import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from '../acces/login/login.component';

@NgModule({
  declarations: [HomeComponent, WelcomeComponent, LoginComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [HomeComponent, WelcomeComponent]
})
export class HomeModule { }
