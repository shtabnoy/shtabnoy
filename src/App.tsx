import { useFetchSpotifyToken } from './api';

function App() {
  const { data } = useFetchSpotifyToken();
  console.log(data);
  return <div className="text-3xl">The website is under construction</div>;
}

export default App;
