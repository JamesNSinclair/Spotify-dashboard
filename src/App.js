import { useEffect, useState, useRef } from "react"
import './App.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {

  var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const stateKey = "banana"
  const client_id = 'ef2cbefe26f04e3ca1046c1d158c8b8c';
  const redirect_uri = 'http://localhost:3000/callback';


  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [track, setTrackList] = useState(JSON.parse(localStorage.getItem('prevState')) || [])
  const [prevState, setPrevState] = useState(localStorage.getItem('prevState'));

  useEffect(() => {
    localStorage.setItem('prevState', prevState)
  }, [prevState]);

  const searchTracks = async (e) => {
    e.preventDefault()
    console.log(token)
    await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=20", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }).then(response => createTrackList(response.data.items))
  }

  const createTrackList = (tracks) => {
    setTrackList(tracks.map(track => (
      {
        'trackName': track.track.name,
        'artist': track.track.artists[0].name,
        'albumImgs': track.track.album.images,
        'albumImg': track.track.album.images[0].url,
        'trackId': track.track.id
      }
    )))
  }

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
    window.localStorage.removeItem("prevState")
    setTrackList([])

  }

  const renderTracks = () => {
    return track.map(track => (
      <div artist={track.artist} key={track.trackId}>
        {track.albumImgs ? <img src={track.albumImg} alt="" className="tracks" /> : <div>No image</div>
        }
        <div className="trackCard">
          <p style={{ fontWeight: "800" }}>{track.artist}</p>
          <p style={{ fontStyle: "italic" }}>{track.trackName}</p>
        </div>
      </div>

    ))
  }


  useEffect(() => {
    (track.length > 0) ? titleScreen.current.style.display = "none" : titleScreen.current.style.display = "flex"
  }, [track])

  const filterArtists = (e) => {
    let newTrackList = []
    for (let index = 0; index < track.length; index++) {
      (track[index].artist == e.target.text) ? newTrackList.push(track[index]) : console.log(null)
    }
    setPrevState(JSON.stringify(newTrackList))
    setTrackList(newTrackList)
  }


  const renderArtists = () => {
    let trackCheck = []
    return <>
      <div className="sidebar" >
        <h2>Spotify React:</h2>
        <div className="sidebarBtns">   <button onClick={logout}>Logout</button>
          <button type={"submit"} onClick={searchTracks}>Reset</button> </div>
        <div className="artists">
          <h3 style={{ color: 'white' }}>Recent Artists:</h3>

          {track.map(track => {
            if (!trackCheck.includes(track.artist)) {
              console.log(trackCheck)
              trackCheck.push(track.artist);
              return <a key={track.trackId} onClick={filterArtists} style={{ marginTop: "5px", marginBottom: "5px" }} >{track.artist}</a>
            }
          })}
        </div>
      </div>
    </>

  }



  const titleScreen = useRef()


  return (
    <div className="App">
          <header ref={titleScreen} className="App-header">
        <h1 style={{ marginBottom: '20px' }}>Spotify React:</h1>
        <div className="headerBtns">
          {!token ?
            <a href={`${url}`}>Login to Spotify</a> : <button onClick={logout}>Logout</button>
          }
          {token ?
            <button onClick={searchTracks}>Load</button> : console.log(null)
          }
        </div>
      </header>
      <div className="trackBody">
        <div className="recentlyPlayedTracks">
          {renderTracks()}
        </div>
        {(track.length > 0) ? renderArtists() : null}
      </div>
   
    </div >
  );
}

export default App;
