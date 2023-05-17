import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAnalytics,getAnalytics,ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideMessaging,getMessaging } from '@angular/fire/messaging';
import { provideStorage,getStorage } from '@angular/fire/storage';
import { RegistrationComponent } from './registration/registration.component';
import { FormsModule } from "@angular/forms";
import { HomeComponent } from './home/home.component';
import { CarouselComponent } from './carousel/carousel.component';
import { AccountComponent } from './account/account.component';
import { DonationsComponent } from './donations/donations.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { AdminComponent } from './admin/admin.component';
import { AdminPostsComponent } from './admin-posts/admin-posts.component';
import { AdminSpecialUsersComponent } from './admin-special-users/admin-special-users.component';
import { AdminDonationsComponent } from './admin-donations/admin-donations.component';
import { PostDetailsComponent } from './post-details/post-details.component';
import { AddPostComponent } from './add-post/add-post.component';
import { AddPostSecondStepComponent } from './add-post-second-step/add-post-second-step.component';
import {AddPostFirstStepComponent} from "./add-post-first-step/add-post-first-step.component";



@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    HomeComponent,
    CarouselComponent,
    AccountComponent,
    DonationsComponent,
    NotificationsComponent,
    FavoritesComponent,
    AdminComponent,
    AdminPostsComponent,
    AdminSpecialUsersComponent,
    AdminDonationsComponent,
    PostDetailsComponent,
    AddPostComponent,
    AddPostFirstStepComponent,
    AddPostSecondStepComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAnalytics(() => getAnalytics()),
        provideAuth(() => getAuth()),
        provideDatabase(() => getDatabase()),
        provideFirestore(() => getFirestore()),
        provideMessaging(() => getMessaging()),
        provideStorage(() => getStorage()),
        FormsModule
    ],
  providers: [
    ScreenTrackingService,UserTrackingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
