import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData = {
    phoneNumber: '',
    password: ''
  };
  loginStatus: boolean = false;

  ngOnInit() {
    this.checkLoginStatus();
    if (this.loginStatus) {
      this.router.navigate(['/dashboard']);
    }
  
    
  }
checkLoginStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    this.loginStatus = true;
  } else {
    this.loginStatus = false;
  }
}
  constructor(private router: Router, private apiService: ApiService, private toast: ToastService) {}

  onLogin() {
    this.apiService.login(this.loginData).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.toast.success('Login successful! Welcome back.');
        window.location.reload();

        this.router.navigate(['/dashboard']);

      },
      error: (error) => {
        console.error('Login error:', error);
        this.toast.error('Login failed. Please check your credentials.');
      }
    });
  }
}