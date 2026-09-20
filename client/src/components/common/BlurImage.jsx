import { useState, useRef, useEffect } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

const BlurImage = ({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  onLoad,
  onError,
  width,
  height,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  const optimizedSrc = getOptimizedImageUrl(src, { width: width ? Math.round(Number(width) * 2) : 1200, quality: 'auto:best' });

  useEffect(() => {
    setIsLoaded(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src, optimizedSrc]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setIsLoaded(true);
    if (onError) onError(e);
  };

  return (
    <img
      ref={imgRef}
      src={optimizedSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      className={`blur-image ${isLoaded ? 'blur-image--loaded' : 'blur-image--loading'} ${className}`}
      {...props}
    />
  );
};

export default BlurImage;
