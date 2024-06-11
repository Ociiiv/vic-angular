// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { PostCreateComponent } from './post/post-create/post-create.component';
import { HeaderComponent } from './header/header.component';
import { PostEditComponent } from './post/post-edit/post-edit.component'; // Ensure this import is correct
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { StoryComponent } from './story/story.component';
import { StoryCreateModalComponent } from './story-create-modal/story-create-modal.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
    { path: '', component: LoginComponent }, // Default route
    { path: 'posts', component: PostListComponent, canActivate: [AuthGuard] }, // Protected route
    { path: 'create', component: PostCreateComponent }, // Protected route
    { path: 'header', component: HeaderComponent, canActivate: [AuthGuard] }, // Protected route
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    // { path: 'edit/:id', component: PostEditComponent }, // Edit route without AuthGuard
    { path: 'change-password', component: ChangePasswordComponent },
    { path: 'story', component: StoryComponent, canActivate: [AuthGuard] },
    { path: 'story-create-modal', component: StoryCreateModalComponent },
    { path: 'profile', component: ProfileComponent },

    // { path: '**', component: PageNotFoundComponent },
    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }