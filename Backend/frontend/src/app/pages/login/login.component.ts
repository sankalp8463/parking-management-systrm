// import { routes } from './../../app.routes';
import { Toast, ToastService } from './../../services/toast.service';
import { ApiService } from './../../services/api.service';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    phoneNumber: '',
    password: ''
  };

  // Login flow properties
  loginStep: 'credentials' | 'otp' = 'credentials';
  otp = '';
  isLoading = false;
  canResend = false;
  resendTimer = 60;
  private timerInterval: any;

  // Carousel images
  images: string[] = [
    '../../../assets/images/pexels-fotios-photos-29557509.jpg',
    '../../../assets/images/pexels-proxyclick-2451622.jpg',
    '../../../assets/images/pexels-keat007-31685643.jpg'

  ];

  currentSlide = 0;

  constructor(private apiService:ApiService,private toast:ToastService,private router:Router) {
    // Auto change slides every 3s
    setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.images.length;
  }
  ngOnInit() {
    const token= localStorage.getItem('token');
    if(token){
     this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  onLogin() {
    if (!this.loginData.phoneNumber || !this.loginData.password) {
      this.toast.error('Please enter both phone number and password');
      return;
    }

    this.isLoading = true;

    this.apiService.verifyPasswordAndSendOTP(this.loginData).subscribe({
      next: (response) => {
        this.toast.success('Password verified! OTP sent to your phone.');
        this.loginStep = 'otp';
        this.startResendTimer();
        this.isLoading = false;
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Invalid credentials');
        this.isLoading = false;
      }
    });
  }

  // Verify OTP and complete login
  verifyOTP() {
    if (!this.otp || this.otp.length !== 6) {
      this.toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    this.isLoading = true;

    this.apiService.completeLogin(this.loginData.phoneNumber, this.otp).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userId', response.user._id);
        localStorage.setItem('userRole', response.user.role);

        this.toast.success('Login successful!');

        if (response.user.role === 'admin') {
          this.router.navigate(['/admin']);
          window.location.reload();
        } else {
          this.router.navigate(['/dashboard']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Invalid OTP');
        this.isLoading = false;
      }
    });
  }

  // Resend OTP
  resendOTP() {
    this.isLoading = true;
    this.apiService.verifyPasswordAndSendOTP(this.loginData).subscribe({
      next: (response) => {
        this.toast.success('OTP resent successfully');
        this.startResendTimer();
        this.isLoading = false;
      },
      error: (error) => {
        this.toast.error('Failed to resend OTP');
        this.isLoading = false;
      }
    });
  }

  // Go back to credentials input
  backToCredentials() {
    this.loginStep = 'credentials';
    this.otp = '';
    this.stopResendTimer();
  }

  private startResendTimer() {
    this.canResend = false;
    this.resendTimer = 60;

    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        this.stopResendTimer();
      }
    }, 1000);
  }

  private stopResendTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onOtpInput(event: any) {
    const value = event.target.value.replace(/[^0-9]/g, '');
    this.otp = value;
    event.target.value = value;
  }
}


