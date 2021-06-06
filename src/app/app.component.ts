import { Component, OnInit } from '@angular/core';
import { Config, ConfigService } from './config';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ ConfigService ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  config?: Config;
  error: any;

  constructor(private configService: ConfigService) {
  }

  ngOnInit(){
    this.configService.getConfig()
    .subscribe(
      (data: Config) => {
        console.log("--getConfig--")
        console.log(data)
        this.config = { ...data }
      }, 
      error => this.error = error // error path
    );
  }
  
  title = 'AStoreForBeauty.com';
}
