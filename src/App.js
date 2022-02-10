import { useEffect, useState, useRef, useInterval } from "react"
import './App.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {

/*========================= 
==== Variables for API ====
===========================*/

  const stateKey = "currentState"
  const client_id = 'ef2cbefe26f04e3ca1046c1d158c8b8c';
  const redirect_uri = 'http://localhost:3000/callback';

/*========================= 
========= State ===========
===========================*/


  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [recentTracks, setTrackList] = useState(JSON.parse(localStorage.getItem('prevState')) || [])
  const [prevState, setPrevState] = useState(localStorage.getItem('prevState'));
  const titleScreen = useRef()

  useEffect(() => {
    localStorage.setItem('prevState', prevState)
  }, [prevState]);

  const searchTracks = async (e) => {
    e.preventDefault()
        await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=20", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }).then(response => createTrackList(response.data.items))
  }

  const createTrackList = (recentTracks) => {
    setTrackList(recentTracks.map(recentTracks => (
      {
        'trackName': recentTracks.track.name,
        'artist': recentTracks.track.artists[0].name,
        'albumImgs': recentTracks.track.album.images,
        'albumImg': recentTracks.track.album.images[0].url,
        'trackId': recentTracks.track.id
      }
    )))
  }

/*========================= 
=== RETRIVING USER DATA ====
===========================*/

// A random string to protect from cross-site request forgery.

  var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const state = generateRandomString(16);

// A random string to protect from cross-site request forgery.

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

    // store login details.

    if (!token && userUrl) {
      token = userUrl.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
      window.location.hash = ""
      window.localStorage.setItem("token", token)

    }
    setToken(token)
  }, [])

// remove login details so token and state can not be retrieved.

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
    window.localStorage.removeItem("prevState")
    setTrackList([])

  }


/*========================= 
===== CREATE TRACKS========
===========================*/
  
  const renderTracks = () => {
    return recentTracks.map(track => (
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


//Save previously listened to songs so filter works after refresh
// A possible update is needed to hide previously listened to data after user has left

  useEffect(() => {
    (recentTracks.length > 0) ? titleScreen.current.style.display = "none" : titleScreen.current.style.display = "flex"
  }, [recentTracks])


//set interval to check if API response is different from current recentTracks and then update accordingly

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.log(searchTracks)
  //     (recentTracks ==)
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  /*========================= 
===== CREATE SIDEBAR ========
===========================*/

   const renderArtists = () => {
    let trackCheck = []
    return <>
      <div className="sidebar" >
        <h2>Spotify React:</h2>
        <div className="sidebarBtns">   <button onClick={logout}>Logout</button>
          <button type={"submit"} onClick={searchTracks}>Reset</button> </div>
        <div className="artists">
          <h3 style={{ color: 'white' }}>Recent Artists:</h3>

          {recentTracks.map(track => {
            if (!trackCheck.includes(track.artist)) {
                          trackCheck.push(track.artist);
              return <a key={track.trackId} onClick={filterArtists} style={{ marginTop: "5px", marginBottom: "5px" }} >{track.artist}</a>
            }
          })}
        </div>
      </div>
    </>

  }

   /*========================= 
========= CREATE FILTER ========
===========================*/

  const filterArtists = (e) => {
    let newTrackList = []
    for (let index = 0; index < recentTracks.length; index++) {
      (recentTracks[index].artist == e.target.text) ? newTrackList.push(recentTracks[index]) : console.log(null)
    }
    setPrevState(JSON.stringify(newTrackList))
    setTrackList(newTrackList)
  }

 
   /*========================= 
========= CREATE APP ========
===========================*/

  return (
    <div className="App">
          <header ref={titleScreen} className="App-header">
        <h1 style={{ marginBottom: '20px' }}>Spotify React:</h1>
        <div className="headerBtns">
          {!token ?
            <a href={`${url}`}>Login to Spotify</a> : <button onClick={logout}>Logout</button>
          }
          {token ?
            <button onClick={searchTracks}>Load</button> : null
          }
        </div>
      </header>
      <div className="trackBody">
        <div className="recentlyPlayedTracks">
          {renderTracks()}
        </div>
        {(recentTracks.length > 0) ? renderArtists() : null}
      </div>
   
    </div >
  );
}

export default App;
