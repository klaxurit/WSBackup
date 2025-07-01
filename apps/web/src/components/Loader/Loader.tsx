import '../../styles/components/common/_loader.scss';

const sizeClassMap = {
  desktop: 'desktopLoader',
  mobile: 'mobileLoader',
  small: 'smallLoader',
  panel: 'panelLoader',
  mini: 'miniLoader',
};

type LoaderSize = 'desktop' | 'mobile' | 'panel' | 'mini' | 'small';

export const Loader = ({
  className = '',
  size = 'desktop',
  color = '#FFD056',
}: { className?: string; size?: LoaderSize; color?: string }) => {
  const sizeClass = sizeClassMap[size] || '';
  const combinedClassName = ['Loader', sizeClass, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName}>
      <svg className="circular" viewBox="25 25 50 50">
        <circle
          opacity="0.2"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke={color}
          strokeLinecap="round"
        />
        <circle
          className="path"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke={color}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};