import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './Home.css';

export default function Home() {
  
  const CLIENT_ID = "589e96bcdcbb45e0a1424061ed9d4be8";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPES = "user-top-read";
  
  const [token, setToken] = useState("");
  const [shortTrackData, setShortTrackData] = useState([]);
  const [mediumTrackData, setMediumTrackData] = useState([]);
  const [longTrackData, setLongTrackData] = useState([]);
  const [shortScore, setShortScore] = useState(0);
  const [mediumScore, setMediumScore] = useState(0);
  const [longScore, setLongScore] = useState(0);

  function logout () {
    setToken("");
    window.localStorage.removeItem("token");
  };

  async function getTrackData () {
    const short = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const medium = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const long = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    setShortTrackData(short.data.items);
    setMediumTrackData(medium.data.items);
    setLongTrackData(long.data.items);
  }

  function calculateScores (data: Array<any>, setter: Function) {
    let pop_total = 0;
    let track_total = 0;
    data.forEach((track: any) => {
      track_total += 1;
      pop_total += track.popularity;
    });
    setter((pop_total / track_total));
  }

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");
    if (token === null) {
      token = '';
    }
    if (!token && hash) {
      // @ts-ignore
      token = hash.substring(1).split("&").find(e => e.startsWith("access_token")).split("=")[1];
      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }
    setToken(token);
  }, [])
  
  // Gathers Track Data when token is set.
  useEffect(() => {
    if (token && shortTrackData.length < 1) {
      getTrackData();
    }
  }, [token])

  // Calculates score
  useEffect(() => {
    if (longTrackData.length > 0) {
      calculateScores(shortTrackData, setShortScore);
      calculateScores(mediumTrackData, setMediumScore);
      calculateScores(longTrackData, setLongScore);
    }
  }, [longTrackData])

  return (
    <div className="Home">
      { !token ?
      <div className='score'>
        <h1>Spotify Uniqueness Calculator</h1>
        <p>Welcome to the Spotify Uniqueness Calculator. This page will tell you exactly how unique your taste in music actually is. To calculator your score please login to your spotify account using the button below.</p>
        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`} className="button">Login to Spotify</a>
      </div>
      :
      <div className='score'>
        <h1>Your Uniqueness Scores</h1>
        <p>Your 3 uniqueness scores below are calculated by taking the popularity of your 50 most listened to tracks during taht time period and averaging them. </p>
        <div className='scoreDisplay'>
          <div>
            <h3>Last Year</h3>
            <h2>{longScore}</h2>
          </div>
          <div>
          <h3>Last 6 Months</h3>
            <h2>{mediumScore}</h2>
          </div>
          <div>
            <h3>Last 4 Weeks</h3>
            <h2>{shortScore}</h2>
          </div>
        </div>
        <h1>Top Tracks</h1>
        <div className="trackList">
          
          {/* {console.log(longTrackData)} */}
          { 
          longTrackData.map((track: any, index) => {
            return (
              <div className="track">
                {/* <h1>{index + 1 < 10 ? '\u00A0' : null}{index + 1}.</h1> */}
                <img src={track.album.images[2].url} />
                <div>
                  <h2>{track.name}</h2>
                  <h3>{track.album.name}</h3>
                </div>
                

              </div>
            );
          })
          }
        </div>



        {/* <button onClick={logout} className="button">Logout</button> */}
      </div>
      }
    </div>
  );
}
