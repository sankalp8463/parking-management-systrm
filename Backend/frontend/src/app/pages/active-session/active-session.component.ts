import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-active-session',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentModalComponent],
  templateUrl: './active-session.component.html',
  styleUrl: './active-session.component.css'
})
export class ActiveSessionComponent implements OnInit {
  parkData = {
    vehicleNumber: '',
    vehicleType: 'car'
  };

  exitData = {
    vehicleNumber: ''
  };

  parkingSlots: any[] = [];
  activeEntries: any[] = [];
  showPaymentModal = false;
  paymentData: any = {};
  showParkModal = false;
  showCheckoutModal = false;

  // Add missing property for processing state
  isProcessing = false;

  constructor(private apiService: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.loadParkingData();
    console.log('Component initialized');
  }

  parkVehicle() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user._id) {
      this.toast.warning('Please login to park a vehicle');
      return;
    }

    const parkingData = {
      ...this.parkData,
      userId: user._id
    };

    this.apiService.parkVehicle(parkingData).subscribe({
      next: (data) => {
        this.toast.success('Vehicle parked successfully! Vehicle registered automatically.');
        this.parkData = { vehicleNumber: '', vehicleType: 'car' };
        this.loadParkingData();
      },
      error: (error) => {
        console.error('Error parking vehicle:', error);
        this.toast.error('Error parking vehicle. Please check if slots are available.');
      }
    });
  }

  // Fixed method - don't reload data until payment is complete
  exitVehicleByVehicleNumber() {
    if (!this.exitData.vehicleNumber || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    this.apiService.exitVehicleByNumber(this.exitData.vehicleNumber).subscribe({
      next: (data) => {
        // Store payment data and show payment modal
        this.paymentData = {
          ...data,
          vehicleNumber: this.exitData.vehicleNumber
        };

        this.showPaymentModal = true;
        this.showCheckoutModal = false;
        this.exitData = { vehicleNumber: '' };
        this.isProcessing = false;

        // DON'T reload data here - wait for payment completion
        console.log('Exit initiated, showing payment modal');
      },
      error: (error) => {
        console.error('Error exiting vehicle:', error);
        this.toast.error('Error exiting vehicle. Please check if vehicle is currently parked.');
        this.isProcessing = false;
      }
    });
  }

  // Fixed method - don't reload data until payment is complete
  exitVehicleByNumber(vehicleNumber: string) {
    console.log('Exit button clicked for vehicle:', vehicleNumber);

    this.apiService.exitVehicleByNumber(vehicleNumber).subscribe({
      next: (data) => {
        // Store payment data and show payment modal
        this.paymentData = {
          ...data,
          vehicleNumber: vehicleNumber
        };

        this.showPaymentModal = true;

        // DON'T reload data here - wait for payment completion
        console.log('Payment modal should show now');
      },
      error: (error) => {
        console.error('Error exiting vehicle:', error);
        this.toast.error('Error exiting vehicle');
      }
    });
  }

  /**
   * Handle quick vehicle selection from dropdown
   */
  onQuickSelectVehicle(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedVehicleNumber = target.value;

    if (selectedVehicleNumber) {
      this.exitData.vehicleNumber = selectedVehicleNumber;
    }
  }

  // Fixed method - only reload after payment is actually completed
  onPaymentComplete() {
    console.log('Payment completed, reloading data');
    this.loadParkingData(); // Now it's safe to reload
    this.showPaymentModal = false;
    this.toast.success('Vehicle checked out successfully!');
  }

  // Fixed method - handle payment modal close
  onModalClose() {
    console.log('Payment modal closed without completion');
    this.showPaymentModal = false;

    // Since payment wasn't completed, the vehicle should still be in the system
    // Reload data to ensure UI is in sync with backend
    this.loadParkingData();
  }

  loadParkingData() {
    console.log('Loading parking data...');

    this.apiService.getParkingSlots().subscribe({
      next: (data) => {
        this.parkingSlots = data;
        console.log('Parking slots loaded:', data.length);
      },
      error: (error) => {
        console.error('Error loading parking slots:', error);
      }
    });

    this.apiService.getActiveEntries().subscribe({
      next: (data) => {
        this.activeEntries = data.map((entry: any) => ({
          id: entry._id,
          vehicleNumber: entry.vehicleId?.vehicleNumber || 'N/A',
          vehicleType: entry.vehicleId?.vehicleType || 'N/A',
          slotNumber: entry.slotId?.slotNumber || 'N/A',
          entryTime: new Date(entry.entryTime),
          duration: this.calculateDuration(entry.entryTime)
        }));
        console.log('Active entries loaded:', this.activeEntries.length);
      },
      error: (error) => {
        console.error('Error loading active entries:', error);
      }
    });
  }

  calculateDuration(entryTime: string): string {
    const now = new Date();
    const entry = new Date(entryTime);
    const diffMs = now.getTime() - entry.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  openParkModal() {
    console.log("Opening park modal");
    this.showParkModal = true;
  }

  closeParkModal() {
    console.log("Closing park modal");
    this.showParkModal = false;
    this.parkData = { vehicleNumber: '', vehicleType: 'car' };
  }

  // Fixed method with better logging
  openCheckoutModal() {
    console.log("Opening checkout modal - button clicked");
    this.showCheckoutModal = true;

    // Reset form when opening modal
    this.exitData = { vehicleNumber: '' };
    this.isProcessing = false;

    console.log("Checkout modal state:", this.showCheckoutModal);
  }

  closeCheckoutModal() {
    console.log("Closing checkout modal");
    this.showCheckoutModal = false;

    // Reset form when closing modal
    this.exitData = { vehicleNumber: '' };
    this.isProcessing = false;
  }

  // Add this method to test modal functionality
  testModal() {
    console.log("Test modal method called");
    alert("Button is working!");
  }
}
