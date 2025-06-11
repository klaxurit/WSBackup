export const FallbackImg = ({ content }: { content: string }) => {
  return (
    <svg width={32} height={32} viewBox="0 0 100 100" className="rounded-full">
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
