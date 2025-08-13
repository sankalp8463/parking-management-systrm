import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css'
})
export class PaymentModalComponent {
  @Input() paymentData: any = {};
  @Output() paymentComplete = new EventEmitter<void>();
  @Output() modalClose = new EventEmitter<void>();

  selectedMethod: string = '';
  transactionId: string = '';

  constructor(private apiService: ApiService, private toast: ToastService) {}

  selectMethod(method: string) {
    this.selectedMethod = method;
    if (method === 'cash') {
      this.transactionId = '';
    }
  }

  processPayment() {
    const paymentRequest = {
      vehicleNumber: this.paymentData.vehicleNumber,
      paymentMethod: this.selectedMethod,
      transactionId: this.selectedMethod === 'online' ? this.transactionId : null,
      amountPaid: this.paymentData.totalAmount
    };

    this.apiService.createPayment(paymentRequest).subscribe({
      next: (response) => {
        this.toast.success(`Payment of ₹${this.paymentData.totalAmount} completed successfully via ${this.selectedMethod}!`);
        
        // Generate receipt after successful payment
        const receiptData = {
          vehicleNumber: this.paymentData.vehicleNumber,
          entryTime: this.paymentData.entryTime || new Date(Date()), // 2 hours ago
          exitTime: this.paymentData.exitTime || new Date()
        };
        
        this.apiService.generateReceipt(receiptData).subscribe({
          next: (receiptResponse) => {
            this.downloadReceipt(receiptResponse.pdfBase64, receiptResponse.receiptNumber);
          },
          error: (error) => {
            console.error('Receipt generation error:', error);
            this.toast.warning('Payment successful but receipt generation failed');
          }
        });
        
        this.paymentComplete.emit();
        this.closeModal();
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.toast.error('Payment failed. Please try again.');
      }
    });
  }

  downloadReceipt(base64Buffer: string, receiptNumber: string) {
    try {
      const byteCharacters = atob(base64Buffer);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      this.toast.info('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      this.toast.error('Failed to download receipt');
    }
  }

  closeModal() {
    this.modalClose.emit();
  }
}