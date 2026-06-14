import logoSrc from '../assets/bulutworks-logo.png'

interface BrandLogoProps {
  size?: 'normal' | 'large'
}

export default function BrandLogo({ size = 'normal' }: BrandLogoProps) {
  const large = size === 'large'
  return (
    <div className="brand-logo">
      <img
        className={`brand-logo__img${large ? ' brand-logo__img--large' : ''}`}
        src={logoSrc}
        alt="BulutWorks"
      />
      <span className={`brand-logo__text${large ? ' brand-logo__text--large' : ''}`}>
        BULUTWORKS
      </span>
    </div>
  )
}
