const OPENSEA_API_KEY = '3187877150464a59bae9d2539fb58892';
const COLLECTION_SLUG = 'steady-teddys-bera';

interface OpenSeaNFT {
  identifier: string;
  name: string;
  image_url: string;
}

interface OpenSeaResponse {
  nfts: OpenSeaNFT[];
  next: string | null;
}

let nftsCache: OpenSeaNFT[] = [];

export const fetchNFTBackgrounds = async (limit: number = 50): Promise<{ url: string; name: string }[]> => {
  try {
    const nftsResponse = await fetch(
      `https://api.opensea.io/api/v2/collection/${COLLECTION_SLUG}/nfts?limit=${limit}`,
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': OPENSEA_API_KEY
        }
      }
    );

    if (!nftsResponse.ok) {
      throw new Error(`Erreur API OpenSea (NFTs): ${nftsResponse.status}`);
    }

    const nftsData: OpenSeaResponse = await nftsResponse.json();

    const validNFTs = nftsData.nfts.filter(nft => nft.image_url);

    nftsCache = validNFTs;

    return validNFTs.map(nft => ({
      url: nft.image_url,
      name: `NFT #${nft.identifier}`
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des backgrounds:', error);
    return [];
  }
};

export const getRandomBackground = (): { url: string; name: string } | null => {
  if (nftsCache.length === 0) return null;

  const randomNFT = nftsCache[Math.floor(Math.random() * nftsCache.length)];
  return {
    url: randomNFT.image_url,
    name: `NFT #${randomNFT.identifier}`
  };
}; 