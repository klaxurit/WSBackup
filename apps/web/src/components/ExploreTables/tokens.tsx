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
      label: '#', key: 'index', render: (row) => (
        <a
          href={`https://berascan.com/address/${row.address}`}
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
            {row.symbol} - {row.name}
          </Link>
        </span>
      )
    },
    {
      label: 'Price', key: 'price', render: (row) => {
        return row.Statistic?.length > 0 ? `$${formatNumber(row.Statistic[0].price)}` : '-'
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
    {
      label: 'FDV', key: 'fdv', render: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].fdv !== 0 && row.Statistic[0].fdv
          ? `$${formatNumber(row.Statistic[0].fdv)}`
          : '-'
      }
    },
    {
      label: 'Market Cap', key: 'mcap', render: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].marketCap !== 0 && row.Statistic[0].marketCap
          ? `$${formatNumber(row.Statistic[0].marketCap)}`
          : '-'
      }
    },
    {
      label: 'Volume', key: 'volume', render: (row) => {
        return row.Statistic?.length > 0 && row.Statistic[0].volume !== 0
          ? `$${formatNumber(parseFloat(formatUnits(BigInt(row.Statistic[0].volume || 0n), row.decimal)))}`
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
