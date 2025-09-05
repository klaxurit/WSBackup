import React, { useState } from 'react';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { VaultsTable } from '../../components/ExploreTables/vaults';
import { NewBanner } from '../../components/Common/NewBanner';
import { ButtonTransition, CardTransition, PageContentTransition } from '../../components/Transitions';
import vaultIcon from '../../assets/coffre_icon.png';

const VaultsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  return (
    <PageContentTransition className="VaultsPage">
      <div className="VaultsPage__Header">
        <NewBanner
          image={vaultIcon}
          title="Vaults"
          subtitle="Optimize your returns with our vaults"
          className="VaultsPage__Banner"
        />
      </div>

      <div className="VaultsPage__Content">
        <div className="VaultsPage__Search">
          <SearchBar
            searchValue={search}
            setSearchValue={setSearch}
            mode="compact"
          />
        </div>

        <div className="VaultsPage__Table">
          <VaultsTable searchValue={search} />
        </div>

        {/* Test button to access a vault directly */}
        <CardTransition index={0} delay={0.1}>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#aaa', marginBottom: '1rem' }}>
              Test: Access a vault directly
            </p>
            <ButtonTransition
              variant="primary"
              size="medium"
              onClick={() => window.location.href = '/vaults/0x1234567890123456789012345678901234567890'}
            >
              View WBERA/HONEY Vault
            </ButtonTransition>
          </div>
        </CardTransition>
      </div>
    </PageContentTransition>
  );
};

export default VaultsPage;
