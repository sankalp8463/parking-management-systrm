import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.production ? environment.apiUrl : 'http://51.20.84.36/api/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // Auth
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/login`, credentials);
  }

  // Users
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, { headers: this.getAuthHeaders() });
  }

  // Vehicles
  getVehicles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/vehicles`, { headers: this.getAuthHeaders() });
  }

  createVehicle(vehicleData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/vehicles`, vehicleData, { headers: this.getAuthHeaders() });
  }

  deleteVehicle(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/vehicles/${id}`, { headers: this.getAuthHeaders() });
  }

  // Parking Slots
  getParkingSlots(): Observable<any> {
    return this.http.get(`${this.baseUrl}/parking-slots`, { headers: this.getAuthHeaders() });
  }

  getAvailableSlots(): Observable<any> {
    return this.http.get(`${this.baseUrl}/parking-slots/status/available`, { headers: this.getAuthHeaders() });
  }

  createParkingSlot(slotData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/parking-slots`, slotData, { headers: this.getAuthHeaders() });
  }

  updateParkingSlot(id: string, slotData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/parking-slots/${id}`, slotData, { headers: this.getAuthHeaders() });
  }

  deleteParkingSlot(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/parking-slots/${id}`, { headers: this.getAuthHeaders() });
  }

  // Parking Entries
  parkVehicle(parkData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/parking-entries/park`, parkData, { headers: this.getAuthHeaders() });
  }

  exitVehicle(entryId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/parking-entries/exit/${entryId}`, {}, { headers: this.getAuthHeaders() });
  }

  exitVehicleByNumber(vehicleNumber: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/parking-entries/exit-by-vehicle`, { vehicleNumber }, { headers: this.getAuthHeaders() });
  }

  getActiveEntries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/parking-entries/status/active`, { headers: this.getAuthHeaders() });
  }

  getAllEntries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/parking-entries`, { headers: this.getAuthHeaders() });
  }

  // Payments
  getPayments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments`, { headers: this.getAuthHeaders() });
  }

  createRazorpayOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/create-order`, orderData, { headers: this.getAuthHeaders() });
  }

  verifyRazorpayPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/verify`, paymentData, { headers: this.getAuthHeaders() });
  }

  createPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments`, paymentData, { headers: this.getAuthHeaders() });
  }

  // Receipts
  generateReceipt(receiptData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/receipts/generate`, receiptData, { headers: this.getAuthHeaders() });
  }

  // Parking History
  getParkingHistory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/parking-history`, { headers: this.getAuthHeaders() });
  }

  getUserHistory(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/parking-history/user/${userId}`, { headers: this.getAuthHeaders() });
  }
}