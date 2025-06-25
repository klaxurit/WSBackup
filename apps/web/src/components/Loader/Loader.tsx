import '../../styles/components/common/_loader.scss';

const sizeClassMap = {
  desktop: 'desktopLoader',
  mobile: 'mobileLoader',
  panel: 'panelLoader',
  mini: 'miniLoader',
};

type LoaderSize = 'desktop' | 'mobile' | 'panel' | 'mini';

export const Loader = ({
  className = '',
  size = 'desktop',
}: { className?: string; size?: LoaderSize }) => {
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
          stroke="#FFD056"
          strokeLinecap="round"
        />
        <circle
          className="path"
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