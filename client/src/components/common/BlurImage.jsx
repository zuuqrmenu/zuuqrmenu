import { useState, useRef, useEffect } from 'react';

const BlurImage = ({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setIsLoaded(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

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
      src={src}
      alt={alt}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      className={`blur-image ${isLoaded ? 'blur-image--loaded' : 'blur-image--loading'} ${className}`}
      {...props}
    />
  );
};

export default BlurImage;
