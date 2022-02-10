import { useEffect, useState } from "react"
import './App.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';


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
    await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=10", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }).then(response => createTrackList(response.data.items))
   


  }

const createTrackList = (tracks) => {
 setTrackList(tracks.map(track => (
     {'artist': track.track.artists[0].name, 'albumImgs': track.track.album.images, 'albumImg': track.track.album.images[0].url, 'trackId': track.track.id}
  )))
console.log(track)
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

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
    setTrackList([])

  }

  const renderTracks = () => {

    return track.map(track => (
      <div artist={track.artist} key={track.trackId}>
        {track.albumImgs ? <img src={track.albumImg} alt="" className="tracks"/> : <div>No image</div>
        }
    
      </div>
      
    ))
    
  }

const filterArtists = (e) => {

  let newTrackList = []
  for (let index = 0; index < track.length; index++) {
    

   
   (track[index].artist == e.target.text) ? newTrackList.push(track[index])  : console.log(null)  
 console.log(newTrackList)
  
}
setTrackList(newTrackList)
}

  
 

    const renderArtists = () => {
  
       return    <><button type={"submit"} onClick={searchTracks}>Reset</button> {track.map(track => (

        <a key={track.trackId} onClick={filterArtists} style={{marginTop: "10px", marginBottom: "10px"}} >{track.artist}</a>
      
    ))}
    </>
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React:</h1>
        <div className="headerBtns">
        {!token ?
          <a href={`${url}`}>Login to Spotify</a> : <button onClick={logout}>Logout</button>
        }
        {token ?
          <button onClick={searchTracks}>Load</button>
                  : <h2>Please login</h2>
        }
        </div>
          </header>
        <div style={{overflow:"hidden", display: "flex", justifyContent: "space-around", alignItems: "center"}}>
        <div className="recentlyPlayedTracks">
        {renderTracks()}
        </div>
        <div className="sidebar" >
     
        {    (track.length > 0) ? renderArtists() : null}
        </div>
        </div>

    
    </div >
  );
}

export default App;
