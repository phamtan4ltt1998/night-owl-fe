import { useEffect, useRef } from 'react';

export default function AdBanner({ adSlot, adClient, width = 140, height = 600 }) {
  const ref = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !ref.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {}
  }, []);

  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: 'block', width, height }}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format="fixed"
    />
  );
}
