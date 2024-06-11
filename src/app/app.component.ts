import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from './post/post.model'; 
import { AuthService } from './post/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(public authService: AuthService, private router: Router) {}
  selectedPost: Post = { _id: '', title: '', content: '', imageUrl: '' };
  yourPostVariable: Post = { _id: '', title: '', content: '', imageUrl: '' };
  posts: Post[] = [];
  title: String = 'Baloloy-final-project';

  ngOnInit() {
    this.authService.startTokenExpirationCheck().subscribe(() => {
      // Perform token expiration check
    });
  }
  

  onPostAdded(post: Post) {
    this.posts.push(post);
  }

  ngOnDestroy() {
  this.authService.stopTokenExpirationCheck();
}

}