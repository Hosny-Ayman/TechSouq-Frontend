import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { IUserData } from '../../../core/Interfaces/IUser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user!: IUserData;

  constructor(private _user: UserService) {}

  ngOnInit(): void {
    this.user = this._user.loadCurrentUser();
  }
}
