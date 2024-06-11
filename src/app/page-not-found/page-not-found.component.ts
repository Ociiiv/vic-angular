// page-not-found.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../post/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent {
  constructor(private router: Router, private authService: AuthService) {}

  goBack() {
    this.router.navigate(['/login']);
  }
}