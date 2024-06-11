import { Component, OnInit, OnDestroy, EventEmitter, Output } from "@angular/core";
import { Post } from "../post.model";
import { Subscription } from "rxjs";
import { PostService } from "../posts.service";
import { ModalService } from "../modal.service";
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { User } from 'src/app/user.model'; 
import { Story } from "src/app/story.model";
import { map } from 'rxjs/operators';


@Component({
    selector: 'app-post-list',
    templateUrl: "./post-list.component.html",
    styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
    posts: Post[] = [];
    private postsSub!: Subscription;
    selectedPost: Post | null = null;
    currentPost: Post | null = null;
    isEditMode = false;
    isOpen = false;
    currentPage: number;
    postsPerPage: number;
    totalPages: number = 0;
    currentUser: User | null = null; // Define currentUser property
    errorMessage: string | null = null; // Add this line for error handling
    stories: Story[] = [];


    @Output() postUpdated = new EventEmitter<Post>(); // Declare the EventEmitter

    constructor(
        public postService: PostService,
        private modalService: ModalService,
        private router: Router,
        private authService: AuthService,
        private http: HttpClient
    ) {
        // Initialize currentPage and postsPerPage from the PostService
        this.currentPage = this.postService.getCurrentPage();
        this.postsPerPage = this.postService.getPostsPerPage();
    }

    ngOnInit(): void {
        this.postService.getPosts().subscribe({
            next: (data: { message: string; posts: Post[] }) => {
                this.posts = data.posts;
                this.totalPages = Math.ceil(this.posts.length / this.postsPerPage);
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error fetching posts:', error);
            }
        });
    
        // Fetch stories
        this.http.get('/api/stories', { responseType: 'json' })
        .pipe(map(response => response as Story[]))
        .subscribe(stories => {
           this.stories = stories;
         });
       
        }    

    ngOnDestroy(): void {
        if (this.postsSub) {
            this.postsSub.unsubscribe();
        }
    }

    getPostsForCurrentPage() {
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        return this.posts.slice(startIndex, endIndex);
    }

    nextPage(event: Event) {
        event.preventDefault(); // Prevent the default action of the click event
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.navigateToPage(this.currentPage);
        }
    }
    
    previousPage(event: Event) {
        event.preventDefault(); // Prevent the default action of the click event
        if (this.currentPage > 1) {
            this.currentPage--;
            this.navigateToPage(this.currentPage);
        }
    }

    setCurrentPage(page: number, event: Event) {
        event.preventDefault(); // Prevent the default action of the click event
        this.currentPage = page; // Update the current page
        this.navigateToPage(this.currentPage); // Navigate to the selected page
    }

    navigateToPage(page: number) {
        this.router.navigate(['/posts'], { queryParams: { page: page } });
    }

    deletePost(_id: string) {
        this.postService.deletePost(_id).subscribe({
            next: (response) => {
                console.log('Post deleted successfully:', response.message);
                // Remove the post from the local array
                this.posts = this.posts.filter(post => post._id !== _id);
                // Recalculate total pages
                this.totalPages = Math.ceil(this.posts.length / this.postsPerPage);
                // Adjust current page if it's now beyond the total pages
                if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages;
                }
            },
            error: (error) => {
                console.error('Error deleting post:', error);
            }
        });
    }

    editPost(post: Post) {
        this.currentPost = post; // Set the current post to be edited
        this.isEditMode = true; // Enter edit mode
        this.openEditModal(); // Open the modal for editing
    }

    onPostUpdated(updatedPost: Post): void {
        const postIndex = this.posts.findIndex(post => post._id === updatedPost._id);
        if (postIndex >= 0) {
            this.posts[postIndex] = updatedPost;
        }
    }

    openEditModal() {
        this.modalService.open();
    }

    onUpdatePost(): void {
        console.log('onUpdatePost called'); 
        if (this.currentPost && this.currentPost._id) {
            this.postService.updatePost(this.currentPost._id, this.currentPost.title, this.currentPost.content, this.currentPost.imageUrl).subscribe(updatedPost => {
                console.log('Post updated successfully', updatedPost);
                // Update the local posts array with the updated post
                const postIndex = this.posts.findIndex(post => post._id === updatedPost._id);
                if (postIndex >= 0) {
                    this.posts[postIndex] = updatedPost;
                }
                // Exit edit mode
                this.isEditMode = false;
                // Emit the post update event if needed
                this.postUpdated.emit(updatedPost); // Corrected line
                // Close the modal
                this.closeModal();
                // Navigate back to the post list page
                this.navigateToPage(this.currentPage);
            }, error => {
                console.error('Error updating post', error);
            });
        }
    }

    closeModal() {
        this.isOpen = false;
        this.isEditMode = false; // Reset edit mode
        this.currentPost = null; // Reset the post being edited
        this.navigateToPage(this.currentPage);
    }

    calculateTotalPages(): void {
        this.totalPages = Math.ceil(this.posts.length / this.postsPerPage);
    }
}
