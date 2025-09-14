import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ParkingComponent } from './pages/parking/parking.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { SlotsComponent } from './pages/slots/slots.component';
import { HistoryComponent } from './pages/history/history.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { ActiveSessionComponent } from './pages/active-session/active-session.component';
import { SlotOverviewComponent } from './pages/slot-overview/slot-overview.component';
import { ChatComponent } from './pages/chat/chat.component';
import { SimpleChatComponent } from './pages/chat/simple-chat.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'parking', component: ParkingComponent, canActivate: [AuthGuard] },
  { path: 'payments', component: PaymentsComponent, canActivate: [AuthGuard] },
  { path: 'slotoverview', component: SlotOverviewComponent, canActivate: [AuthGuard] },
  { path: 'activesession', component: ActiveSessionComponent, canActivate: [AuthGuard] },
  { path: 'slots', component: SlotsComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent },
  { path: 'chat-full', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];