import styles from './loader.module.scss';

export const Loader = ({ className = "" }) => {
  const combinedClassName = `${styles.Loader} ${className.split(' ').map(cn => styles[cn] || cn).join(' ')}`;

  return (
    <div className={combinedClassName}>
      <svg className={styles.circular} viewBox="25 25 50 50">
        <circle
          opacity="0.2"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke="#FFD056"
          strokeLinecap="round"
        />
        <circle
          className={styles.path}
          cx="50"
          cy="50"
          r="20"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}; 