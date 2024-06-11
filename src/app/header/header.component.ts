import { Component } from "@angular/core";
import { AuthService } from '../post/auth.service'; // Adjust the path as necessary
import { Router } from '@angular/router';

@Component({
    selector:'app-header',
    templateUrl:'./header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    constructor(public authService: AuthService, private router: Router) {}

    logout(): void {
        this.authService.logout();
      }
    

    navigateToLogin() {
        this.router.navigate(['/login']); // Navigate to the login page
      }

      navigateToChangePassword() {
        console.log('Navigating to change password');
        this.router.navigate(['/change-password']);
      }
    
      navigateToHome() {
        this.router.navigate(['/posts']); // Assuming '/posts' is the route for PostListComponent
      }

      goToProfile() {
        this.router.navigate(['/profile']); // Replace '/profile' with the actual route to your profile component
      }
      
}