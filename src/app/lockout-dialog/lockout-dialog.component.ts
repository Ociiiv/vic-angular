import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-lockout-dialog',
  templateUrl: './lockout-dialog.component.html',
  styleUrls: ['./lockout-dialog.component.css'],
  template: `
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <p>Please wait for {{ countdown }} seconds before trying again.</p>
  `,
})
export class LockoutDialogComponent implements OnInit, OnDestroy {
  title: string;
  message: string;
  countdown: number = 10; 
  private intervalId: any;

  constructor(
    public dialogRef: MatDialogRef<LockoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }
  ) {
    this.title = data.title;
    this.message = data.message;
  }

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startCountdown() {
    this.intervalId = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.intervalId);
        this.dialogRef.close();
      }
    }, 1000);
  }
}