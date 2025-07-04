export const FallbackImg = ({
  content,
  className,
  style,
  width = 32,
  height = 32,
}: {
  content: string,
  className?: string,
  style?: React.CSSProperties,
  width?: number,
  height?: number,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className={className}
      style={style}
    >
      <circle cx="50" cy="50" r="50" fill="#000000" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={28}
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        {content}
      </text>
    </svg>
  )
}
