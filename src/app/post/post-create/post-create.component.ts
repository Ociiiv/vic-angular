import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostService } from '../posts.service';
import { Post } from '../post.model';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
    enteredTitle = '';
    enteredContent = '';
    enteredImageUrl = ''; // To store the image URL from the input
    uploadedImageUrl: string = ''; // Initialize with an empty string
    @Output() postCreated = new EventEmitter<Post>();

    constructor(private postService: PostService, private router: Router, private authService: AuthService, private http: HttpClient) {} // Inject AuthService

    ngOnInit(): void {
        // Implementation of ngOnInit()
    }

    onAddPost(form: NgForm) {
        if (form.invalid) {
            return;
        }
        this.authService.getCurrentUser().subscribe(user => {
            if (user) {
                const userId = user.id; // Assuming id is the property representing user ID
                const imageUrl = form.value.imageUrl || this.uploadedImageUrl;
                const post: Post = {
                    _id: '', // Let the backend generate the ID
                    title: form.value.title,
                    content: form.value.content,
                    imageUrl: imageUrl
                };

                // Modify the addPost method in PostService to include authentication
                this.postService.addPost(post._id, post.title, post.content, post.imageUrl).subscribe(

                    response => {
                        // Handle success
                        console.log('Post added successfully:', response);
                        form.resetForm();
                        this.uploadedImageUrl = '';
                        // Navigate back to the post list upon successful creation
                        this.router.navigate(['/posts']).catch(error => console.error('Navigation error:', error));
                    },
                    error => {
                        console.error('Error adding post:', error);
                        // Log the error response for debugging
                        console.error('Error response:', error.error);
                    }
                );
            } else {
                console.error('User not found');
            }
        });
     }

    // Assuming you have a method in PostService to add a post that includes authentication
    // If not, you'll need to implement it there

    generateOrRetrieveId(): string {
        // Example: Generate a simple ID based on the current timestamp
        return Date.now().toString();
    }

    isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            if (file) {
                // Here you would typically upload the file to a server and get a URL
                // For demonstration, we'll just read the file as a Data URL
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    // Assuming you want to set the uploadedImageUrl to the Data URL
                    this.uploadedImageUrl = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }
    }
}
