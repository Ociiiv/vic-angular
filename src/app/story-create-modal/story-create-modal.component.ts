import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-story-create-modal',
  templateUrl: './story-create-modal.component.html',
  styleUrls: ['./story-create-modal.component.css']
})
export class StoryCreateModalComponent {
  newImageUrl: string = '';

  constructor(private http: HttpClient, public dialogRef: MatDialogRef<StoryCreateModalComponent>, public snackBar: MatSnackBar) {}

  addStory(): void {
    if (!this.newImageUrl) {
      this.snackBar.open("Please enter an image URL", "OK", {
        duration: 3000
      });
      return;
    }

    // Assuming you have a backend endpoint to save stories, make an API call here
    this.http.post('/api/stories', { imageUrl: this.newImageUrl }).subscribe(response => {
      console.log('Story added successfully', response);
      this.dialogRef.close();
    }, error => {
      console.error('Error adding story', error);
      this.snackBar.open("Error adding story", "OK", {
        duration: 3000
      });
    });
  }
}