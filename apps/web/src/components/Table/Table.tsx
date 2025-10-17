import React, { useState, useMemo } from 'react';
import { Loader } from '../Loader/Loader';

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

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

interface InfiniteLoadProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  totalItems: number;
  currentItems: number;
  itemLabel?: string;
  onSort?: (columnKey: string, direction: 'asc' | 'desc' | null) => void;
  currentSortKey?: string;
  currentSortDirection?: 'asc' | 'desc';
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
  pagination?: PaginationProps;
  infiniteLoad?: InfiniteLoadProps;
  defaultSortKey?: string;
  defaultSortDirection?: SortDirection;
  itemLabel?: string;
  onRowClick?: (row: T, rowIndex: number) => void;
}

// Pagination component - currently unused but kept for future use
// const Pagination: React.FC<PaginationProps> = ({
//   currentPage,
//   totalPages,
//   onPageChange,
//   itemsPerPage,
//   totalItems,
//   hasPreviousPage,
//   hasNextPage,
//   itemLabel = 'items'
// }) => {
//   const getVisiblePages = () => {
//     const delta = 2;
//     const range = [];
//     const rangeWithDots = [];

//     for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
//       range.push(i);
//     }

//     if (currentPage - delta > 2) {
//       rangeWithDots.push(1, '...');
//     } else {
//       rangeWithDots.push(1);
//     }

//     rangeWithDots.push(...range);

//     if (currentPage + delta < totalPages - 1) {
//       rangeWithDots.push('...', totalPages);
//     } else if (totalPages > 1) {
//       rangeWithDots.push(totalPages);
//     }

//     return rangeWithDots;
//   };

//   const startItem = (currentPage - 1) * itemsPerPage + 1;
//   const endItem = Math.min(currentPage * itemsPerPage, totalItems);

//   if (totalPages <= 1) return null;

//   return (
//     <div className="Table__Pagination">
//       <div className="Table__PaginationInfo">
//         Showing {startItem}-{endItem} of {totalItems} {itemLabel}
//       </div>
//       <div className="Table__PaginationControls">
//         {hasPreviousPage && (
//           <button
//             className="Table__PaginationBtn"
//             onClick={() => onPageChange(currentPage - 1)}
//           >
//             Previous
//           </button>
//         )}

//         {getVisiblePages().map((page, index) => (
//           <button
//             key={index}
//             className={`Table__PaginationBtn ${page === currentPage ?
//               'Table__PaginationBtn--active' : ''
//               } ${page === '...' ? 'Table__PaginationBtn--dots' : ''}`}
//             onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
//             disabled={page === '...'}
//           >
//             {page}
//           </button>
//         ))}

//         {hasNextPage && (
//           <button
//             className="Table__PaginationBtn"
//             onClick={() => onPageChange(currentPage + 1)}
//           >
//             Next
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

const InfiniteLoad: React.FC<InfiniteLoadProps> = ({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  currentItems
}) => {
  if (!hasNextPage && currentItems === 0) return null;

  return (
    <div className="Table__InfiniteLoad">
      {/* <div className="Table__InfiniteLoadInfo">
        Showing {currentItems} of {totalItems} {itemLabel}
      </div> */}
      {hasNextPage && (
        <div className="Table__InfiniteLoadControls">
          <button
            className="Table__LoadMoreBtn"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader size="small" />
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export function Table<T = any>({
  columns,
  data,
  className = '',
  emptyMessage = 'No data',
  tableClassName = 'Table',
  wrapperClassName = 'Table__Wrapper',
  scrollClassName = 'Table__Scroll',
  getRowClassName,
  isLoading = false,
  pagination,
  infiniteLoad,
  defaultSortKey,
  defaultSortDirection = null,
  itemLabel = 'items',
  onRowClick,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  // Utiliser le tri côté serveur si disponible, sinon le tri local
  const effectiveSortKey = infiniteLoad?.currentSortKey || sortKey;
  const effectiveSortDirection = infiniteLoad?.currentSortDirection || sortDirection;

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    // Si on a une fonction de tri côté serveur (infinite loading), l'utiliser
    if (infiniteLoad?.onSort) {
      let newDirection: 'asc' | 'desc' | null = 'asc';

      if (effectiveSortKey === columnKey) {
        // Cycle through: asc -> desc -> null -> asc
        if (effectiveSortDirection === 'asc') {
          newDirection = 'desc';
        } else if (effectiveSortDirection === 'desc') {
          newDirection = null;
        } else {
          newDirection = 'asc';
        }
      }

      infiniteLoad.onSort(columnKey, newDirection);
      return;
    }

    // Sinon, utiliser le tri côté client (logique originale)
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
    // Si on utilise l'infinite loading avec tri côté serveur, pas de tri côté client
    if (infiniteLoad?.onSort) return data;

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
  }, [data, sortKey, sortDirection, columns, infiniteLoad]);

  const getSortIcon = (columnKey: string): React.ReactNode => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return null;

    if (effectiveSortKey !== columnKey) {
      return <span className="Table__SortIcon Table__SortIcon--inactive">↕</span>;
    }

    if (effectiveSortDirection === 'asc') {
      return <span className="Table__SortIcon Table__SortIcon--asc">↑</span>;
    } else if (effectiveSortDirection === 'desc') {
      return <span className="Table__SortIcon Table__SortIcon--desc">↓</span>;
    }

    return <span className="Table__SortIcon Table__SortIcon--inactive">↕</span>;
  };

  const wrapperClasses = [
    wrapperClassName,
    className,
    pagination ? 'Table__Wrapper--with-pagination' : '',
    infiniteLoad ? 'Table__Wrapper--with-infinite-load' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
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
                <td colSpan={columns.length} className="Table__Empty">
                  <div className="Table__LoadingContainer">
                    <Loader size="desktop" />
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="Table__Empty">{emptyMessage}</td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={getRowClassName ? getRowClassName(row, rowIndex) : undefined}
                  onClick={() => onRowClick?.(row, rowIndex)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
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
      {/* {pagination && <Pagination {...pagination} itemLabel={itemLabel} />} */}
      {infiniteLoad && <InfiniteLoad {...infiniteLoad} itemLabel={itemLabel} />}
    </div>
  );
}

export default Table;