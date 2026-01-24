import React, { useId, useMemo, useState } from "react";

/**
 * Usage:
 * <Tabs defaultValue="profile">
 *   <Tab value="profile" label="Profile">...</Tab>
 *   <Tab value="billing" label="Billing">...</Tab>
 *   <Tab value="security" label="Security">...</Tab>
 * </Tabs>
 */

export function Tabs({ children, defaultValue, setTab }) {
  const tabs = React.Children.toArray(children).filter(Boolean);
  const [tabValue, setTabValue] = useState(defaultValue ?? tabs[0].props.value);
  const activeTab = tabs.find((t) => t.props.value === tabValue);

  const setActive = (next) => { 
    if (!next) return;
    else setTabValue(next);
    if (setTab) setTab(next);
  };

  return (
    <div className="tabs">
      <div className="tab-list" role="tablist" aria-orientation="horizontal">
        {tabs.map((tab) => {
          const { value, label } = tab.props;
          const selected = (value === tabValue);

          return (
            <button
              key={value}
              id={`tab-${value}`}
              className="tab-btn"
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${value}`}
              onClick={() => setActive(value)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTab && (
        <div
          id={`panel-${tabValue}`}
          role="tabpanel"
          aria-labelledby={`tab-${tabValue}`}
          tabIndex={0}
        >
          {activeTab.props.children}
        </div>
      )}
    </div>
  );
}

export function Tab(_props) {
  // This component is a "marker" used by <Tabs>. It doesn't render by itself.
  return null;
}
