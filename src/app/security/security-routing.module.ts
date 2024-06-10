/**
 * Title: security-routing.module.ts
 * Author: Professor Krasso
 * Editor: Cody Skelton
 * Date Modified: 06.05.2024
 */

// imports statements
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityComponent } from './security.component';
import { SigninComponent } from './signin/signin.component';

const routes: Routes = [
  {
    path: '',
    component: SecurityComponent,
    title: 'Nodebucket: Security',
    children: [
      {
        path: 'signin',
        component: SigninComponent,
        title: 'Nodebucket: Signin'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
