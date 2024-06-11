import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../post/auth.service';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.css']
})
export class LogoutDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LogoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    public authService: AuthService,
    private router: Router // Inject Router
  ) {}

  onOkClick(): void {
    console.log('OK clicked');
    this.dialogRef.close();
    this.dialogRef.afterClosed().subscribe(() => {
      this.authService.logout();
      this.router.navigate(['/login']); // Navigate to the login page
    });
  }
}