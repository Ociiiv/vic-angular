import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PostCreateComponent } from './post/post-create/post-create.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { HeaderComponent } from './header/header.component';
import { PostEditComponent } from './post/post-edit/post-edit.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // Import HTTP_INTERCEPTORS
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UnauthenticatedComponent } from './unauthenticated/unauthenticated.component';
import { AuthService } from './post/auth.service';
import { UserService } from './post/user.service'; // Adjust the import path as necessary
import { AuthInterceptor } from './auth/auth.interceptor';
import { APP_INITIALIZER } from '@angular/core';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LogoutDialogComponent } from './logout-dialog/logout-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LockoutDialogComponent } from './lockout-dialog/lockout-dialog.component';
import { ChangePasswordComponent } from './change-password/change-password.component'; // Import MatTooltipModule
import { SearchService } from './search.service';
import { StoryCreateModalComponent } from './story-create-modal/story-create-modal.component';
import { StoryComponent } from './story/story.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationComponent } from './notification/notification.component';

@NgModule({
  declarations: [
    AppComponent,
    PostCreateComponent,
    PostListComponent,
    HeaderComponent,
    PostEditComponent,
    AuthComponent,
    LoginComponent,
    RegisterComponent,
    UnauthenticatedComponent,
    PageNotFoundComponent,
    LogoutDialogComponent,
    LockoutDialogComponent,
    ChangePasswordComponent,
    StoryCreateModalComponent,
    StoryComponent,
    ProfileComponent,
    NotificationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatExpansionModule,
    HttpClientModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule // Add MatTooltipModule to the imports array
  ],
  providers: [
    AuthService,
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.autoLogin(),
      deps: [AuthService],
      multi: true
    },
    SearchService,
    UserService,
    // Add AuthInterceptor to the list of providers
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}