import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './post/auth.service';

@Injectable({
 providedIn: 'root'
})
export class AuthGuard implements CanActivate {

 constructor(private authService: AuthService, private router: Router) {}

// In your AuthGuard
canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  if (this.authService.isLoggedIn()) {
    return true;
  } else {
    // Redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}
}