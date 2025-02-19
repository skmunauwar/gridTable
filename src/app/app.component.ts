import { Component, inject, OnInit } from '@angular/core';
import { ColumnDefinition, GridMatTableComponent } from './grid-mat-table/grid-mat-table.component';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ThemeService } from './theme-service';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  foundationYear: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', foundationYear: '12/15/1901'},
  {position: 15, name: 'Hydrogen', weight: 1.23, symbol: 'H1', foundationYear: '12/25/1901'},
  {position: 16, name: 'Hydrogen', weight: 1.24, symbol: 'H2', foundationYear: '12/17/1901'},
  {position: 17, name: 'Hydrogen', weight: 1.26, symbol: 'H3', foundationYear: '12/19/1901'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', foundationYear: '01/05/1911'},
  {position: 18, name: 'Helium', weight: 4.12, symbol: 'He1', foundationYear: '01/07/1911'},
  {position: 19, name: 'Helium', weight: 4.45, symbol: 'He2', foundationYear: '01/19/1911'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', foundationYear: '03/08/1921'},
  {position: 20, name: 'Lithium', weight: 6.951, symbol: 'Li1', foundationYear: '03/18/1921'},
  {position: 21, name: 'Lithium', weight: 6.987, symbol: 'Li2', foundationYear: '03/21/1921'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be', foundationYear: '08/09/1925'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B', foundationYear: '09/10/1930'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C', foundationYear: '10/11/1930'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', foundationYear: '11/12/1930'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', foundationYear: '12/13/1930'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F', foundationYear: '01/01/1931'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne', foundationYear: '02/05/1932'},
  {position: 11, name: 'Nilogen', weight: 20.1797, symbol: 'Nil', foundationYear: '03/08/1933'},
  {position: 12, name: 'Sodium', weight: 20.1797, symbol: 'Na', foundationYear: '04/09/1934'},
  {position: 13, name: 'NeSo', weight: 20.1797, symbol: 'Ns', foundationYear: '05/09/1935'},
  {position: 14, name: 'Neno', weight: 20.1797, symbol: 'Nc', foundationYear: '06/09/1936'},
];

const COLUMN_DEFINITION: ColumnDefinition[] = [
  {
    columnId: 'position',
    field: 'position',
    type: 'number',
    headerName: 'Position',
    columnPosition: 1,
    isSortable: true,
    isDraggable: true,
    isPinnable: {pinnedLeft: false, pinnedRight: false},
    displayFilter: true,
    filterValue: '',
    displayIcon: {
      icon: 'bolt',
      outlined: true,
      iconPosition: 'end',
      iconStyle: 'color: purple',
      iconTooltip: 'Home icon is being displayed here at the end.'
    }
  },
  {
    columnId: 'name',
    field: 'name',
    type: 'string',
    headerName: 'Name',
    columnPosition: 2,
    isSortable: true,
    isDraggable: true,
    isPinnable: {pinnedLeft: true, pinnedRight: false},
    displayFilter: true,
    filterValue: '',
    displayIcon: {
      icon: 'favorite',
      outlined: false,
      iconPosition: 'start',
      iconStyle: 'color: orange',
      iconTooltip: 'Info icon is being displayed here at the start.'
    },
    allowRowGrouping: true,
    // groupRows: true,
  },
  {
    columnId: 'weight',
    field: 'weight',
    type: 'string',
    headerName: 'Weight',
    columnPosition: 3,
    isSortable: true,
    isDraggable: true,
    isPinnable: {pinnedLeft: false, pinnedRight: true},
    displayFilter: true,
    filterValue: '',
  },
  {
    columnId: 'custom1',
    field: 'weight',
    type: '',
    headerName: 'Custom 1',
    columnPosition: 4,
    isSortable: true,
    isDraggable: true,
    isPinnable: {pinnedLeft: false, pinnedRight: false},
    displayFilter: true,
    filterValue: '',
    isComputed: true,
    computeFunction: (row: any) => row.weight * 2,
  },
  {
    columnId: 'custom2',
    field: 'weight',
    type: '',
    headerName: 'Custom 2',
    columnPosition: 5,
    isSortable: true,
    isDraggable: true,
    isPinnable: {pinnedLeft: false, pinnedRight: false},
    displayFilter: true,
    filterValue: '',
    isComputed: true,
    computeFunction: (row: any) => (row.weight * 3).toFixed(2) + ' kg',
  },
  {
    columnId: 'computed',
    field: '',
    type: '',
    headerName: 'Computed',
    columnPosition: 6,
    isSortable: true,
    isDraggable: true,
    isPinnable: {pinnedLeft: false, pinnedRight: false},
    displayFilter: true,
    filterValue: '',
    isComputed: true,
    computeFunction: (row: any) => row.weight.toFixed(2) + ' - ' + row.position.toString(),
  },
  {
    columnId: 'computed2',
    field: '',
    type: '',
    headerName: 'Computed 2',
    columnPosition: 14,
    isSortable: true,
    isDraggable: true,
    isPinnable: {pinnedLeft: false, pinnedRight: false},
    displayFilter: true,
    filterValue: '',
    isComputed: true,
    computeFunction: (row: any) => row.name + ' - 1',
    allowRowGrouping: true,
    // groupRows: true,
  },
  {
    columnId: 'date1',
    field: 'foundationYear',
    type: 'date',
    headerName: 'Date 1',
    columnPosition: 7,
    isSortable: true,
    isDraggable: true,
    isPinnable: {pinnedLeft: false, pinnedRight: false},
    displayFilter: true,
    filterValue: '',
    dateFormat: 'yyyy-MM-dd',
  },
  {
    columnId: 'date2',
    field: 'foundationYear',
    type: 'date',
    headerName: 'Date 2',
    columnPosition: 8,
    isSortable: true,
    isDraggable: true,
    isPinnable: {pinnedLeft: false, pinnedRight: false, disabledPinOpitons: true},
    displayFilter: true,
    filterValue: '',
  },
  {
    columnId: 'symbol',
    field: 'symbol',
    type: 'string',
    headerName: 'Symbol',
    columnPosition: 9,
    isSortable: false,
    isDraggable: false,
    displayFilter: false,
    filterValue: '',
  },
];

type colorScheme = 'light' | 'dark' | 'system' | '';

@Component({
  selector: 'app-root',
  imports: [GridMatTableComponent, MatButtonModule, TitleCasePipe, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  
  title = 'MyCompLibrary';

  selectedTheme: colorScheme = '';

  tableData = ELEMENT_DATA;
  columnDefinition = COLUMN_DEFINITION;
  // columnDefinition2 = [...COLUMN_DEFINITION];

  ngOnInit(): void {
    this.selectedTheme = document.body.style.colorScheme as colorScheme;
    if(this.selectedTheme === '') {
      this.selectedTheme = 'system';
    }
    // delete this.columnDefinition2[1].groupRows;
  }

  changeTheme() {
    if (this.selectedTheme === '' || this.selectedTheme === 'system') {
      this.selectedTheme = 'light';
      document.body.style.colorScheme = this.selectedTheme;
    } else if (this.selectedTheme === 'light') {
      this.selectedTheme = 'dark';
      document.body.style.colorScheme = this.selectedTheme;
    } else {
      this.selectedTheme = 'system';
      document.body.style.colorScheme = '';
    }
  }

  themeService = inject(ThemeService);
    
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
