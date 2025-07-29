import React, { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T = any> {
  label: string;
  key: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortValue?: (row: T) => number | string;
  width?: string;
}

interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
  tableClassName?: string;
  wrapperClassName?: string;
  scrollClassName?: string;
  getRowClassName?: (row: T, rowIndex: number) => string;
  isLoading?: boolean;
  defaultSortKey?: string;
  defaultSortDirection?: SortDirection;
}

export function Table<T = any>({
  columns,
  data,
  className = '',
  emptyMessage = 'No data',
  tableClassName = 'TokenTxTable',
  wrapperClassName = 'TokenTxTable__Wrapper',
  scrollClassName = 'TokenTxTable__Scroll',
  getRowClassName,
  isLoading = false,
  defaultSortKey,
  defaultSortDirection = null,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortKey === columnKey) {
      // Cycle through: asc -> desc -> null -> asc
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    const column = columns.find(col => col.key === sortKey);
    if (!column?.sortable) return data;

    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (column.sortValue) {
        aValue = column.sortValue(a);
        bValue = column.sortValue(b);
      } else {
        aValue = (a as any)[sortKey];
        bValue = (b as any)[sortKey];
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Convert to numbers if possible
      const aNum = typeof aValue === 'string' ? parseFloat(aValue.replace(/[$,]/g, '')) : aValue;
      const bNum = typeof bValue === 'string' ? parseFloat(bValue.replace(/[$,]/g, '')) : bValue;

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortKey, sortDirection, columns]);

  const getSortIcon = (columnKey: string): React.ReactNode => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return null;

    if (sortKey !== columnKey) {
      return <span className="Table__SortIcon Table__SortIcon--inactive">↕</span>;
    }

    if (sortDirection === 'asc') {
      return <span className="Table__SortIcon Table__SortIcon--asc">↑</span>;
    } else if (sortDirection === 'desc') {
      return <span className="Table__SortIcon Table__SortIcon--desc">↓</span>;
    }

    return <span className="Table__SortIcon Table__SortIcon--inactive">↕</span>;
  };

  return (
    <div className={`${wrapperClassName} ${className}`.trim()}>
      <div className={scrollClassName}>
        <table className={`${tableClassName} Table--bordered`}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.className || ''} ${col.sortable ? 'Table__SortableHeader' : ''}`.trim()}
                  onClick={() => handleSort(col.key)}
                  style={{
                    cursor: col.sortable ? 'pointer' : 'default',
                    width: col.width,
                    userSelect: 'none'
                  }}
                  title={col.sortable ? 'Click to sort' : undefined}
                >
                  <span className="Table__HeaderContent">
                    {col.label}
                    {getSortIcon(col.key)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="TokenTxTable__Empty">Loading...</td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="TokenTxTable__Empty">{emptyMessage}</td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr key={rowIndex} className={getRowClassName ? getRowClassName(row, rowIndex) : undefined}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render ? col.render(row, rowIndex) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;