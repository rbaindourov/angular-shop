import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Config, ConfigService } from './config';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ ConfigService ],
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  config?: Config;
  error: any;

  constructor(private configService: ConfigService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(){
    this.configService.getConfig()
    .subscribe(
      (data: Config) => {
        console.log("--getConfig--")
        console.log(data)
        this.config = { ...data };
        this.cdr.markForCheck();
      }, 
      error => {
        this.error = error;
        this.cdr.markForCheck();
      }
    );
  }
  
  title = 'AStoreForBeauty.com';
}
