import React, { useState } from "react";

interface TabsProps {
  tabs: string[];
  defaultTab: string;
  className?: string;
  onChange: (newTab: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const containerClass = className || "FormTab";

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onChange(tab);
  };

  const getSelectedIndex = () => {
    return tabs.findIndex(tab => tab === activeTab);
  };

  return (
    <div className={containerClass} data-selected={getSelectedIndex()}>
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`Tab ${tab === activeTab ? "selected" : ""}`}
          onClick={() => handleTabClick(tab)}
        >
          <span>{tab}</span>
        </div>
      ))}
    </div>
  );
};
