import { DataSource } from "@angular/cdk/collections";
import { Observable, Subject, BehaviorSubject, combineLatest } from "rxjs";
import { switchMap, startWith, pluck, share } from "rxjs/operators";
import { indicate } from "./operators";
import { Page, Sort, PageRequest, PaginatedEndpoint } from "./page";

export interface SimpleDataSource<T> extends DataSource<T> {
  connect(): Observable<T[]>;
  disconnect(): void;
}

export interface PaginatedDataSource<T, Q> extends SimpleDataSource<T> {
  sortBy: (s: Sort<T>) => void;
  queryBy: (q: Partial<Q>) => void;
  fetch: (p: number) => void;
  page$: Observable<Page<T>>
  loading$: Observable<boolean>;
}

export function paginatedDataSource<T, Q>(
  endpoint: PaginatedEndpoint<T, Q>,
  initialSort: Sort<T>,
  initialQuery: Q,
  pageSize = 20
): PaginatedDataSource<T, Q> {
  const pageNumber = new Subject<number>();
  const loading = new Subject<boolean>();

  const sort = new BehaviorSubject<Sort<T>>(initialSort);
  const query = new BehaviorSubject<Q>(initialQuery);
  const param$ = combineLatest([query, sort]);
  const page$ = param$.pipe(
    switchMap(([query, sort]) => pageNumber.pipe(
        startWith(0),
        switchMap(page => endpoint({ page, sort, size: pageSize }, query)     .pipe(indicate(loading))
        )
      )
    ),
    share()
  );
  const queryBy = (q: Partial<Q>) => {
    const lastQuery = query.getValue();
    const nextQuery = { ...lastQuery, ...q };
    query.next(nextQuery);
  };
  const fetch = (p: number) => pageNumber.next(p);
  const sortBy = (s: Sort<T>) => sort.next(s);
  return {
    sortBy,
    queryBy,
    fetch,
    page$,
    connect: () => page$.pipe(pluck("content")),
    disconnect: () => undefined,
    loading$: loading.asObservable(),
  };
}
