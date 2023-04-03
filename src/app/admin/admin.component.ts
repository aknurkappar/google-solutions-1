import { Component } from '@angular/core';
import {AdminPostsComponent} from "../admin-posts/admin-posts.component";
import {AdminDonationsComponent} from "../admin-donations/admin-donations.component";
import {AdminSpecialUsersComponent} from "../admin-special-users/admin-special-users.component";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  selectMenu(e : any) {
    for(let element of e.composedPath()[1].children) {
      element.classList.remove("admin-menu-selected");
    }
    e.composedPath()[0].classList.add("admin-menu-selected");
  }

}
