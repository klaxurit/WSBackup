import React from 'react';
import '../../styles/tokenTransactionsTable.scss';

export interface TableColumn<T = any> {
  label: string;
  key: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  className?: string;
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
}: TableProps<T>) {
  return (
    <div className={`${wrapperClassName} ${className}`.trim()}>
      <div className={scrollClassName}>
        <table className={`${tableClassName} Table--bordered`}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.className}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="TokenTxTable__Empty">{emptyMessage}</td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
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