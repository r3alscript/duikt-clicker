import styles from '../styles/UpgradePanel.module.scss';

const upgradesList = [
  {
    id: 'click',
    name: 'Click Value',
    price: 10,
    description: 'Increase your credits per click by 1',
    icon: '⬆️'
  },
  {
    id: 'auto',
    name: 'Auto Hack',
    price: 50,
    description: 'Automatically clicks once per second',
    icon: '🪐'
  },
  {
    id: 'crit',
    name: 'Critical Hack',
    price: 100,
    description: 'Chance to get 5x credits on click',
    icon: '✨'
  },
  {
    id: 'passive',
    name: 'Passive Income',
    price: 200,
    description: 'Earn credits over time without clicking',
    icon: '💸'
  },
  {
    id: 'luck',
    name: 'Lucky Boost',
    price: 500,
    description: 'Temporarily doubles your chances for critical hacks',
    icon: '🍀'
  }
];

export default function UpgradePanel({ credits, upgradeClick, upgrades = {} }) {
  return (
    <div className={styles.upgradeGrid}>
      {upgradesList.map((upg) => (
        <div key={upg.id} className={styles.upgradeCard}>
          <h3 className={styles.title}>
            {upg.icon} {upg.name}
          </h3>

          <div className={styles.level}>
            {upgrades[upg.id] || 0} / ∞
          </div>

          <div className={styles.price}>₴{upg.price.toLocaleString()}</div>

          <p className={styles.desc}>{upg.description}</p>

          <div className={styles.buttonWrap}>
            <button
              disabled={credits < upg.price}
              onClick={() => upgradeClick(upg.id, upg.price)}
            >
              Buy
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
