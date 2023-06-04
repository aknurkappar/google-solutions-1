import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {AccountComponent} from "./account/account.component";
import {DonationsComponent} from "./donations/donations.component";
import {NotificationsComponent} from "./notifications/notifications.component";
import {FavoritesComponent} from "./favorites/favorites.component";
import {AdminSpecialUsersComponent} from "./admin-special-users/admin-special-users.component";
import {AdminPostsComponent} from "./admin-posts/admin-posts.component";
import {AdminComponent} from "./admin/admin.component";
import {AdminDonationsComponent} from "./admin-donations/admin-donations.component";
import {PostDetailsComponent} from "./post-details/post-details.component";
import {AddPostComponent} from "./add-post/add-post.component";
import {AddPostFirstStepComponent} from "./add-post-first-step/add-post-first-step.component";
import {AddPostSecondStepComponent} from "./add-post-second-step/add-post-second-step.component";
import {BuyAndDonateComponent} from "./buy-and-donate/buy-and-donate.component";
import {AdminBuyAndDonateComponent} from "./admin-buy-and-donate/admin-buy-and-donate.component";
import {SignInComponent} from "./sign-in/sign-in.component";
import {SignUpComponent} from "./sign-up/sign-up.component";
import {ChatComponent} from "./chat/chat.component";

const addPostRoutes : Routes = [
    { path : 'add-post', component : AddPostComponent, children : [
            {path : "" , component : AddPostFirstStepComponent},
            {path : "1", component : AddPostFirstStepComponent},
            {path : "2", component : AddPostSecondStepComponent},
    ]}
]

const authorizationRoutes : Routes = [
    { path : 'sign-in', component : SignInComponent},
    { path : 'sign-up', component : SignUpComponent}
]

const routes: Routes = [
  { path: 'home', component: HomeComponent, children : [...addPostRoutes, ...authorizationRoutes]},
  { path: 'account', component: AccountComponent, children : addPostRoutes },
  { path: 'donations', component: DonationsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: "admin", component : AdminComponent, children : [
      { path: "posts-admin", component : AdminPostsComponent },
      { path: "donations-admin", component : AdminDonationsComponent },
      { path: "special-users", component : AdminSpecialUsersComponent },
      { path: 'buy-and-donate-admin', component: AdminBuyAndDonateComponent},
      { path: '', redirectTo: 'posts-admin', pathMatch: 'full' }
  ]},
  { path: 'favorites/:id', component: PostDetailsComponent },
  { path: 'postdetails/:id', component: PostDetailsComponent },
  { path: 'buy-and-donate/:id', component: PostDetailsComponent },
  { path: 'buy-and-donate', component: BuyAndDonateComponent },
  { path: 'chat', component: ChatComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
