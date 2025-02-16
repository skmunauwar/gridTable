import { AfterViewInit, Component, Input, signal, ViewChild, WritableSignal } from '@angular/core';
import { CdkDrag, CdkDragHandle, DragDropModule, CdkDropList, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
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
  isPinnable?: { pinnedLeft?: boolean; pinnedRight?: boolean };
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
}

@Component({
  selector: 'app-grid-mat-table',
  imports: [
    CdkDrag, CdkDragHandle, CdkDropList, DragDropModule, MatTableModule, MatTooltipModule, DatePipe,
    MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule, MatInputModule, MatPaginatorModule,
    MatMenuModule,
  ],
  templateUrl: './grid-mat-table.component.html',
  styleUrl: './grid-mat-table.component.scss',
  standalone: true,
})
export class GridMatTableComponent implements AfterViewInit {
  readonly datePipe = new DatePipe('en-US')
  protected readonly defaultDateFormat = 'MM/dd/yyyy';
  protected displayedColumns: WritableSignal<string[]> = signal([]);
  protected tableDataSource = signal(new MatTableDataSource());
  protected activeSort: WritableSignal<Sort> = signal({ active: '', direction: '' });
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private inputData: WritableSignal<any[]> = signal([]);
  protected inputColumnDefinitions: WritableSignal<ColumnDefinition[]> = signal([]);
  private filteredData: any[] = [];

  ngAfterViewInit() {
    this.tableDataSource().paginator = this.paginator;
  }

  @Input() set data(data: any[]) {
    this.inputData.set(data);
    this.filteredData = data;
    this.tableDataSource.set(new MatTableDataSource(data));
    this.tableDataSource().paginator = this.paginator;
  }
  @Input() paginatorOptions: WritableSignal<number[]> = signal([10, 50, 100, 500, 1000]);

  @Input() set columnDefinitions(input: ColumnDefinition[]) {
    this.inputColumnDefinitions.set(input);
    this.setDisplayedColumns();
  }

  protected setDisplayedColumns() {
    const columnDefinition = this.inputColumnDefinitions();

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

    this.inputColumnDefinitions.set(columnDefinition);
    this.displayedColumns.set(this.inputColumnDefinitions().map((col) => col.columnId));
  }

  protected dropListDropped(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.displayedColumns(), event.previousIndex, event.currentIndex);
      this.updateColumnSequence();
    }
  }

  private updateColumnSequence() {
    const newColumnDefinition = [...this.inputColumnDefinitions()];
    for (let index = 0; index < this.displayedColumns().length; index++) {
      newColumnDefinition[index].columnPosition = index + 1;
    }
    this.inputColumnDefinitions.set(newColumnDefinition);
  }

  protected applyFilters() {
    const appliedFilters: ColumnDefinition[] = this.inputColumnDefinitions().filter(
      (column) => !!column.filterValue
    );

    if (appliedFilters.length === 0) {
      this.tableDataSource().data = this.inputData();
      this.filteredData = this.inputData();
      return;
    }

    let filteredData = this.inputData().slice();

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

    this.filteredData = filteredData;
    this.tableDataSource().data = filteredData;
  }

  protected sortData(columnId: string) {
    const direction =
      this.activeSort().direction === ''
        ? 'asc'
        : this.activeSort().direction === 'asc'
          ? 'desc'
          : '';
    const sort: Sort = { active: columnId, direction };

    this.activeSort.set(sort);
    if (!sort.active || sort.direction === '') {
      this.tableDataSource().data = this.filteredData;
      return;
    }

    const column = this.inputColumnDefinitions().find(
      (col) => col.columnId === sort.active
    )
    if (!column) {
      return;
    }

    const dateFormat: string = column.dateFormat ?
      column.dateFormat : this.defaultDateFormat;
    const sortData = this.filteredData.slice();

    this.tableDataSource().data = sortData.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';

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
}

function compareValues(
  a: number | string,
  b: number | string,
  isAscending: boolean,
) {
  return (a < b ? -1 : 1) * (isAscending ? 1 : -1);
}