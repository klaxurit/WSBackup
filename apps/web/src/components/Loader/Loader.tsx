export const Loader = ({ className = "" }) => {
  const combinedClassName = `${'Loader'} ${className.split(' ').map(cn => cn).join(' ')}`;

  return (
    <div className={combinedClassName}>
      <svg className={'circular'} viewBox="25 25 50 50">
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
          className={'path'}
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