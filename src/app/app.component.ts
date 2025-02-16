import { Component } from '@angular/core';
import { ColumnDefinition, GridMatTableComponent } from './grid-mat-table/grid-mat-table.component';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  foundationYear: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', foundationYear: '12/15/1901'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', foundationYear: '01/05/1911'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', foundationYear: '03/08/1921'},
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
      icon: 'home',
      outlined: true,
      iconPosition: 'end',
      iconStyle: 'color: green',
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
      icon: 'info',
      outlined: false,
      iconPosition: 'start',
      iconStyle: 'color: red',
      iconTooltip: 'Info icon is being displayed here at the start.'
    }
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
    computeFunction: (row: any) => (row.weight * 3).toString() + ' kg',
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
    computeFunction: (row: any) => row.weight.toString() + ' - ' + row.position.toString(),
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
    isPinnable: {pinnedLeft: false, pinnedRight: false},
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
    isPinnable: {pinnedLeft: false, pinnedRight: false},
    displayFilter: false,
    filterValue: '',
  },
];

@Component({
  selector: 'app-root',
  imports: [GridMatTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'MyCompLibrary';

  tableData = ELEMENT_DATA;
  columnDefinition = COLUMN_DEFINITION;
}
