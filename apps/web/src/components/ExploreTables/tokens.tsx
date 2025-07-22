import Table, { type TableColumn } from "../Table/Table"
import { FallbackImg } from "../utils/FallbackImg";
import { Link } from 'react-router-dom';
import { formatUnits } from "viem";

interface TokensTableProps {
  data?: any[];
  isLoading?: boolean;
}

export const TokensTable = ({ data, isLoading }: TokensTableProps) => {
  const tokens = data ?? [];

  const columns: TableColumn[] = [
    {
      label: '#', key: 'index', render: (row) => (
        <a
          href={`https://beratrail.io/address/${row.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="Table__Address"
          title={row.address}
        >
          {row.address.slice(0, 4) + '...' + row.address.slice(-4)}
        </a>)
    },
    {
      label: 'Token name',
      key: 'name',
      className: 'TokensTable__NameTd',
      render: (row) => (
        <span className="TokensTable__NameCell">
          <span className="TokensTable__LogoWrapper">
            {row.logoUri
              ? <img src={row.logoUri} className="TokensTable__Logo" />
              : <FallbackImg content={row.symbol} className="TokensTable__Logo" />}
          </span>
          <Link
            to={`/tokens/${row.address}`}
            className="TokensTable__NameLink"
            title={`View ${row.name} details`}
          >
            {row.name}
          </Link>
        </span>
      )
    },
    {
      label: 'Price', key: 'price', render: (row) => {
        return row.Statistic?.length > 0 ? `$${row.Statistic[0].price.toFixed(2)}` : '-'
      }
    },
    {
      label: '1h', key: '1h', render: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].oneHourEvolution !== 0
          ? `${row.Statistic[0].oneHourEvolution.toFixed(2)}%`
          : '-'
      }
    },
    {
      label: '1d', key: '1d', render: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].oneDayEvolution !== 0
          ? `${row.Statistic[0].oneDayEvolution.toFixed(2)}%`
          : '-'
      }
    },
    // { label: 'FDV', key: 'fdv' },
    {
      label: 'Volume', key: 'volume', render: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].volume !== 0
          ? `$${parseFloat(formatUnits(row.Statistic[0].volume, row.decimals)).toFixed(4)}`
          : '-'
      }
    },
  ];

  return (
    <Table
      columns={columns}
      data={tokens}
      isLoading={isLoading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
    />
  )
}
