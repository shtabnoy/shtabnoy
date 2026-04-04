'use client';

import Link from 'next/link';
import { useFetchSpotifyToken, useFetchArtist } from '@/lib/api/spotify';

export default function ThirtyThreeByThirtyThree() {
  const { data: { access_token: accessToken } = {} } = useFetchSpotifyToken();
  const { data } = useFetchArtist('4Z8W4fKeB5YxbusRsdQVPb', accessToken ?? '');
  console.log(data);

  return (
    <div className="min-h-screen bg-bg text-primary font-body flex flex-col items-center justify-center px-8">
      <div className="max-w-content w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-[13px] text-muted mb-12 hover:text-accent hover:opacity-100 transition-colors"
        >
          ← back home
        </Link>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight mb-4">
          33 by 33
        </h1>
        <p className="text-muted text-[1.05rem] mb-8">
          The website is under construction.
        </p>
      </div>
    </div>
  );
}
