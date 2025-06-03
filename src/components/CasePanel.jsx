import styles from '../styles/CasePanel.module.scss';
import basicIcon from '../assets/basic.png';
import rareIcon from '../assets/rare.png';
import epicIcon from '../assets/epic.png';
import skinIcon from '../assets/skin.png';
import { useEffect, useState, useRef } from 'react';

export default function CasePanel({ gameState, setGameState }) {
  const { credits, caseStats = {}, lastCaseReward } = gameState;
  const [remainingTime, setRemainingTime] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const reward = lastCaseReward;
    if (
      reward?.type === 'clickValueMultiply' &&
      reward?.activatedAt &&
      reward?.duration
    ) {
      const now = Date.now();
      const elapsed = now - reward.activatedAt;
      const timeLeft = Math.max(0, reward.duration - elapsed);

      if (timeLeft <= 0) {
        // Бонус завершився — скидаємо
        setGameState(prev => ({
          ...prev,
          clickValue: reward.originalClickValue ?? 1,
          lastCaseReward: null,
        }));
        return;
      }

      setRemainingTime(Math.ceil(timeLeft / 1000));

      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const newLeft = Math.ceil((reward.activatedAt + reward.duration - Date.now()) / 1000);
        if (newLeft <= 0) {
          clearInterval(intervalRef.current);
          setRemainingTime(0);
          setGameState(prev => ({
            ...prev,
            clickValue: reward.originalClickValue ?? 1,
            lastCaseReward: null,
          }));
        } else {
          setRemainingTime(newLeft);
        }
      }, 1000);
    } else {
      setRemainingTime(0);
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [lastCaseReward, setGameState]);

  const cases = [
    {
      id: 'basic',
      name: 'Basic Case',
      description: 'Common rewards with a small chance for something special',
      price: 100,
      icon: basicIcon,
    },
    {
      id: 'rare',
      name: 'Rare Case',
      description: 'Better chance for good rewards',
      price: 1000,
      icon: rareIcon,
    },
    {
      id: 'epic',
      name: 'Epic Case',
      description: 'High value guaranteed',
      price: 10000,
      icon: epicIcon,
    },
    {
      id: 'skin',
      name: 'Skin Case',
      description: 'Unlock cool game skins',
      price: 500000,
      icon: skinIcon,
    },
  ];

  const openCase = (c) => {
    if (credits < c.price) return;

    const rewards = [
      { label: '💰 +100 credits', type: 'credits', value: 100 },
      { label: '⚙️ +1 auto click for 60s', type: 'autoClickClone', value: 1, duration: 60000 },
      { label: '🟢 +1 credit click power', type: 'clickValue', value: 1 },
      { label: '🌀 x2 click power for 30s', type: 'clickValueMultiply', value: 2, duration: 30000 },
      { label: '🐞 Halved click power for 15s', type: 'clickValueMultiply', value: 0.5, duration: 15000 },
      { label: '💥 -50 credits', type: 'credits', value: -50 },
      { label: '❌ Nothing...', type: 'none' },
    ];

    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    if (reward.type === 'clickValueMultiply') {
      const now = Date.now();

      setGameState(prev => {
        const originalClickValue = prev.clickValue ?? 1;
        const newClickValue = Math.max(1, Math.round(originalClickValue * reward.value));
        return {
          ...prev,
          clickValue: newClickValue,
          lastCaseReward: {
            ...reward,
            originalClickValue,
            activatedAt: now,
          },
        };
      });
    } else if (reward.type === 'autoClickClone') {
      setGameState(prev => {
        const tempAuto = (prev.temporaryAutoClickMultiplier || 0) + reward.value;

        setTimeout(() => {
          setGameState(curr => ({
            ...curr,
            temporaryAutoClickMultiplier: Math.max(0, (curr.temporaryAutoClickMultiplier || 0) - reward.value),
            lastCaseReward: null,
          }));
        }, reward.duration);

        return {
          ...prev,
          temporaryAutoClickMultiplier: tempAuto,
          lastCaseReward: reward,
        };
      });
    } else {
      setGameState(prev => {
        const updatedStats = {
          ...(prev.stats || {}),
          totalCasesOpened: (prev.stats?.totalCasesOpened || 0) + 1,
        };
        const updatedCaseStats = {
          ...prev.caseStats,
          [c.id]: (prev.caseStats?.[c.id] || 0) + 1,
        };

        let newCredits = prev.credits - c.price;
        let newAutoClickers = prev.autoClickers ?? 0;
        let newClickValue = prev.clickValue ?? 1;

        if (reward.type === 'credits') {
          newCredits += reward.value;
        } else if (reward.type === 'autoClicker') {
          newAutoClickers = Math.max(0, newAutoClickers + reward.value);
        } else if (reward.type === 'clickValue') {
          newClickValue += reward.value;
        }

        return {
          ...prev,
          credits: newCredits,
          autoClickers: newAutoClickers,
          clickValue: newClickValue,
          stats: updatedStats,
          caseStats: updatedCaseStats,
          lastCaseReward: reward,
        };
      });
    }

    setTimeout(() => {
      alert(`🎁 You opened ${c.name}!\nReward: ${reward.label}`);
    }, 50);
  };

  return (
    <>
      <div className={styles.caseGrid}>
        {cases.map((c) => (
          <div key={c.id} className={styles.caseCard}>
            <img src={c.icon} alt={c.name} className={styles.icon} />
            <h3>{c.name}</h3>
            <p className={styles.desc}>{c.description}</p>
            <p className={styles.price}>₴{c.price.toLocaleString()}</p>
            <p className={styles.progress}>
              Opened: <span>{caseStats?.[c.id] || 0}</span>
            </p>
            <div className={styles.buttonWrap}>
              <button disabled={credits < c.price} onClick={() => openCase(c)}>
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
