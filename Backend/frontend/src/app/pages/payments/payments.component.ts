import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit {
  payments: any[] = [];
  paymentStats = {
    total: 0,
    revenue: 0,
    pending: 0
  };

  newPayment = {
    vehicleNumber: '',
    paymentMethod: 'cash',
    transactionId: '',
    amountPaid: 0,
    paymentStatus: 'completed'
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.apiService.getPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading payments:', error);
      }
    });
  }

  calculateStats() {
    this.paymentStats.total = this.payments.length;
    this.paymentStats.revenue = this.payments
      .filter(p => p.paymentStatus === 'completed')
      .reduce((sum, p) => sum + p.amountPaid, 0);
    this.paymentStats.pending = this.payments
      .filter(p => p.paymentStatus === 'pending').length;
  }

  createPayment() {
    this.apiService.createPayment(this.newPayment).subscribe({
      next: (data) => {
        this.payments.unshift(data);
        this.calculateStats();
        this.newPayment = {
          vehicleNumber: '',
          paymentMethod: 'cash',
          transactionId: '',
          amountPaid: 0,
          paymentStatus: 'completed'
        };
        alert('Payment created successfully!');
      },
      error: (error) => {
        console.error('Error creating payment:', error);
        alert('Error creating payment');
      }
    });
  }
}