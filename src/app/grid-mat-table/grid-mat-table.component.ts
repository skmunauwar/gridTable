import { AfterViewInit, Component, Input, signal, ViewChild, WritableSignal } from '@angular/core';
import { CdkDrag, CdkDragHandle, DragDropModule, CdkDropList, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { animate, state, style, transition, trigger } from '@angular/animations';

/** Column definition. */
export interface ColumnDefinition {
  columnId: string; // To identify the column using this unique id.
  field: string; // To display value uding this field attribute name from the data object.
  type: 'string' | 'number' | 'boolean' | 'date' | ''; // To indicate the type of the column.
  headerName: string;
  columnPosition: number;
  displayFilter: boolean;
  filterValue?: string;
  isDraggable?: boolean;
  isSortable?: boolean;
  isPinnable?: { pinnedLeft?: boolean; pinnedRight?: boolean; disabledPinOpitons?: boolean; };
  isComputed?: boolean;
  computeFunction?: (row: any) => string | number | boolean | any;
  displayIcon?: { // To display icon in the column.
    icon: string;
    outlined: boolean;
    iconPosition: 'start' | 'end';
    iconStyle?: string;
    iconTooltip?: string;
  }
  dateFormat?: string;
  groupRows?: boolean;
  allowRowGrouping?: boolean;
}

@Component({
  selector: 'app-grid-mat-table',
  imports: [
    CdkDrag, CdkDragHandle, CdkDropList, DragDropModule, MatTableModule, MatTooltipModule, DatePipe,
    MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule, MatInputModule, MatPaginatorModule,
    MatMenuModule, NgIf, MatDividerModule, NgTemplateOutlet,
  ],
  templateUrl: './grid-mat-table.component.html',
  styleUrl: './grid-mat-table.component.scss',
  standalone: true,
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class GridMatTableComponent implements AfterViewInit {
  readonly datePipe = new DatePipe('en-US')
  protected readonly defaultDateFormat = 'MM/dd/yyyy';
  protected displayedColumns: WritableSignal<string[]> = signal([]);
  protected displayedColumnsWithExpand: WritableSignal<string[]> = signal(['expand']);
  protected tableDataSource = signal(new MatTableDataSource());
  protected activeSort: WritableSignal<Sort> = signal({ active: '', direction: '' });
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private inputData: WritableSignal<any[]> = signal([]);
  protected inputColumnDefinitions: WritableSignal<ColumnDefinition[]> = signal([]);
  private filteredData: any[] = [];
  protected showFilterInputBar = false;
  protected rowGroupedData: WritableSignal<any[]> = signal([]);
  protected enableRowGrouping = signal(false);
  protected expandedElement: any;
  protected groupedColumn?: ColumnDefinition;
  protected childTableData: {[id: string]: any[]} = {};

  ngAfterViewInit() {
    this.tableDataSource().paginator = this.paginator;
  }

  // Accepts input data to display on the table.
  @Input() set data(data: any[]) {
    this.inputData.set(data);
    this.filteredData = data;
    this.generateRowGroupedData(this.inputData());
    if(this.enableRowGrouping()) {
      this.tableDataSource().data = this.rowGroupedData();
      this.tableDataSource.set(new MatTableDataSource(this.rowGroupedData()));
    } else {
      this.tableDataSource().data = this.inputData();
      this.tableDataSource.set(new MatTableDataSource(this.inputData()));
    }
    this.tableDataSource().paginator = this.paginator;
  }
  // Input parameter for paginator options for select dropdown.
  @Input() paginatorOptions: WritableSignal<number[]> = signal([10, 50, 100, 500, 1000]);

  // Input parameter for column definitions.
  @Input() set columnDefinitions(input: ColumnDefinition[]) {
    this.inputColumnDefinitions.set(input);
    this.setDisplayedColumns();
  }

  protected setRowGroupingOnSelectedColumn() {
    this.data = this.inputData();
    this.setDisplayedColumns();
  }

  // Set displayed column list.
  protected setDisplayedColumns() {
    const columnDefinition = this.inputColumnDefinitions();

    // If any column has filter enabled then header will display empty space for others column.
    this.showFilterInputBar = columnDefinition.some((col) => col.displayFilter);

    // Sort left pinned columns first.
    columnDefinition.sort((a, b) => {
      if (!a.isPinnable?.pinnedLeft && b.isPinnable?.pinnedLeft) {
        return 1;
      } else if (a.isPinnable?.pinnedLeft && !b.isPinnable?.pinnedLeft) {
        return -1;
      } else {
        return 0;
      }
    });
    // Sort right pinned columns last.
    columnDefinition.sort((a, b) => {
      if (!a.isPinnable?.pinnedRight && b.isPinnable?.pinnedRight) {
        return -1;
      } else if (a.isPinnable?.pinnedRight && !b.isPinnable?.pinnedRight) {
        return 1;
      } else {
        return 0;
      }
    });
    // Sort grouped column to the left pinned columns first.
    columnDefinition.sort((a, b) => {
      if (!a.groupRows && b.groupRows) {
        return 1;
      } else if (a.groupRows && !b.groupRows) {
        return -1;
      } else {
        return 0;
      }
    });

    // After sorting set
    this.inputColumnDefinitions.set(columnDefinition);
    // Set displayed columns as per the new order.
    this.displayedColumns.set(this.inputColumnDefinitions().map((col) => col.columnId));
    // Set expanded column if needed.
    this.displayedColumnsWithExpand.set(['expand', ...this.displayedColumns()]);
  }

  // Handler the column drop event to update column position.
  protected columnDropHandler(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.displayedColumns(), event.previousIndex, event.currentIndex);
      this.updateColumnSequence();
    }
  }

  // Updates the column position based on the index changes to the displayed column list.
  private updateColumnSequence() {
    const newColumnDefinition = [...this.inputColumnDefinitions()];
    for (let index = 0; index < this.displayedColumns().length; index++) {
      newColumnDefinition[index].columnPosition = index + 1;
    }
    this.inputColumnDefinitions.set(newColumnDefinition);
  }

  // Apply the column filters on changes to any filter input field value.
  protected applyFilters() {
    // Filter the columns with filter value.
    const appliedFilters: ColumnDefinition[] = this.inputColumnDefinitions().filter(
      (column) => !!column.filterValue
    );

    // If no column is found with filter value, then simply reset filters and return.
    if (appliedFilters.length === 0) {
      if(this.enableRowGrouping()) {
        this.generateRowGroupedData(this.inputData());
        this.tableDataSource().data = this.rowGroupedData();
        this.filteredData = this.rowGroupedData();
      } else {
        this.tableDataSource().data = this.inputData();
        this.filteredData = this.inputData();
      }
      return;
    }

    // Create new input data copy for filtering data.
    let filteredData = this.inputData().slice();

    // Iterate over the columns with filter values.
    for (const column of appliedFilters) {
      if (column.isComputed) {
        filteredData = filteredData.filter((row: any) => {
          return column.computeFunction
            ? column
              .computeFunction(row)
              .toLowerCase()
              .includes(column.filterValue?.toLowerCase())
            : false;
        });
      } else if (column.type === 'number' && !!column.filterValue) {
        filteredData = filteredData.filter((row: any) =>
          row[column.field].toString().includes(column.filterValue)
        );
      } else if (column.type === 'boolean' && !!column.filterValue) {
        // Filter the boolean data values here.
      } else if (column.type === 'date' && !!column.filterValue) {
        filteredData = filteredData.filter((row: any) =>
          row[column.field].toString().includes(column.filterValue)
        );
      } else if (!!column.filterValue) {
        filteredData = filteredData.filter((row: any) =>
          row[column.field].toLowerCase().includes(column.filterValue?.toLowerCase())
        );
      }
    }

    // Update filtered data object with new filtered data.
    this.filteredData = filteredData;
    // Update table data source with new filtered data.
    if(this.enableRowGrouping()) {
      this.generateRowGroupedData(filteredData);
      this.tableDataSource().data = this.rowGroupedData();
    } else {
      this.tableDataSource().data = filteredData;
    }
  }

  // Handle custom column sort.
  protected sortData(columnId: string) {
    // Set direction.
    const direction =
      this.activeSort().direction === ''
        ? 'asc'
        : this.activeSort().direction === 'asc'
          ? 'desc'
          : '';
    const sort: Sort = { active: columnId, direction };

    // Update active sort.
    this.activeSort.set(sort);
    // If sort is not enabled and has no direction then, reset data and return.
    if (!sort.active || sort.direction === '') {
      if(this.enableRowGrouping()) {
        // console.log(this.inputData());
        // this.generateRowGroupedData(this.inputData());
        // this.tableDataSource().data = this.rowGroupedData();
        this.applyFilters();
        
        console.log("this.rowGroupedData(): ", this.rowGroupedData());
        console.log("this.childTableData(): ", this.childTableData);
      } else {
        this.tableDataSource().data = this.filteredData;
      }
      return;
    }

    // If sort is active then find the column from column definitions with active sort.
    const column = this.inputColumnDefinitions().find(
      (col) => col.columnId === sort.active
    )
    // If column not found then return.
    if (!column) {
      return;
    }

    // Get date format.
    const dateFormat: string = column.dateFormat ?
      column.dateFormat : this.defaultDateFormat;
    // Copy the filtered data object.
    // const sortData = this.filteredData.slice();
    const sortData = this.inputData().slice();

    // Sort the copied data and assign to table data source.
    const sortedData = sortData.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';

      // Based on column type compare and return the compare value.
      if (column.isComputed && column.computeFunction) {
        return compareValues(
          column.computeFunction(a),
          column.computeFunction(b),
          isAsc
        );
      } else if (column.type === 'date') {
        return compareValues(
          this.datePipe.transform(a[column.field], dateFormat) ?? '',
          this.datePipe.transform(b[column.field], dateFormat) ?? '',
          isAsc
        );
      } else {
        return compareValues(a[column.field], b[column.field], isAsc);
      }
    });

    
    this.generateRowGroupedData(sortedData);
    this.tableDataSource().data = sortedData;
    console.log("this.rowGroupedData(): ", this.rowGroupedData());
    console.log("this.childTableData(): ", this.childTableData);
  }

  protected getSortButtonAriaLabel(headerName: string, direction: string): string {
    if (direction === '') {
      return `Sort column ${headerName} in ascending order.`;
    } else if (direction === 'asc') {
      return `Sort column ${headerName} in descending order.`;
    } else {
      return `Remove sort for column ${headerName}.`;
    }
  }

  private generateRowGroupedData(data: any[]) {
    const groupedRowColumn = this.inputColumnDefinitions().find((col) => col.groupRows);
    if(!groupedRowColumn) {
      this.enableRowGrouping.set(false);
      this.rowGroupedData.set([]);
      return;
    }

    this.enableRowGrouping.set(true);
    this.groupedColumn = groupedRowColumn;
    let uniqueColumnValues = [];
    if(groupedRowColumn.isComputed && groupedRowColumn.computeFunction) {
      const computeColumnValues = data.map((item: any) => {
        if(this.groupedColumn?.computeFunction) {
          return this.groupedColumn.computeFunction(item);
        } else {
          return undefined;
        }
      });
      uniqueColumnValues = [...new Set(computeColumnValues.filter((computeValue) => !!computeValue))];
    } else {
      uniqueColumnValues = [...new Set(data.map((item: any) => item[groupedRowColumn.field]))];
    }
    const groupedData = uniqueColumnValues.map((col) => data.find((item: any) => {
      if(groupedRowColumn.isComputed && groupedRowColumn.computeFunction) {
        return groupedRowColumn.computeFunction(item) === col;
      } else {
        return item[groupedRowColumn.field] === col;
      }
    }));

    this.childTableData = {};
    for(const groupRow of groupedData) {
      if(this.groupedColumn.isComputed && this.groupedColumn.computeFunction) {
        const computeValue = this.groupedColumn.computeFunction(groupRow);
        this.childTableData[computeValue] = this.getFilteredChildTableData(data, computeValue);
      } else {
        this.childTableData[groupRow[this.groupedColumn.field]] = this.getFilteredChildTableData(data, groupRow[this.groupedColumn.field]);
      }
    }

    this.rowGroupedData.set(groupedData);
    this.filteredData = groupedData;
  }

  protected getFilteredChildTableData(data: any[], uniqueValue: any) {
    return data.filter((record: any) => {
      if(this.groupedColumn) {
        if(this.groupedColumn.isComputed && this.groupedColumn.computeFunction) {
          return this.groupedColumn.computeFunction(record) === uniqueValue;
        } else {
          return record[this.groupedColumn.field] === uniqueValue;
        }
      }
      return false;
    });
  }

  protected getChildTableData(rowExpanded: any): any[] {
    if(this.groupedColumn?.isComputed && this.groupedColumn?.computeFunction) {
      return this.childTableData[this.groupedColumn.computeFunction(rowExpanded)] ?? [];
    } else {
      return this.childTableData[(rowExpanded[this.groupedColumn?.columnId ?? ''])] ?? [];
    }
  }
}

// Value comparator for column sorting.
function compareValues(
  a: number | string,
  b: number | string,
  isAscending: boolean,
) {
  return (a < b ? -1 : 1) * (isAscending ? 1 : -1);
}

// Usage
// const groupedData = groupBy(this.inputData(), (i: any) => {
//   if(groupedRowColumn.isComputed && groupedRowColumn.computeFunction) {
//     return groupedRowColumn.computeFunction(i);
//   } else {
//     return i[groupedRowColumn.field];
//   }
// });

// A little bit simplified version
const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);