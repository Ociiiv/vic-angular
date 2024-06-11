import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../user.model'; // Import User model
// const jwtDecode = require('jwt-decode');
import jwtDecode from 'jwt-decode';

// Define a custom interface for the decoded token
interface DecodedToken {
    id: string; // This should match the 'id' field in your JWT payload
    username: string;
    exp: number;
    // Add other properties if needed
}


@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/api/User'; 


    constructor(private http: HttpClient) { }
   
    getUsers(): Observable<any> {
       return this.http.get<any>(this.apiUrl);
    }

   // Method to get the current user's ID
getCurrentUserId(): string {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error('No token found');
        return ''; // Return an empty string or handle the error as appropriate
    }
    try {
        const decodedToken = this.decodeToken(token);
        console.log('Decoded token:', decodedToken); // Log the decoded token for debugging
        return decodedToken.id; // Use the 'id' field from the decoded token
    } catch (error) {
        console.error('Error decoding token:', error);
        return ''; // Return an empty string or handle the error as appropriate
    }
}
    
private decodeToken(token: string): DecodedToken {
    return jwtDecode(token) as DecodedToken;
}
}