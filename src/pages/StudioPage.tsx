import React, { useEffect } from 'react';
import { Studio } from 'sanity';
import config from '@/sanity.config';

export default function StudioPage() {
  useEffect(() => {
    // Ensure Studio route is excluded from search engine indexing
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const createdMeta = !meta;
    const previousContent = meta?.content;

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';

    return () => {
      if (createdMeta && meta?.parentNode) {
        meta.parentNode.removeChild(meta);
      } else if (meta && previousContent !== undefined) {
        meta.content = previousContent;
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden m-0 p-0">
      <Studio config={config} />
    </div>
  );
}

