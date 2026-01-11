import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NgbPagination, CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  error = false;

  viewMode: 'table' | 'card' = 'table';
  page = 1;
  pageSize = 5;

  searchControl = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.viewMode = (localStorage.getItem('view') as 'table' | 'card') || 'table';

    const initialSearch = this.route.snapshot.queryParamMap.get('search') || '';
    if (initialSearch) this.searchControl.setValue(initialSearch);

    this.loadUsers(initialSearch);

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        const term = value || '';
        this.updateUrl(term);
        this.applyFilter(term);
      });
  }

  loadUsers(initialSearch: string) {
    this.loading = true;
    this.userService.fetchUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilter(initialSearch);
        this.loading = false;
        this.error = false;
      },
      error: () => {
        this.loading = false
        this.error = true;
      }
    });
  }

  retry(): void {
    const search = this.searchControl.value || '';
    this.loadUsers(search);
  }

  applyFilter(text: string) {
    const term = text.toLowerCase().trim();
    this.filteredUsers = this.users.filter(
      (u) => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    );
    this.page = 1;
  }

  updateUrl(search: string) {
    this.router.navigate([], {
      queryParams: { search: search || null },
      queryParamsHandling: 'merge',
    });
  }

  toggleView(mode: 'table' | 'card') {
    this.viewMode = mode;
    localStorage.setItem('view', mode);
  }

  viewUser(userId: number) {
    this.router.navigate(['/user', userId], { queryParamsHandling: 'preserve' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}