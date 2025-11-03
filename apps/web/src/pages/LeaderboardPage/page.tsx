import React from 'react';
import { PageContentTransition } from '../../components/Transitions';
import { PortfolioSection, TopBoostedSection } from '../../components/Leaderboard/PortfolioSection';
import { TrendingSection } from '../../components/Leaderboard/TrendingSection';
import { LeaderboardTable } from '../../components/Leaderboard/LeaderboardTable';

const LeaderboardPage: React.FC = () => {
  return (
    <PageContentTransition className="Leaderboard">
      <div className="Leaderboard__Hero">
        <div className="Leaderboard__HeroContent">
          <h1 className="Leaderboard__Title">Leaderboard</h1>
          <p className="Leaderboard__Description">
            Track top traders, discover trending pools, and manage your portfolio in one place
          </p>
        </div>
      </div>

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
    </PageContentTransition>
  );
};

export default LeaderboardPage;

