import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../post/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordChangedSuccessfully: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
  }

  async onChangePassword(): Promise<void> {
    // Check if newPassword and confirmPassword match
    if (this.newPassword!== this.confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Validate that currentPassword is not empty
    if (!this.currentPassword) {
        alert('Current password cannot be empty');
        return;
    }

    // Retrieve the current user's username
    try {
        // Explicitly handle the result of getCurrentUserUsername
        const currentUserUsernameResult = await this.authService.getCurrentUserUsername();
        const currentUserUsername = await this.authService.getCurrentUserUsername();

        // Proceed with the password change
        this.authService.changePassword(currentUserUsername, this.currentPassword, this.newPassword)
       .subscribe({
            next: (response) => {
                alert('Password changed successfully. Please login again');
                // Programmatically log out the user
                this.authService.logout(true); // Pass true to navigate to login after logging out
            },
            error: (err) => {
                alert('Failed to change password');
            }
        });

    } catch (error) {
        console.error('Error retrieving username:', error);
        alert('An error occurred while trying to retrieve your username.');
    }
}

}