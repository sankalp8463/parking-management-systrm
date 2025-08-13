import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  loginStatus: boolean = false;
 ngOnInit() {
  this.checkLoginStatus();
 }
  checkLoginStatus() {

    this.loginStatus = !!localStorage.getItem('token');
  }

}
