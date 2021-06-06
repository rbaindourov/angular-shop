import { Component } from '@angular/core';
import { Config, ConfigService } from './config';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ ConfigService ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  config: Config | undefined;
  error: any;

  constructor(private configService: ConfigService) {
    this.configService.getConfig()
      .subscribe(
        (data: Config) => this.config = { ...data }, // success path
        error => this.error = error // error path
      );
  }
  title = 'AStoreForBeauty.com';
}
