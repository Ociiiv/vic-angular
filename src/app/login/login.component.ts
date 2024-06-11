import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../post/auth.service'; // Import AuthService
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LockoutDialogComponent } from '../lockout-dialog/lockout-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  loginError: string | null = null; // Property to hold the error message
  incorrectAttempts = 0; // Track incorrect attempts

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private dialog: MatDialog) {}

  onSubmit() {
    if (this.authService.isAccountLocked()) {
      this.loginError = 'Account is locked. Please wait and try again later.';
      return;
    }
  
    const username = this.loginForm.get('username')?.value?? '';
    const password = this.loginForm.get('password')?.value?? '';
  
    // Attempt to log in the user
    this.authService.loginUser(username, password).subscribe(
      response => {
        console.log('Login response:', response);
        this.authService.storeToken(response.token); // Store the JWT
        this.router.navigate(['/posts']); // Redirect to the post component
        this.loginError = null; // Clear any previous error messages
        this.incorrectAttempts = 0; // Reset incorrect attempts counter
      },
      error => {
        console.error('Login failed:', error);
        // Increment the incorrect attempts counter
        this.incorrectAttempts++;
        // Define different error messages based on the number of attempts
        let errorMessage;
        if (this.incorrectAttempts === 1) {
          errorMessage = 'Incorrect credentials. You have 2 attempts left.';
        } else if (this.incorrectAttempts === 2) {
          errorMessage = 'Incorrect credentials. You have 1 attempt left.';
        } else if (this.incorrectAttempts >= 3) {
          errorMessage = 'Account Locked!';
          // Open the LockoutDialogComponent
          this.dialog.open(LockoutDialogComponent, {
            width: '250px',
            data: { message: 'Account Locked!' }
          });
        } else {
          errorMessage = 'Incorrect credentials.';
        }
        this.loginError = errorMessage; 
      }
    );
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }


}