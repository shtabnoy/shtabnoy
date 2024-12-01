import { useFetchArtist, useFetchSpotifyToken } from './api';

function App() {
  const { data: { access_token: accessToken } = {} } = useFetchSpotifyToken();

  const { data } = useFetchArtist('4Z8W4fKeB5YxbusRsdQVPb', accessToken ?? '');
  console.log(data);

  return <div className="text-3xl">The website is under construction</div>;
}

export default App;
