import { useQuery } from '@tanstack/react-query';
import { SpotifyToken } from '../types';

const fetchSpotifyToken = async (): Promise<SpotifyToken> => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? '',
      client_secret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET ?? '',
    }),
  });

  if (!response.ok) throw new Error('Failed to fetch Spotify token');
  return response.json();
};

export const useFetchSpotifyToken = () => {
  return useQuery<SpotifyToken>({
    queryKey: ['fetchSpotifyToken'],
    queryFn: fetchSpotifyToken,
    staleTime: ({ state }) => 1000 * (state.data?.expires_in ?? 0),
  });
};

const fetchArtist = async (id: string, token: string) => {
  const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to fetch artist');
  return response.json();
};

export const useFetchArtist = (id: string, token: string) => {
  return useQuery({
    queryKey: ['fetchArtist', id],
    queryFn: () => fetchArtist(id, token),
    enabled: !!token,
  });
};
