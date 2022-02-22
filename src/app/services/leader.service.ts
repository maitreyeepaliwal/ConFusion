import { Injectable } from '@angular/core';
import { Leader } from '../shared/leader';
import { LEADERS } from '../shared/leaders';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BaseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';



@Injectable({
  providedIn: 'root'
})
export class LeaderService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }


  getLeaders() : Observable<Leader[]>{
    return this.http.get<Leader[]>(BaseURL + 'leadership')
    .pipe(catchError(this.processHTTPMsgService.handleError));

    //return of(LEADERS).pipe(delay(2000));
    /*return new Promise(resolve=> {
      // Simulate server latency with 2 second delay
        setTimeout(() => resolve(LEADERS), 2000);
    }); */
  }

  getfeaturedleader() : Observable<Leader>{
    return this.http.get<Leader[]>(BaseURL + 'leadership?featured=true').pipe(map(leaders => leaders[0]))
    .pipe(catchError(this.processHTTPMsgService.handleError));

    
    //return of(LEADERS.filter((leader) => leader.featured)[0]).pipe(delay(2000));
    /* return new Promise(resolve=> {
      // Simulate server latency with 2 second delay
        setTimeout(() => resolve(LEADERS.filter((leader) => leader.featured)[0]), 2000);
    }); */
  }
}
