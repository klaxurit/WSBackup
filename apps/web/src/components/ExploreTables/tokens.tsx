import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { FallbackImg } from "../utils/FallbackImg";
import { Link } from 'react-router-dom';
import { useMemo } from "react";
import { formatNumber } from "../../utils/formatNumber";
import { formatUnits } from "viem";

export const TokensTable = ({ searchValue }: { searchValue: string }) => {
  const { data = [], isLoading: isLoading } = useQuery({
    queryKey: ['tokensStats'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/tokens`);
      if (!resp.ok) return [];
      return resp.json();
    }
  });

  const tokens = useMemo(() => {
    const inPoolTokens = data.filter((t: any) => t.inPool)
    if (!searchValue || searchValue === '') return inPoolTokens

    return inPoolTokens.filter((token: any) =>
      token.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
      token.address.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, data]);

  const columns: TableColumn[] = [
    {
      label: '#',
      key: 'index',
      render: (row) => (
        <a
          href={`https://berascan.com/address/${row.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="Table__Address"
          title={row.address}
        >
          {row.address.slice(0, 4) + '...' + row.address.slice(-4)}
        </a>
      )
    },
    {
      label: 'Token name',
      key: 'name',
      className: 'TokensTable__NameTd',
      sortable: true,
      sortValue: (row) => row.name || row.symbol || '',
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
            {row.symbol} - {row.name}
          </Link>
        </span>
      )
    },
    {
      label: 'Price',
      key: 'price',
      sortable: true,
      sortValue: (row) => {
        return row.Statistic?.length > 0 ? row.Statistic[0].price : 0;
      },
      render: (row) => {
        return row.Statistic?.length > 0 ? `$${formatNumber(row.Statistic[0].price)}` : '-'
      }
    },
    {
      label: '1h',
      key: '1h',
      sortable: true,
      sortValue: (row) => {
        return row.Statistic?.length > 0 ? row.Statistic[0].oneHourEvolution : 0;
      },
      render: (row) => {
        const evolution = row.Statistic?.length > 0 ? row.Statistic[0].oneHourEvolution : 0;
        if (evolution === 0) return '-';
        const isPositive = evolution > 0;
        return (
          <span style={{ color: isPositive ? '#00FFA3' : '#FF4D4D' }}>
            {evolution.toFixed(2)}%
          </span>
        );
      }
    },
    {
      label: '1d',
      key: '1d',
      sortable: true,
      sortValue: (row) => {
        return row.Statistic?.length > 0 ? row.Statistic[0].oneDayEvolution : 0;
      },
      render: (row) => {
        const evolution = row.Statistic?.length > 0 ? row.Statistic[0].oneDayEvolution : 0;
        if (evolution === 0) return '-';
        const isPositive = evolution > 0;
        return (
          <span style={{ color: isPositive ? '#00FFA3' : '#FF4D4D' }}>
            {evolution.toFixed(2)}%
          </span>
        );
      }
    },
    {
      label: 'FDV',
      key: 'fdv',
      sortable: true,
      sortValue: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].fdv ? row.Statistic[0].fdv : 0;
      },
      render: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].fdv !== 0 && row.Statistic[0].fdv
          ? `$${formatNumber(row.Statistic[0].fdv)}`
          : '-'
      }
    },
    {
      label: 'Market Cap',
      key: 'mcap',
      sortable: true,
      sortValue: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].marketCap ? row.Statistic[0].marketCap : 0;
      },
      render: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].marketCap !== 0 && row.Statistic[0].marketCap
          ? `$${formatNumber(row.Statistic[0].marketCap)}`
          : '-'
      }
    },
    {
      label: 'Volume',
      key: 'volume',
      sortable: true,
      sortValue: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].volume
          ? parseFloat(formatUnits(BigInt(row.Statistic[0].volume || 0n), row.decimal))
          : 0;
      },
      render: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].volume !== 0
          ? `$${formatNumber(parseFloat(formatUnits(BigInt(row.Statistic[0].volume || 0n), row.decimals)))}`
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
      defaultSortKey="volume"
      defaultSortDirection="desc"
    />
  )
}