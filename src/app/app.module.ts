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
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {SignInComponent} from "./sign-in/sign-in.component";
import {SignUpComponent} from "./sign-up/sign-up.component";
import { AddPostComponent } from './add-post/add-post.component';
import { AddPostSecondStepComponent } from './add-post-second-step/add-post-second-step.component';
import {AddPostFirstStepComponent} from "./add-post-first-step/add-post-first-step.component";
import { BuyAndDonateComponent } from './buy-and-donate/buy-and-donate.component';
import { AdminBuyAndDonateComponent } from './admin-buy-and-donate/admin-buy-and-donate.component';
import { PayButtonComponent } from './pay-button/pay-button.component';
import {GooglePayButtonModule} from "@google-pay/button-angular";
import {AgmCoreModule} from "@agm/core";
import { ChatComponent } from './chat/chat.component';


@NgModule({
    declarations: [
        AppComponent,
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
        SignInComponent,
        SignUpComponent,
        BuyAndDonateComponent,
        AdminBuyAndDonateComponent,
        PayButtonComponent,
        ChatComponent,
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
        FormsModule,
        GooglePayButtonModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyCvyJd83113PsK1sK98o8-I-JjrYKotLPU',
            libraries: ['places']
        }),
        ReactiveFormsModule,

    ],
  providers: [
    ScreenTrackingService,UserTrackingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
