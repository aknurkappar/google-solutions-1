import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegistrationComponent } from "./registration/registration.component";
import {AccountComponent} from "./account/account.component";
import {DonationsComponent} from "./donations/donations.component";
import {NotificationsComponent} from "./notifications/notifications.component";
import {FavoritesComponent} from "./favorites/favorites.component";
import {AdminSpecialUsersComponent} from "./admin-special-users/admin-special-users.component";
import {AdminPostsComponent} from "./admin-posts/admin-posts.component";
import {AdminComponent} from "./admin/admin.component";
import {AdminDonationsComponent} from "./admin-donations/admin-donations.component";
import {PostDetailsComponent} from "./post-details/post-details.component";

const routes: Routes = [
  { path: 'registration', component: RegistrationComponent },
  { path: 'home', component: HomeComponent },
  { path: 'account', component: AccountComponent},
  { path: 'donations', component: DonationsComponent},
  { path: 'notifications', component: NotificationsComponent},
  { path: 'favorites', component: FavoritesComponent},
  { path : "admin", component : AdminComponent, children : [
      { path: '', redirectTo: 'postsadmin', pathMatch: 'full'},
      { path : "postsadmin", component : AdminPostsComponent},
      { path : "donationsadmin", component : AdminDonationsComponent},
      { path : "specialusers", component : AdminSpecialUsersComponent}
    ]},
  { path : "donations", component : AdminDonationsComponent},
  { path : "special-users", component : AdminSpecialUsersComponent},
  { path : 'favorites/:id', component: PostDetailsComponent},
  { path : 'postdetails/:id', component: PostDetailsComponent},
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
