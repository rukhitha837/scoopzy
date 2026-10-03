import { useEffect, useState } from 'react';
import { assetUrl } from '../api.js';

/** Shows the image if it loads, otherwise falls back to the emoji on the gradient background. */
export default function ProductImage({ src, emoji, alt = '', className = '', style }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <div className={`product-image ${className}`} style={style}>
      {src && !failed ? (
        <img src={assetUrl(src)} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="product-emoji">{emoji}</span>
      )}
    </div>
  );
}
