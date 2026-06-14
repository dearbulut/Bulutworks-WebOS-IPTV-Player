interface BrandLogoProps {
  size?: 'normal' | 'large'
}

export default function BrandLogo({ size = 'normal' }: BrandLogoProps) {
  const large = size === 'large'
  return (
    <div className="brand-logo">
      <div className={`brand-logo__mark${large ? ' brand-logo__mark--large' : ''}`}>
        BW
      </div>
      <span className={`brand-logo__text${large ? ' brand-logo__text--large' : ''}`}>
        BULUTWORKS
      </span>
    </div>
  )
}
