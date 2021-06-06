import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Category } from '../config';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit,OnChanges {
  @Input()
  categories?: Category[] = [{
    id: 1,
    name: 'Windstorm'
  }];

  constructor() { 

  }

  ngOnInit(): void {
    console.log("------ngOnInit-----")
    console.log( this )
  }


  ngOnChanges():void{
    console.log("------ngOnChanges-----")
    console.log( this )
  }
}
