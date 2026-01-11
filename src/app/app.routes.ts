import { Routes } from '@angular/router';
import { UserListComponent } from './pages/users/user-list/user-list';
import { UserDetailComponent } from './pages/users/user-detail/user-detail';

export const routes: Routes = [
  { path: '', component: UserListComponent },
  { path: 'user/:id', component: UserDetailComponent },
  { path: '**', redirectTo: '' }
];

