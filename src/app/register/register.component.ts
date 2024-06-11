import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../post/auth.service'; // Adjusted import path
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]] // Added email form control with validation
  });
  existingUsernames: string[] = ['mmmm', 'bbbb', 'nnnn']; // Example list of existing usernames
  errorMessage: string = ''; // Error message property

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  onSubmit() {
    const username = this.registerForm.get('username')?.value?? '';
    const email = this.registerForm.get('email')?.value?? '';
    const password = this.registerForm.get('password')?.value?? '';
  
    console.log('Submitting registration with username:', username, 'email:', email, 'password:', password);
  
    this.authService.registerUser(username, email, password).subscribe(
      response => {
        console.log('Registration successful');
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Registration failed:', error);
        this.errorMessage = 'Registration failed. Please try again.';
      }
    );
  }

  onRegister() {
    const username = this.registerForm.get('username')?.value?? '';
    const email = this.registerForm.get('email')?.value?? ''; // Retrieve email value
    const password = this.registerForm.get('password')?.value?? '';

    this.authService.registerUser(username, email, password).subscribe(
      response => {
        console.log('Registration successful:', response);
        // Handle successful registration, e.g., navigate to login page
      },
      error => {
        console.error('Registration failed:', error);
        // Handle registration failure, e.g., show an error message
      }
    );
}

 navigateToLogin() {
  this.router.navigate(['/login']);
}

}
