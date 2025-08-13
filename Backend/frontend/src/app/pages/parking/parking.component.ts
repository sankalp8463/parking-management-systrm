import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentModalComponent],
  templateUrl: './parking.component.html',
  styleUrl: './parking.component.css'
})
export class ParkingComponent implements OnInit {
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

  constructor(private apiService: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.loadParkingData();
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

  exitVehicleByVehicleNumber() {
    this.apiService.exitVehicleByNumber(this.exitData.vehicleNumber).subscribe({
      next: (data) => {
        this.paymentData = data;
        this.showPaymentModal = true;
        this.exitData = { vehicleNumber: '' };
      },
      error: (error) => {
        console.error('Error exiting vehicle:', error);
        this.toast.error('Error exiting vehicle. Please check if vehicle is currently parked.');
      }
    });
  }

  exitVehicleByNumber(vehicleNumber: string) {
    this.apiService.exitVehicleByNumber(vehicleNumber).subscribe({
      next: (data) => {
        this.paymentData = data;
        this.showPaymentModal = true;
      },
      error: (error) => {
        console.error('Error exiting vehicle:', error);
        this.toast.error('Error exiting vehicle');
      }
    });
  }

  onPaymentComplete() {
    this.loadParkingData();
  }

  onModalClose() {
    this.showPaymentModal = false;
  }

  loadParkingData() {
    this.apiService.getParkingSlots().subscribe({
      next: (data) => {
        this.parkingSlots = data;
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
          slotNumber: entry.slotId?.slotNumber || 'N/A',
          entryTime: new Date(entry.entryTime),
          duration: this.calculateDuration(entry.entryTime)
        }));
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
}