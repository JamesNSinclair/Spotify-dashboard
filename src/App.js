import { useEffect, useState } from "react"
import './App.css';
import axios from 'axios';


function App() {

  function generateRandomString() {
    return '55'
  }

  const stateKey = "banana"
  const client_id = 'ef2cbefe26f04e3ca1046c1d158c8b8c';
  const redirect_uri = 'http://localhost:3000/callback';


  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [track, setTrackList] = useState([])


  const searchTracks = async (e) => {
    e.preventDefault()
    console.log(token)
    await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=10&after=1484811043508", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }).then(response => setTrackList(response.data.items))
   

  }




  // "https://api.spotify.com/v1/me/player/recently-played?limit=10&after=1484811043605" - H "Accept: application/json" - H "Content-Type: application/json"

  const state = generateRandomString(16);

  localStorage.setItem(stateKey, state);
  const scope = 'user-read-recently-played';

  let url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(client_id);
  url += '&scope=' + encodeURIComponent(scope);
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
  url += '&state=' + encodeURIComponent(state);

  useEffect(() => {
    const userUrl = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && userUrl) {
      token = userUrl.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
      window.location.hash = ""
      window.localStorage.setItem("token", token)

    }
    setToken(token)
  }, [])

  const logout = () => {``
    setToken("")
    window.localStorage.removeItem("token")
  }

  const renderTracks = () => {

    return track.map(track => (
      <div key={track.track.id}>
        {track.track.album.images ? <img src={track.track.album.images[0].url} alt="" style={{height: "300px", width: "300px", margin: "15px"}}/> : <div>No image</div>
        }
        {track.name}
      </div>
      
    ))
    
  }

  const filterSongs = () => {
     
  }

    const renderArtists = () => {
       return track.map(track => (
      <div style={{marginTop: "10px", marginBottom: "10px"}} key={track.track.id}>
        <a onClick={filterSongs}>{track.track.artists[0].name }</a>
        
      </div>
    ))
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React </h1>
        {!token ?
          <a href={`${url}`}>Login to Spotify</a> : <button onClick={logout}>Logout</button>
        }
        {token ?
          <form onSubmit={searchTracks}>
            <input type="text" onChange={e => setSearchKey(e.target.value)} />
            <button type={"submit"}> Search</button>
          </form>
          : <h2>Please login</h2>
        }
        <div style={{overflow:"hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{height:"100%", overflow:"hidden", display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {renderTracks()}
        </div>
        <div>
        {renderArtists()}
        </div>
        </div>

      </header>
    </div >
  );
}

export default App;
