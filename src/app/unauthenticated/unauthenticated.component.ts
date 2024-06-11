import { Component } from '@angular/core';
import { AuthService } from '../post/auth.service';


@Component({
  selector: 'app-unauthenticated',
  templateUrl: './unauthenticated.component.html',
  styleUrls: ['./unauthenticated.component.css']
})
export class UnauthenticatedComponent {
  constructor(private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
 }


}
