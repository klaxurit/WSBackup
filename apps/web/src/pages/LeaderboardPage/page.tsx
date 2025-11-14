import React from 'react';
import { PageContentTransition } from '../../components/Transitions';
import { PortfolioSection, TopBoostedSection } from '../../components/Leaderboard/PortfolioSection';
import { TrendingSection } from '../../components/Leaderboard/TrendingSection';
import { LeaderboardTable } from '../../components/Leaderboard/LeaderboardTable';
import { NewBanner } from '../../components/Common/NewBanner';
import honeyIcon from '../../assets/honey_icon.png';

const LeaderboardPage: React.FC = () => {
  return (
    <PageContentTransition className="Leaderboard">
      <NewBanner 
        title="Leaderboard" 
        subtitle="Track top traders, discover trending pools, and manage your portfolio in one place" 
        image={honeyIcon} 
      />
      <div className="Leaderboard__ContentWrapper">
        <div className="Leaderboard__Content">
          {/* Main Column - Leaderboard Table */}
          <div className="Leaderboard__MainColumn">
            <LeaderboardTable />
          </div>

          {/* Sidebar - Portfolio + Top Boosted + Trending */}
          <div className="Leaderboard__Sidebar">
            {/* User Portfolio Section */}
            <PortfolioSection />

            {/* Top Boosted Section */}
            <TopBoostedSection />

            {/* Trending Section (Top 3 pools and vaults) */}
            <TrendingSection />
          </div>
        </div>
      </div>
    </PageContentTransition>
  );
};

export default LeaderboardPage;

