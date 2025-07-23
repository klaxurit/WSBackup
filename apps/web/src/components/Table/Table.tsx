import React from 'react';

export interface TableColumn<T = any> {
  label: string;
  key: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  className?: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
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
  // Pagination props
  pagination?: PaginationProps;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="Table__Pagination">
      <div className="Table__PaginationInfo">
        Showing {startItem}-{endItem} of {totalItems} transactions
      </div>
      <div className="Table__PaginationControls">
        <button
          className="Table__PaginationBtn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            className={`Table__PaginationBtn ${page === currentPage ? 'Table__PaginationBtn--active' : ''
              } ${page === '...' ? 'Table__PaginationBtn--dots' : ''}`}
            onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}

        <button
          className="Table__PaginationBtn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

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
  pagination,
}: TableProps<T>) {
  const wrapperClasses = [
    wrapperClassName,
    className,
    pagination ? 'Table__Wrapper--with-pagination' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
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
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="TokenTxTable__Empty">Loading...</td>
              </tr>
            ) : data.length === 0 ? (
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
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}

export default Table;