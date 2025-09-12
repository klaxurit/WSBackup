import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { FallbackImg } from "../utils/FallbackImg";
import { Link } from 'react-router-dom';
import { useMemo, useState } from "react";
import { formatNumber } from "../../utils/formatNumber";

const GET_TOKENS_STATS = `
  query GetTokensStats {
    tokens {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      items {
        feesUSD
        id
        name
        totalSupply
        volumeUSD
        symbol
        logoUri
        tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
          items {
            priceUSD
            close
            high
            low
            open
            oneDayEvo
            oneMonthEvo
            marketCap
            fdv
            volume24hUSD
          }
        }
      }
    }
  }
`

export const TokensTable = ({ searchValue }: { searchValue: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['tokensStats', currentPage, searchValue],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_TOKENS_STATS
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.tokens;
    }
  });

  const tokens = useMemo(() => {
    if (!data?.items) return [];

    // Filtrage par recherche
    let filteredTokens = data.items;
    if (searchValue && searchValue.trim() !== '') {
      filteredTokens = data.items.filter((token: any) =>
        token.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
        token.id.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Pagination côté client
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filteredTokens.slice(startIndex, endIndex);
  }, [data, searchValue, currentPage, itemsPerPage]);

  const pagination = useMemo(() => {
    if (!data) return undefined;

    // Filtrage pour calculer le total
    let filteredTokens = data.items;
    if (searchValue && searchValue.trim() !== '') {
      filteredTokens = data.items.filter((token: any) =>
        token.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
        token.id.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    const totalPages = Math.ceil(filteredTokens.length / itemsPerPage);

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems: filteredTokens.length,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      onPageChange: setCurrentPage
    };
  }, [data, searchValue, currentPage, itemsPerPage]);

  const columns: TableColumn[] = [
    {
      label: '#',
      key: 'index',
      render: (row) => (
        <a
          href={`https://berascan.com/address/${row.id || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="Table__Address"
          title={row.id || ''}
        >
          {row.id ? row.id.slice(0, 4) + '...' + row.id.slice(-4) : 'N/A'}
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
            to={`/tokens/${row.id || ''}`}
            className="TokensTable__NameLink"
            title={`View ${row.name || 'Unknown'} details`}
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
        return row.tokenDayData?.items?.length > 0 ? row.tokenDayData.items[0].priceUSD : 0;
      },
      render: (row) => {
        return row.tokenDayData?.items?.length > 0
          ? `$${formatNumber(parseFloat(row.tokenDayData.items[0].priceUSD))}`
          : '-'
      }
    },
    {
      label: '1h',
      key: '1h',
      sortable: true,
      sortValue: (row) => {
        return row.tokenDayData?.items?.length > 0 ? parseFloat(row.tokenDayData.items[0].oneDayEvo) : 0;
      },
      render: (row) => {
        const evolution = row.tokenDayData?.items?.length > 0 ? parseFloat(row.tokenDayData.items[0].oneDayEvo) : 0;
        if (!evolution || evolution === 0) return '-';
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
        return row.tokenDayData?.items?.length > 0 ? parseFloat(row.tokenDayData.items[0].oneMonthEvo) : 0;
      },
      render: (row) => {
        const evolution = row.tokenDayData?.items?.length > 0 ? parseFloat(row.tokenDayData.items[0].oneMonthEvo) : 0;
        if (!evolution || evolution === 0) return '-';
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
        return row.tokenDayData?.items?.length > 0 && row.tokenDayData.items[0].fdv
          ? parseFloat(row.tokenDayData.items[0].fdv)
          : 0;
      },
      render: (row) => {
        return row.tokenDayData?.items?.length > 0 && row.tokenDayData.items[0].fdv !== "0"
          ? `$${formatNumber(parseFloat(row.tokenDayData.items[0].fdv))}`
          : '-'
      }
    },
    {
      label: 'Market Cap',
      key: 'mcap',
      sortable: true,
      sortValue: (row) => {
        return row.tokenDayData?.items?.length > 0 && row.tokenDayData.items[0].marketCap ? row.tokenDayData.items[0].marketCap : 0;
      },
      render: (row) => {
        return row.tokenDayData?.items?.length > 0 && row.tokenDayData.items[0].marketCap !== 0
          ? `$${formatNumber(parseFloat(row.tokenDayData.items[0].marketCap))}`
          : '-'
      }
    },
    {
      label: 'Volume',
      key: 'volume',
      sortable: true,
      sortValue: (row) => {
        return row.tokenDayData?.items?.length > 0 && row.tokenDayData.items[0].volume24hUSD
          ? parseFloat(row.tokenDayData.items[0].volume24hUSD)
          : 0;
      },
      render: (row) => {
        return parseFloat(row.volumeUSD) !== 0
          ? `$${formatNumber(parseFloat(row.volumeUSD))}`
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
      pagination={pagination}
    />
  )
}
