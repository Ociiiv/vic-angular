import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PostService } from '../posts.service';
import { Post } from '../post.model';
import { ModalService } from '../modal.service';
import { Router } from '@angular/router';

@Component({
 selector: 'app-post-edit',
 templateUrl: './post-edit.component.html',
 styleUrls: ['./post-edit.component.css']
})
export class PostEditComponent implements OnInit {
 @Output() postUpdated = new EventEmitter<Post>();
 @Input() post!: Post;
 isEditMode = false;
 isOpen = false;
 isUpdating = false;
 posts: Post[] = [];
 @Input() selectedPost!: Post;
 selectedFile: File | null = null;

 constructor(
    private modalService: ModalService,
    private postService: PostService,
    private router: Router
 ) {
    this.modalService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
 }

 ngOnInit(): void {
    this.postService.getAllPosts().subscribe(response => {
      if (Array.isArray(response)) {
        this.posts = response;
      } else {
        console.error('Expected an array of Post objects, but received:', response);
      }
    });
 }

 editPost(post: Post): void {
  this.selectedPost = post;
  this.openEditModal();
  // Navigate programmatically without changing the URL
  this.router.navigate([], { queryParams: { edit: post._id } });
}

 onUpdatePost() {
    if (this.post && this.post._id) {
      if (this.selectedFile) {
        // If a new file is selected, upload it and update the post with the new image URL
        this.postService.updatePostWithImage(this.post._id, this.post.title, this.post.content, this.selectedFile)
          .subscribe(updatedPost => {
            this.closeModal();
            this.refreshPosts();
            this.postUpdated.emit(updatedPost);
          }, error => {
            console.error('Error updating post:', error);
          });
      } else {
        // If no new file is selected, simply update the post without changing the image
        this.postService.updatePost(this.post._id, this.post.title, this.post.content, this.post.imageUrl)
          .subscribe(updatedPost => {
            this.closeModal();
            this.refreshPosts();
            this.postUpdated.emit(updatedPost);
          }, error => {
            console.error('Error updating post:', error);
          });
      }
    }
 }

 openEditModal() {
    this.modalService.open();
 }

 closeModal() {
    this.isOpen = false;
    this.modalService.close();
 }

 refreshPosts() {
  this.postService.getAllPosts().subscribe(response => {
    (response: Post[]) => {
      if (response) {
        this.posts = response; // Directly assign the response (which is an array of Post objects) to this.posts
      } else {
        console.error('Expected an array of Post objects, but received:', response);
      }
    }
  });
}

 updatePost(post: Post) {
    this.isUpdating = true;

    if (this.selectedFile) {
      // If a new file is selected, upload it and update the post with the new image URL
      this.postService.updatePostWithImage(post._id, post.title, post.content, this.selectedFile).subscribe(updatedPost => {
        if (Array.isArray(this.posts)) {
          const index = this.posts.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) {
            this.posts[index] = updatedPost;
          }
        } else {
          console.error('Expected this.posts to be an array, but it is:', this.posts);
        }

        this.postUpdated.emit(updatedPost);
        this.isUpdating = false;
        this.closeModal();
      }, error => {
        console.error('Update failed:', error);
        this.isUpdating = false;
        this.closeModal();
      });
    } else {
      // If no new file is selected, simply update the post without changing the image
      this.postService.updatePost(post._id, post.title, post.content, post.imageUrl).subscribe(updatedPost => {
        if (Array.isArray(this.posts)) {
          const index = this.posts.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) {
            this.posts[index] = updatedPost;
          }
        } else {
          console.error('Expected this.posts to be an array, but it is:', this.posts);
        }

        this.postUpdated.emit(updatedPost);
        this.isUpdating = false;
        this.closeModal();
      }, error => {
        console.error('Update failed:', error);
        this.isUpdating = false;
        this.closeModal();
      });
    }
 }

 onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
 }
}