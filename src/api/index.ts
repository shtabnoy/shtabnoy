import { useQuery } from '@tanstack/react-query';
import { SpotifyToken } from '../types';

const fetchSpotifyToken = async (): Promise<SpotifyToken> => {
  const grantType = 'client_credentials';
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: grantType,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const useFetchSpotifyToken = () => {
  return useQuery<SpotifyToken>({
    queryKey: ['fetchSpotifyToken'],
    queryFn: fetchSpotifyToken,
    staleTime: ({ state }) => {
      return 1000 * (state.data?.expires_in ?? 0);
    },
  });
};

const fetchArtist = async (id: string, token: string) => {
  const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const useFetchArtist = (id: string, token: string) => {
  return useQuery({
    queryKey: ['fetchArtist', id],
    queryFn: () => fetchArtist(id, token),
    enabled: !!token,
  });
};
