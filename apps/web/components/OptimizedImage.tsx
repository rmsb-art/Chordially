import Image, { ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  fallbackSrc?: string;
};

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <rect width="100%" height="100%" fill="#1a1a2e"/>
    </svg>`
  ).toString("base64");

export function OptimizedImage({ src, alt, fallbackSrc, onError, ...props }: Props) {
  const [imgSrc, setImgSrc] = useState(src);
  const [errored, setErrored] = useState(false);

  function handleError(e: React.SyntheticEvent<HTMLImageElement>) {
    if (!errored && fallbackSrc) {
      setImgSrc(fallbackSrc);
      setErrored(true);
    }
    onError?.(e);
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      placeholder="blur"
      blurDataURL={BLUR_PLACEHOLDER}
      onError={handleError}
      sizes={props.sizes ?? "(max-width: 768px) 100vw, 50vw"}
    />
  );
}

/** Thin wrapper for artist/session cover art with sensible defaults. */
export function ArtworkImage({
  width = 400,
  height = 400,
  ...props
}: Omit<Props, "width" | "height"> & { width?: number; height?: number }) {
  return (
    <OptimizedImage
      {...props}
      width={width}
      height={height}
      style={{ objectFit: "cover", borderRadius: 8, ...props.style }}
    />
  );
}
