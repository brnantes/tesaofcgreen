"use client" 

import * as React from "react"
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
 
export interface AnimatedTabsProps {
  tabs: { label: string; href?: string }[];
  className?: string;
  activeTab?: string;
  onTabChange?: (label: string) => void;
}
 
export function AnimatedTabs({ 
  tabs, 
  className = "",
  activeTab: externalActiveTab,
  onTabChange 
}: AnimatedTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.label || "");
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Determine active tab based on props or internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  // Sync with URL path
  useEffect(() => {
    if (tabs.length > 0) {
      const activeFromUrl = tabs.find(tab => tab.href === location.pathname);
      if (activeFromUrl) {
        setActiveTab(activeFromUrl.label);
      } else if (!activeTab && tabs[0]) {
        setActiveTab(tabs[0].label);
      }
    }
  }, [location.pathname, tabs]);

  useEffect(() => {
    const container = containerRef.current;
    const activeTabElement = activeTabRef.current;

    if (container && activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      const containerWidth = container.offsetWidth;

      const clipLeft = offsetLeft + 16;
      const clipRight = offsetLeft + offsetWidth + 16;

      container.style.clipPath = `inset(0 ${Number(
        100 - (clipRight / containerWidth) * 100,
      ).toFixed(2)}% 0 ${Number(
        (clipLeft / containerWidth) * 100,
      ).toFixed(2)}% round 17px)`;
    }
  }, [activeTab, tabs]);
 
  if (tabs.length === 0) return null;

  const handleTabClick = (tab: { label: string; href?: string }) => {
    if (tab.href) {
      navigate(tab.href);
    }
    setActiveTab(tab.label);
  };

  return (
    <div className={`relative bg-secondary/50 border border-primary/10 mx-auto flex w-fit flex-col items-center rounded-full py-2 px-4 ${className}`}>
      <div
        ref={containerRef}
        className="absolute z-10 w-full overflow-hidden [clip-path:inset(0px_75%_0px_0%_round_17px)] [transition:clip-path_0.25s_ease]"
      >
        <div className="relative flex w-full justify-center bg-primary">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(tab)}
              className="flex h-8 items-center rounded-full p-3 text-sm font-medium text-primary-foreground"
              tabIndex={-1}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
 
      <div className="relative flex w-full justify-center">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.label;
 
          return (
            <Link
              key={index}
              to={tab.href || '#'}
              className={`flex h-8 items-center cursor-pointer rounded-full p-3 text-sm font-medium ${
                isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              } transition-colors`}
              onClick={(e) => {
                if (!tab.href) {
                  e.preventDefault();
                  handleTabClick(tab);
                }
              }}
              ref={isActive ? activeTabRef as any : null}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
