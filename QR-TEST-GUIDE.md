# QR Code Functionality Test Guide

## Overview
This guide helps you test the QR code functionality in the parking management system.

## Test Scenarios

### 1. Vehicle Parking with QR Generation
**Steps:**
1. Navigate to Parking page
2. Click "Park Vehicle" button
3. Enter vehicle details:
   - Vehicle Number: `TEST123`
   - Vehicle Type: `car`
4. Click "Park" button
5. **Expected Result:** QR modal should appear with generated QR code
6. **Verify:** QR code displays vehicle number and download button works

### 2. QR Scanner for Vehicle Exit
**Steps:**
1. Navigate to Active Session page
2. Click "Check Out Vehicle" button
3. Switch to "Scan QR" tab
4. **Option A - File Upload:**
   - Click "Upload QR Image" button
   - Select any image file
   - Enter vehicle number when prompted
5. **Option B - Manual Entry:**
   - Switch to "Manual Entry" tab
   - Enter vehicle number directly
6. **Expected Result:** Vehicle exit process should start

### 3. Quick QR Exit from Parking Page
**Steps:**
1. Navigate to Parking page (ensure vehicles are parked)
2. Click "Scan QR Exit" button
3. Use either upload or manual entry method
4. **Expected Result:** Payment modal should appear for selected vehicle

## QR Code Format
The system generates QR codes containing:
```json
{
  "vehicleNumber": "TEST123",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing Tips

### Manual Testing
- Use any vehicle number that's currently parked
- QR scanner accepts both JSON format and plain text vehicle numbers
- File upload is a placeholder - in production, use actual QR scanning library

### Browser Console Testing
```javascript
// Test QR generation
const qrService = new QrService();
const qrCode = qrService.generateQRCode('TEST123');
console.log('Generated QR:', qrCode);

// Test QR parsing
const parsed = qrService.parseQRCode('{"vehicleNumber":"TEST123","timestamp":"2024-01-15T10:30:00.000Z"}');
console.log('Parsed QR:', parsed);
```

## Common Issues & Solutions

### Issue: QR Modal Not Showing
**Solution:** Check browser console for errors, ensure components are properly imported

### Issue: Scanner Not Working
**Solution:** Use manual entry as fallback, verify QrScannerComponent is loaded

### Issue: Vehicle Not Found
**Solution:** Ensure vehicle is actually parked and use exact vehicle number

## Production Enhancements

### For Real QR Scanning:
1. Install proper QR scanning library:
   ```bash
   npm install @zxing/ngx-scanner @zxing/library
   ```

2. Replace file upload with live camera scanning

3. Add QR code validation and error handling

### For Better UX:
1. Add QR code printing functionality
2. Implement batch QR scanning
3. Add QR code expiration
4. Include parking slot info in QR codes

## API Integration
Ensure these endpoints work:
- `POST /api/parking/park` - Parks vehicle
- `GET /api/parking/active` - Gets active sessions  
- `POST /api/parking/exit/:vehicleNumber` - Exits vehicle

## Security Notes
- QR codes only contain vehicle number and timestamp
- No sensitive data exposed in QR codes
- Server validates all vehicle operations
- Rate limiting recommended for QR operations