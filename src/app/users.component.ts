import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UserService, UserQuery } from './user.service';
import { PaginatedDataSource } from './paginated-datasource';
import { Sort } from './page'
import { User } from './user';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: [`./users.component.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent  {
    displayedColumns = ['id', 'username', 'email', 'registration']
    initialSort: Sort<User> = {property: 'username', order: 'asc'}

    data = new PaginatedDataSource<User, UserQuery>(
      (request, query) => this.users.page(request, query),
      this.initialSort,
      {search: '', registration: undefined},
      2
    )

    constructor(private users: UserService) {

    }
}
