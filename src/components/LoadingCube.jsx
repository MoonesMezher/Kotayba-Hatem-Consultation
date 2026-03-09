/**
 * Rubik-style loading cube: 3x3 grid with mixed shades of the main color, animated.
 */
export default function LoadingCube({ size = 'md', className = '' }) {
  const isLarge = size === 'lg'
  const cellSize = isLarge ? 'w-4 h-4' : 'w-2 h-2'
  const gap = isLarge ? 'gap-0.5' : 'gap-px'
  const shades = [
    'bg-[var(--color-primary)]',
    'bg-[var(--color-primary)]/80',
    'bg-[var(--color-primary)]/60',
    'bg-[var(--color-primary)]/90',
    'bg-[var(--color-primary)]',
    'bg-[var(--color-primary)]/70',
    'bg-[var(--color-primary)]/50',
    'bg-[var(--color-primary)]/85',
    'bg-[var(--color-primary)]/75',
  ]

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div
        className={`grid grid-cols-3 ${gap} rounded-sm p-0.5 border border-[var(--color-primary)]/30 bg-[var(--color-dark)] animate-loading-cube`}
        style={{ width: 'fit-content' }}
      >
        {shades.map((shade, i) => (
          <div key={i} className={`${cellSize} rounded-sm ${shade}`} />
        ))}
      </div>
    </div>
  )
}
