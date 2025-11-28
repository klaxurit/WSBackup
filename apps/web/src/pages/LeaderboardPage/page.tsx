import React from 'react';
import { PageContentTransition } from '../../components/Transitions';
import { LeaderboardTable } from '../../components/Leaderboard/LeaderboardTable';
import { VaultsMarquee } from '../../components/Leaderboard/VaultsMarquee';
import { NewBanner } from '../../components/Common/NewBanner';
import leaderboardIcon from '../../assets/leaderboard.png';

const LeaderboardPage: React.FC = () => {
  return (
    <PageContentTransition className="Leaderboard">
      <NewBanner 
        title="Leaderboard" 
        subtitle="Track top traders, discover trending pools, and manage your portfolio in one place" 
        image={leaderboardIcon} 
      />
      <div className="Leaderboard__ContentWrapper">
        <div className="Leaderboard__Content">
          {/* Vaults Marquee */}
          <VaultsMarquee />

          {/* Leaderboard Table */}
          <LeaderboardTable />
        </div>
      </div>
    </PageContentTransition>
  );
};

export default LeaderboardPage;

