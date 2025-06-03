import { useState, useEffect } from 'react';
import { db } from './db/db';
import { useSaveProgress } from './hooks/useSaveProgress';
import ClickButton from './components/ClickButton';
import Tabs from './components/Tabs';
import PrestigeButton from './features/prestige/PrestigeButton';
import styles from './styles/App.module.scss';

const availableSkins = [
  { id: 'neon', name: 'Neon', buttonColor: '#39ff14', backgroundColor: 'linear-gradient(135deg, #0f0f0f, #1a1a1a, #8000ff)', price: 1000, className: 'theme-neon' },
  { id: 'gold', name: 'Gold', buttonColor: '#FFD700', backgroundColor: 'linear-gradient(135deg, #1a1200, #3b2f00, #FFD700)', price: 2500, className: 'theme-gold' },
  { id: 'ocean', name: 'Ocean', buttonColor: '#00bfff', backgroundColor: 'linear-gradient(135deg, #001f3f, #004080, #00bfff)', price: 4000, className: 'theme-ocean' },
  { id: 'inferno', name: 'Inferno', buttonColor: '#ff4500', backgroundColor: 'linear-gradient(135deg, #2b0000, #5a0000, #ff4500)', price: 6000, className: 'theme-inferno' },
  { id: 'cyberpunk', name: 'Cyberpunk', buttonColor: '#ff00ff', backgroundColor: 'linear-gradient(135deg, #0a0a23, #2e003e, #ff00ff)', price: 8000, className: 'theme-cyberpunk' },
  { id: 'galaxy', name: 'Galaxy', buttonColor: '#8a2be2', backgroundColor: 'linear-gradient(135deg, #000018, #1b003b, #8a2be2)', price: 10000, className: 'theme-galaxy' },
];

function App() {
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);

useEffect(() => {
  const reward = gameState?.lastCaseReward;
  if (!reward?.duration || !reward?.activatedAt) return;

  const endTime = reward.activatedAt + reward.duration;
  const interval = setInterval(() => {
    const secondsLeft = Math.ceil((endTime - Date.now()) / 1000);
    setRemainingTime(secondsLeft > 0 ? secondsLeft : 0);
    if (secondsLeft <= 0) clearInterval(interval);
  }, 1000);

  return () => clearInterval(interval);
}, [gameState?.lastCaseReward]);

 useEffect(() => {
  const load = async () => {
    const saved = await db.progress.get('state');
    let state = saved?.value ?? {
      credits: 0,
      clickValue: 1,
      upgrades: { click: 0, auto: 0, crit: 0, passive: 0 },
      caseStats: { basic: 0, rare: 0, epic: 0, skin: 0 },
      skins: { unlocked: [], active: null },
      prestige: { robocoins: 0, bonusPercent: 0 },
      stats: {
        totalClicks: 0,
        totalCreditsEarned: 0,
        totalCasesOpened: 0,
        totalUpgrades: 0,
      },
    };

    const reward = state.lastCaseReward;
    if (
      reward?.type === 'clickValueMultiply' &&
      reward?.activatedAt &&
      reward?.duration
    ) {
      const now = Date.now();
      const endTime = reward.activatedAt + reward.duration;
      if (now >= endTime) {
        state.clickValue = reward.originalClickValue ?? 1;
        state.lastCaseReward = null;
      }
    }

    setGameState(state);
    setIsLoading(false);
  };
  load();
}, []);

  useSaveProgress(gameState);

  const handleClick = () => {
    const isCrit = Math.random() < (gameState?.upgrades?.crit || 0) * 0.05;
    const multiplier = isCrit ? 5 : 1;
    const bonusMultiplier = 1 + (gameState?.prestige?.bonusPercent || 0) / 100;
    const earned = (gameState?.clickValue || 1) * multiplier * bonusMultiplier;

    setGameState((prev) => ({
      ...prev,
      credits: prev.credits + earned,
      stats: {
        ...(prev.stats || {}),
        totalClicks: (prev.stats?.totalClicks || 0) + 1,
        totalCreditsEarned: (prev.stats?.totalCreditsEarned || 0) + earned,
      },
    }));
  };

  const upgradeClick = (type, price) => {
    if (gameState.credits < price) return;

    setGameState((prev) => {
      const upgrades = { ...prev.upgrades };
      upgrades[type] += 1;

      return {
        ...prev,
        credits: prev.credits - price,
        clickValue: type === 'click' ? prev.clickValue + 1 : prev.clickValue,
        upgrades,
        stats: {
          ...(prev.stats || {}),
          totalUpgrades: (prev.stats?.totalUpgrades || 0) + 1,
        },
      };
    });
  };

  const handleCaseOpened = (type) => {
    setGameState((prev) => {
      const newCaseStats = { ...prev.caseStats };
      newCaseStats[type] += 1;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          totalCasesOpened: prev.stats.totalCasesOpened + 1,
        },
        caseStats: newCaseStats,
      };
    });
  };

  useEffect(() => {
    if (!gameState?.upgrades?.auto) return;
    const interval = setInterval(() => {
      const bonusMultiplier = 1 + (gameState.prestige?.bonusPercent || 0) / 100;
      const earned = gameState.upgrades.auto * bonusMultiplier;
      setGameState((prev) => ({
        ...prev,
        credits: prev.credits + earned,
        stats: {
          ...prev.stats,
          totalCreditsEarned: prev.stats.totalCreditsEarned + earned,
        },
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState?.upgrades?.auto, gameState?.prestige?.bonusPercent]);

  useEffect(() => {
    if (!gameState?.upgrades?.passive) return;
    const interval = setInterval(() => {
      const bonusMultiplier = 1 + (gameState.prestige?.bonusPercent || 0) / 100;
      const earned = gameState.upgrades.passive * 2 * bonusMultiplier;
      setGameState((prev) => ({
        ...prev,
        credits: prev.credits + earned,
        stats: {
          ...prev.stats,
          totalCreditsEarned: prev.stats.totalCreditsEarned + earned,
        },
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [gameState?.upgrades?.passive, gameState?.prestige?.bonusPercent]);

  if (isLoading) {
    return <p className={styles.loading}>⏳ Loading progress...</p>;
  }

  const activeSkin = gameState.skins?.active;
  const selectedSkin = availableSkins.find((s) => s.id === activeSkin);
  const skinClass = selectedSkin?.className || '';
  const btnColor = selectedSkin?.buttonColor || '#4CAF50';
  const bgStyle = selectedSkin?.backgroundColor
    ? { background: selectedSkin.backgroundColor, minHeight: '100vh' }
    : {};

  return (
    <div className={`${styles.appContainer} ${skinClass}`} style={bgStyle}>
      <h1>🎮 Clicker Game</h1>
      {remainingTime > 0 && (
        <p className={styles.timer}>⏳ {remainingTime}s left</p>
      )}
      <p>Credits: {Math.floor(gameState.credits)}</p>

      <div className={styles.section}>
        <ClickButton
          onClick={handleClick}
          value={Math.floor(gameState.clickValue * (1 + (gameState?.prestige?.bonusPercent || 0) / 100))}
          color={btnColor}
        />
      </div>

      <PrestigeButton gameState={gameState} setGameState={setGameState} />

      <Tabs
        gameState={gameState}
        setGameState={setGameState}
        upgradeClick={upgradeClick}
        onCaseOpen={handleCaseOpened}
      />
    </div>
  );
}

export default App;