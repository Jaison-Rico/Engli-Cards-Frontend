import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';

const FALLBACK_IMAGE = require('../../assets/logo.png');

export default function CachedImage({
  uri,
  style,
  contentFit = 'cover',
  ...props
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  if (!uri || hasError) {
    return <Image source={FALLBACK_IMAGE} style={style} contentFit="contain" {...props} />;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      transition={200}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
