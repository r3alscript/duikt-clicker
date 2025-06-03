import { useEffect } from 'react';

export const useClicker = (gameState, setGameState) => {
  const { credits, clickValue, clickMultiplier = 1 } = gameState;

  const handleClick = () => {
    const value = (clickValue ?? 1) * (clickMultiplier ?? 1);

    setGameState(prev => {
      const totalCreditsEarned = (prev.allTimeStats?.totalCreditsEarned || 0) + value;
      const totalClicks = (prev.allTimeStats?.totalClicks || 0) + 1;

      return {
        ...prev,
        credits: prev.credits + value,
        allTimeStats: {
          ...prev.allTimeStats,
          totalCreditsEarned,
          totalClicks,
          upgradesBought: prev.allTimeStats?.upgradesBought || 0,
          casesOpened: prev.allTimeStats?.casesOpened || 0
        }
      };
    });
  };

  const upgradeClick = () => {
    const upgradeCost = 10;
    if (credits >= upgradeCost) {
      setGameState(prev => {
        const newUpgradesBought = (prev.allTimeStats?.upgradesBought || 0) + 1;

        return {
          ...prev,
          credits: prev.credits - upgradeCost,
          clickValue: (prev.clickValue || 1) + 1,
          allTimeStats: {
            ...prev.allTimeStats,
            totalCreditsEarned: prev.allTimeStats?.totalCreditsEarned || 0,
            totalClicks: prev.allTimeStats?.totalClicks || 0,
            upgradesBought: newUpgradesBought,
            casesOpened: prev.allTimeStats?.casesOpened || 0
          }
        };
      });
    }
  };

  const openCase = () => {
    setGameState(prev => {
      const newCasesOpened = (prev.allTimeStats?.casesOpened || 0) + 1;
      return {
        ...prev,
        allTimeStats: {
          ...prev.allTimeStats,
          totalCreditsEarned: prev.allTimeStats?.totalCreditsEarned || 0,
          totalClicks: prev.allTimeStats?.totalClicks || 0,
          upgradesBought: prev.allTimeStats?.upgradesBought || 0,
          casesOpened: newCasesOpened
        }
      };
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const multiplier = prev.clickMultiplier ?? 1;
        const clickValue = prev.clickValue ?? 1;
        const autoClickers = prev.autoClickers ?? 0;

        const autoCredits = autoClickers * clickValue * multiplier;

        return {
          ...prev,
          credits: prev.credits + autoCredits
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setGameState]);

  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      allTimeStats: {
        totalCreditsEarned: prev.allTimeStats?.totalCreditsEarned ?? 0,
        totalClicks: prev.allTimeStats?.totalClicks ?? 0,
        upgradesBought: prev.allTimeStats?.upgradesBought ?? 0,
        casesOpened: prev.allTimeStats?.casesOpened ?? 0
      }
    }));
  }, []);

  return {
    credits,
    clickValue,
    clickMultiplier,
    handleClick,
    upgradeClick,
    openCase
  };
};
