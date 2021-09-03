import React, { useRef, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "./App.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_GL_KEY;

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const [ip, setIp] = useState("");
  const [resultIp, setResultIp] = useState("- -");
  const [location, setLocation] = useState("- -");
  const [timezone, setTimezone] = useState("- -");
  const [isp, setIsp] = useState("- -");

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    map.current.on("load", () => {
      fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((dataIp) => {
          fetch(
            `https://geo.ipify.org/api/v1?apiKey=${process.env.REACT_APP_IPIFY_KEY}&ipAddress=${dataIp.ip}`
          )
            .then((response) => response.json())
            .then((data) => {
              setValues(data);
            })
            .catch((err) =>
              toast.error(err.message, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              })
            );
        });
    });
  });

  const checkIp = (ipcheck) => {
    return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi.test(
      ipcheck
    );
  };

  const searchIp = (e) => {
    e.preventDefault();
    const type = checkIp(ip) ? "ipAddress" : "domain";
    fetch(
      `https://geo.ipify.org/api/v1?apiKey=${process.env.REACT_APP_IPIFY_KEY}&${type}=${ip}`
    )
      .then((response) => response.json())
      .then((data) => {
        setValues(data);
      })
      .catch((err) =>
        toast.error("Please enter a valid IP or domain", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      );
  };

  const setValues = (data) => {
    map.current.flyTo({
      center: [data.location.lng, data.location.lat],
      essential: true,
      zoom: 14,
    });

    new mapboxgl.Marker()
      .setLngLat([data.location.lng, data.location.lat])
      .addTo(map.current);

    setResultIp(data.ip);
    setLocation(
      `${data.location.city}, ${data.location.country} ${data.location.postalCode}`
    );
    setTimezone(`UTC${data.location.timezone}`);
    setIsp(data.isp);
  };

  return (
    <>
      <div className="search-container">
        <h1 className="title">IP Address Tracker</h1>
        <form className="search" onSubmit={(e) => searchIp(e)}>
          <div className="input-group">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search for any IP address or domain"
              onChange={(e) => setIp(e.target.value)}
              required
            />
            <button className="btn btn-dark search-btn" type="submit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
      <div className="results-container">
        <div className="card results-card">
          <div class="container">
            <div class="row row-cols-2 row-cols-lg-4">
              <div class="col">
                <div className="result">
                  <p className="label">IP ADDRESS</p>
                  <span className="value">{resultIp}</span>
                </div>
              </div>
              <div class="col">
                <div className="result">
                  <p className="label">LOCATION</p>
                  <span className="value">{location}</span>
                </div>
              </div>
              <div class="col">
                <div className="result">
                  <p className="label">TIMEZONE</p>
                  <span className="value">{timezone}</span>
                </div>
              </div>
              <div class="col">
                <div className="result last">
                  <p className="label">ISP</p>
                  <span className="value">{isp}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref={mapContainer} className="map-container" />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
