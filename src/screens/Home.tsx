import axios from 'axios';
import { useEffect, useState } from 'react';
import './Home.css';
import { CSSTransition } from 'react-transition-group';
import useScrollBlock from '../hooks/useScrollBlock';
import exampleTrack from '../constants/exampleTrack';
// @ts-ignore
import { ColorExtractor } from 'react-color-extractor';

export default function Home() {
  
  const RESPONSE_TYPE = "token";
  const SCOPES = "user-top-read";
  const REDIRECT_URI = "http://192.168.1.32:3000";
  const CLIENT_ID = "589e96bcdcbb45e0a1424061ed9d4be8";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  
  const [token, setToken] = useState("");
  const [longScore, setLongScore] = useState(0);
  const [shortScore, setShortScore] = useState(0);
  const [mediumScore, setMediumScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [longTrackData, setLongTrackData] = useState([]);
  const [shortTrackData, setShortTrackData] = useState([]);
  const [mediumTrackData, setMediumTrackData] = useState([]);
  const time_ranges = ['short_term', 'medium_term', 'long_term'];
  const time_range_setters = [setShortTrackData, setMediumTrackData, setLongTrackData];
  const [blockScroll, allowScroll] = useScrollBlock();
  const [selectedTrack, setSelectedTrack] = useState(exampleTrack);
  const [backgroundColors, setBackgroundColors] = useState(['#101010','#101010','#101010','#101010','#101010','#101010'])

  function logout () {
    setToken("");
    window.localStorage.removeItem("token");
  };

  async function getTrackData () {
    time_ranges.forEach( async (range, index) => {
      let call = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=' + range, {
      headers: { Authorization: 'Bearer ' + token }})
      time_range_setters[index](call.data.items);
    });
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

  function scoreMessage (score: number) {
    let averaged_score = Math.round(score);
    let message = '';

    if (averaged_score >= 85) { message = 'Basic as Fuck'}
    else if (averaged_score >= 80) { message = 'Extremely Basic'}
    else if (averaged_score >= 75) { message = 'Very Basic'}
    else if (averaged_score >= 70) { message = 'Basic'}
    else if (averaged_score >= 65) { message = 'Slightly Basic'}
    else if (averaged_score >= 60) { message = 'Average'}
    else if (averaged_score >= 55) { message = 'Slightly Unique'}
    else if (averaged_score >= 50) { message = 'Unique'}
    else if (averaged_score >= 45) { message = 'Very Unique'}
    else if (averaged_score >= 40) { message = 'Extremely Unique'}
    else if (averaged_score >= 35) { message = 'Unique as Fuck'};

    return message;
  }

  function colorScore (score: number) {
    let averaged_score = Math.round(score);
    let color = 'white';

    if (averaged_score >= 70) { color = 'red'}
    else if (averaged_score >= 65) { color = 'orange'}
    else if (averaged_score >= 60) { color = 'yellow'}
    else if (averaged_score >= 55) { color = 'greenyellow'}
    else { color = 'green'}

    return color;
  }

  async function trackModal (track: any) {
    if (!showModal) {
      setSelectedTrack(track);
      blockScroll();
      setTimeout(() => {
        setShowModal(!showModal)
      }, 500);
    } else {
      setShowModal(!showModal)
      setTimeout(() => {
        allowScroll();
      }, 250);
    }

  }

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');
    // let token = null
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
    <>
     <CSSTransition in={showModal} timeout={200} classNames="modal">
        <div className="modalContainer" 
          style={{ backgroundImage: `linear-gradient(180deg,rgba(${backgroundColors[0][0]},${backgroundColors[0][1]},${backgroundColors[0][2]}, 0.8), rgba(0, 0, 0, 0.8))`}}
          onClick={(e) => { if (e.currentTarget === e.target) {trackModal(false)} } }
        >
          <div className="trackModal">
            <div className="closeIcon" onClick={() => {trackModal(false)}}>
              <svg width="36px" height="36px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="white" d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"/>
              </svg>
            </div>
            <ColorExtractor rgb getColors={(colors: any) => setBackgroundColors(colors)}>
              <img src={selectedTrack.album.images[0].url} />
            </ColorExtractor>
            <div>
              <h1>{selectedTrack.name}</h1>
              <h2>{selectedTrack.album.name}</h2>
              <h2>{ selectedTrack.album.artists.map(
                (artist, index) => { return index === 0 ? artist.name : ', ' + artist.name }
              )}</h2>
            </div>
            <div className='moreInfo'>
              { showModal ?
                <audio controls> 
                  <source src={selectedTrack.preview_url} type="audio/ogg" />
                  Your browser does not support the audio element.
                </audio>
              : null }
            </div>
          </div>
        </div> 
      </CSSTransition>
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
                <h2 style={{color: colorScore(longScore) }}>{Math.round(longScore)}</h2>
                <h2 style={{color: colorScore(longScore) }}>{scoreMessage(longScore)}</h2>
              </div>
              <div>
              <h3>Last 6 Months</h3>
                <h2 style={{color: colorScore(mediumScore) }}>{Math.round(mediumScore)}</h2>
                <h2 style={{color: colorScore(mediumScore) }}>{scoreMessage(mediumScore)}</h2>
              </div>
              <div>
                <h3>Last 4 Weeks</h3>
                <h2 style={{color: colorScore(shortScore) }}>{Math.round(shortScore)}</h2>
                <h2 style={{color: colorScore(shortScore) }}> {scoreMessage(shortScore)}</h2>
              </div>
            </div>
            <h1 className="headerPadding">Top Tracks - Last Year</h1>
            <div className="trackList">
              
              {console.log(longTrackData)}
              { 
              longTrackData.map((track: any, index) => {
                return (
                  <div className="track noselect" key={index.toString()} onClick={(e) => { trackModal(track) }}> 
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
    </>
  );
}

