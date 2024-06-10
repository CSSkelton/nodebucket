/**
 * Title: nav.component.ts
 * Author: Professor Krasso
 * Editor: Cody Skelton
 * Date: 06.09.2024
 */

// imports statements
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export interface AppUser {
  fullName: string;
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  appUser: AppUser;
  isSignedIn: boolean;

  constructor(private cookieService: CookieService, private router: Router) {

    this.isSignedIn = this.cookieService.get('session_user') ? true:false;
    this.appUser = {} as AppUser;

    if (this.isSignedIn) {


      this.appUser = {
        fullName: this.cookieService.get('session_user')
      }
      console.log('Signed in as', this.appUser);
    }
  }

  signout() {
    console.log('Removing session user from the cookie');
    this.cookieService.deleteAll();
    window.location.href = '/';
  }
}
