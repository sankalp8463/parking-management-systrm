import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'ParkEase';
  isLoggedIn = false;
  sidebarCollapsed = false;
  showMobileSidebar = false;
  showMobileMenu = false;
  showProfileDropdown = false;
  currentUser: any = null;
  isAdmin = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown')) {
      this.showProfileDropdown = false;
    }
  }

  handleResize() {
    if (window.innerWidth > 768) {
      if (this.showMobileSidebar) {
        this.showMobileSidebar = false;
      }
      if (this.showMobileMenu) {
        this.showMobileMenu = false;
      }
    }
  }

  checkLoginStatus() {
    this.isLoggedIn = !!localStorage.getItem('token');
    if (this.isLoggedIn) {
      const userStr = localStorage.getItem('user');
      this.currentUser = userStr ? JSON.parse(userStr) : null;
      this.isAdmin = this.currentUser?.role === 'admin';
    }
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.showMobileSidebar = !this.showMobileSidebar;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeMobileSidebar() {
    this.showMobileSidebar = false;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  closeProfileDropdown() {
    this.showProfileDropdown = false;
  }

  navigateToAdmin() {
    this.closeProfileDropdown();
    this.router.navigate(['/admin']);
    this.closeMobileMenu()
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.showMobileSidebar = false;
    this.showProfileDropdown = false;
    this.currentUser = null;
    this.isAdmin = false;
    this.router.navigate(['/']);
  }
}
