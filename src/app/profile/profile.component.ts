import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../post/auth.service';
import { User } from '../user.model';
import { HttpClient } from '@angular/common/http';
import { UploadResponse } from 'backend/models/upload-response.interface'; 
import { Post } from '../post/post.model';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('filePicker') filePicker!: ElementRef<HTMLInputElement>;
  currentUser?: User | null;
  profilePictureUrl?: string;
  showOverlay = false;
  showFilePicker = false; 
  posts: Post[] = [];

  constructor(private authService: AuthService, private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.fetchUserPosts(); // Refresh the posts 
    });

    // Get the current user and fetch their posts
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.fetchUserPosts(); 
    });
  }

  fetchUserPosts() {
    this.http.get<Post[]>('/api/posts').pipe(
      map(posts => posts.filter(post => post._id === this.currentUser?.id))
    ).subscribe({
      next: (filteredPosts) => {
        this.posts = filteredPosts;
      },
      error: (error) => {
        console.error('Error fetching user posts:', error);
      }
    });
  }

  toggleOverlay(show: boolean) {
    this.showOverlay = show;
    if (show) {
      setTimeout(() => this.filePicker.nativeElement.click(), 0); 
    }
  }

  uploadProfilePicture(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    this.http.post('/upload-profile-picture', formData).subscribe({
      next: (response: any) => {
        const typedResponse = response as UploadResponse;
        if (this.currentUser) {
          this.profilePictureUrl = typedResponse.newImageUrl;
          const imgElement = document.querySelector('#profile-pic img');
          if (imgElement) {
            imgElement.setAttribute('src', this.profilePictureUrl);
          }
        }
      },
      error: (error: any) => {
        console.error('Error uploading profile picture:', error);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result!== null) {
        // Assuming reader.result is a DataURI, no further conversion needed
        this.profilePictureUrl = reader.result.toString();
      } else {
        // Handle the case when reader.result is null, e.g., assign a default URL or log a message
        console.log("Failed to read file");
        // Optionally, set profilePictureUrl to a default value
        // this.profilePictureUrl = "default-image-url";
      }
      if (this.profilePictureUrl!== undefined) {
        this.authService.updateUserProfilePicture(this.profilePictureUrl);
      } else {
        console.error('Profile picture URL is undefined.');
      }
    };
    reader.readAsDataURL(file);
  }

  openFilePicker() {
    if (this.filePicker && this.filePicker.nativeElement) {
      this.filePicker.nativeElement.click();
    }
  }
}