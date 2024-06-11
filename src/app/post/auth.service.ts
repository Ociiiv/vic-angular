import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../user.model'; 
import jwt_decode from 'jwt-decode';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LogoutDialogComponent } from '../logout-dialog/logout-dialog.component';
import { LockoutDialogComponent } from '../lockout-dialog/lockout-dialog.component';
import { Subject } from 'rxjs';

// Define a custom interface for the decoded token
interface DecodedToken {
    [key: string]: any; 
}

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private apiUrl = 'http://localhost:3000';
    private currentUserSubject: BehaviorSubject<User | null>;
    private tokenExpirationCheckInterval: any;
    private failedLoginAttempts = 0;
    private lockoutTime = 10000; // 10 seconds in milliseconds
    private lockoutEnd: Date | null = null;
    private tokenExpirationCheckSource = new Subject<void>();
    tokenExpirationCheck$ = this.tokenExpirationCheckSource.asObservable();

    constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) {
        this.currentUserSubject = new BehaviorSubject<User | null>(null);
    }

    registerUser(username: string, email: string, password: string): Observable<any> {
        console.log('Registering user with username:', username, 'email:', email, 'password:', password);
        return this.http.post<any>(`${this.apiUrl}/register`, { username, password, email }, { responseType: 'json' })
         .pipe(catchError(this.handleError));
    }

    loginUser(username: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
           .pipe(
                tap((response: any) => {
                    const token = response.token;
                    if (token) {
                        this.storeToken(token);
                        const decodedToken = this.decodeToken(token); // Decode JWT token
                        
                        // Store userId in localStorage
                        localStorage.setItem('userId', decodedToken['id']);
    
                        const user: User = {
                            id: decodedToken['id'], // Access id using bracket notation
                            username: decodedToken['username'], // Access username using bracket notation
                            // Add other properties if needed
                        };
                        this.currentUserSubject.next(user); // Update currentUserSubject with the user information
                        this.router.navigate(['/posts']); // Navigate to posts page after login
    
                        // Calculate the time remaining until the token expires
                        const currentTime = Date.now().valueOf() / 1000;
                        const timeRemaining = decodedToken['exp'] - currentTime;
    
                        // If the token is not expired, set a timer to log out the user after the token expires
                        if (timeRemaining > 0) {
                            setTimeout(() => {
                                this.logout();
                            }, timeRemaining * 1000); // Convert seconds to milliseconds
                        }
                    } else {
                        console.error('Token not found in login response');
                    }
                }),
                catchError(this.handleError)
            );
    }
    private showLockoutDialog(): void {
        const dialogRef = this.dialog.open(LockoutDialogComponent, {
          width: '250px',
          data: { message: 'Account locked due to multiple failed attempts. Please wait.' }
        });
    
        dialogRef.afterClosed().subscribe(() => {
          console.log('Lockout dialog closed');
        });
    }

    isAccountLocked(): boolean {
        return this.failedLoginAttempts >= 3;
    }
    
    resetFailedLoginAttempts(): void {
        this.failedLoginAttempts = 0;
    }


    logout(navigateToLogin: boolean = true): void {
        console.log('Logging out');
        this.clearToken();
        if (this.tokenExpirationCheckInterval) {
            clearInterval(this.tokenExpirationCheckInterval);
        }
        if (navigateToLogin) {
            this.router.navigate(['/login'], { replaceUrl: true }); // Use replaceUrl: true to replace the current URL
        }
    }

    storeToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    clearToken(): void {
        localStorage.removeItem('authToken');
        this.currentUserSubject.next(null);
    }

   isLoggedIn(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return false;
    }
    try {
        const decodedToken = this.decodeToken(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken['exp'] && decodedToken['exp'] < currentTime) {
            this.clearToken();
            return false;
        }
        return true;
    } catch (error) {
        this.clearToken();
        return false;
    }
}

    private decodeToken(token: string): DecodedToken {
        try {
            return jwt_decode(token) as DecodedToken; // Decode the token and return the decoded object
        } catch (error) {
            console.error('Error decoding token:', error);
            return {} as DecodedToken; // Return an empty object if decoding fails
        }
    }

    private handleError(error: any) {
        const errorMessage = `An error occurred: ${error.message}`;
        return throwError(() => new Error(errorMessage)); // Updated to use the recommended approach
    }

    // public getCurrentUser(): Observable<User | null> {
    //     return this.currentUserSubject.asObservable();
    // }

    autoLogin(): void {
        const token = this.getToken();
        if (token) {
            const decodedToken = this.decodeToken(token);
            const user: User = {
                id: decodedToken['id'],
                username: decodedToken['username'],
            };
            this.currentUserSubject.next(user);
    
            // Immediately check if the session has expired
            if (!this.isLoggedIn()) {
                this.showSessionExpiredDialog();
            } else {
                // Start an interval to continuously check the session status
                this.tokenExpirationCheckInterval = setInterval(() => {
                    if (!this.isLoggedIn()) {
                        clearInterval(this.tokenExpirationCheckInterval); // Stop the interval
                        this.showSessionExpiredDialog();
                    }
                }, 5000); // Check every 5 seconds
            }
        }
    }

    private showSessionExpiredDialog(): void {
        const dialogRef = this.dialog.open(LogoutDialogComponent, {
          width: '250px',
          data: { message: 'Session expired. Please log in again.' }
        });
    
        dialogRef.afterClosed().subscribe(() => {
          console.log('Dialog closed');
          this.logout(true); // Ensure navigateToLogin is set to true to redirect to login
        });
    }

    checkSession(): void {
        if (!this.isLoggedIn()) {
          this.showSessionExpiredDialog();
        }
    }

    startTokenExpirationCheck(): Observable<any> {
        this.tokenExpirationCheckSource.next();
        return this.tokenExpirationCheckSource.asObservable();
      }
    
      stopTokenExpirationCheck() {
        this.tokenExpirationCheckSource.complete();
      }
    
      changePassword(username: string, oldPassword: string, newPassword: string): Observable<any> {
        const body = {
            username: username,
            oldPassword: oldPassword,
            newPassword: newPassword
        };
    
        console.log('Request Body:', body);
    
        return this.http.post<any>(`${this.apiUrl}/change-password`, body).pipe(
            catchError(err => {
                console.error('Error changing password:', err.message, err);
                return throwError(err);
            })
        );
    }
    
   
    getCurrentUserUsername(): Promise<string> {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            throw new Error('User ID is not available.');
        }
        return this.http.get<{ username: string }>(`http://localhost:3000/users/${userId}`, { responseType: 'json' })
            .toPromise()
            .then((user: { username: string } | undefined) => user?.username || '');
    }

    getCurrentUser(): Observable<User | null> {
        return this.currentUserSubject.asObservable();
      }
    
      updateUserProfilePicture(profilePictureUrl: string): void {
        // Replace '/api/update-profile-picture' with the actual endpoint you're using
        this.http.post('/api/update-profile-picture', { imageUrl: profilePictureUrl }).subscribe(
            response => {
                console.log('Profile picture updated successfully:', response);
                // Handle success, e.g., update local state or navigate
            },
            error => {
                console.error('Error updating profile picture:', error);
                // Handle error, e.g., show an error message
            }
        );
    }
      
}