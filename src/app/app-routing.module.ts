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
import {AddPostComponent} from "./add-post/add-post.component";
import {AddPostFirstStepComponent} from "./add-post-first-step/add-post-first-step.component";
import {AddPostSecondStepComponent} from "./add-post-second-step/add-post-second-step.component";

const addPostRoutes : Routes = [
    {path : 'add-post', component : AddPostComponent, children : [
            {path : "" , component : AddPostFirstStepComponent},
            {path : "1", component : AddPostFirstStepComponent},
            {path : "2", component : AddPostSecondStepComponent},
        ]},
]

const routes: Routes = [
  { path: 'registration', component: RegistrationComponent },
  { path: 'home', component: HomeComponent, children : addPostRoutes},
  { path: 'account', component: AccountComponent, children : addPostRoutes},
  { path: 'donations', component: DonationsComponent},
  { path: 'notifications', component: NotificationsComponent},
  { path: 'favorites', component: FavoritesComponent},
  { path : "admin", component : AdminComponent, children : [
      { path: '', redirectTo: 'postsadmin', pathMatch: 'full'},
      { path : "postsadmin", component : AdminPostsComponent},
      { path : "donationsadmin", component : AdminDonationsComponent},
      { path : "specialusers", component : AdminSpecialUsersComponent}
    ]},
  { path : 'favorites/:id', component: PostDetailsComponent},
  { path : 'postdetails/:id', component: PostDetailsComponent},
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
