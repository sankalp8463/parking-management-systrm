import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  staffForm = {
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    role: 'staff'
  };

  staffList: any[] = [];
  isLoading = false;
  isSubmitting = false;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadStaffList();
  }

  async createStaff() {
    if (!this.staffForm.name || !this.staffForm.phoneNumber || !this.staffForm.password) {
      this.toastService.showError('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    try {
      await this.apiService.createUser(this.staffForm);
      this.toastService.showSuccess('Staff member created successfully');
      this.resetForm();
      this.loadStaffList();
    } catch (error: any) {
      this.toastService.showError(error.error?.message || 'Failed to create staff member');
    } finally {
      this.isSubmitting = false;
    }
  }

  async loadStaffList() {
    this.isLoading = true;
    try {
      const users = await this.apiService.getUsers();
      this.staffList = users.filter((user: any) => user.role === 'staff');
    } catch (error) {
      this.toastService.showError('Failed to load staff list');
    } finally {
      this.isLoading = false;
    }
  }

  async deleteStaff(staffId: string) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await this.apiService.deleteUser(staffId);
      this.toastService.showSuccess('Staff member deleted successfully');
      this.loadStaffList();
    } catch (error) {
      this.toastService.showError('Failed to delete staff member');
    }
  }

  resetForm() {
    this.staffForm = {
      name: '',
      phoneNumber: '',
      email: '',
      password: '',
      role: 'staff'
    };
  }
}