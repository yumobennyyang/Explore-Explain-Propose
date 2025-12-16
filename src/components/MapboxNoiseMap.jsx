import { useEffect, useRef } from 'react';

const MapboxNoiseMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    // Only initialize if mapboxgl is available and map hasn't been created
    if (!window.mapboxgl || map.current) return;

    // Set access token
    window.mapboxgl.accessToken = 'pk.eyJ1IjoieXkzMjA0IiwiYSI6ImNtZGMxbWVvcDB5NjcyaXB1dzdmMGVtdmoifQ.RGa59Rq3emWACakc-RHJOg';

    // Initialize map
    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/yy3204/cmdc97tnq00a501s29w91a0fw',
      center: [-74.006, 40.7128],
      zoom: 11,
      pitch: 0,
      bearing: 0,
      minZoom: 10,
      maxZoom: 18,
    });

    // Add controls
    map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new window.mapboxgl.FullscreenControl(), 'top-right');
    map.current.addControl(new window.mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric'
    }), 'bottom-left');

    // Parse date function
    const parseDate = (dateStr) => {
      try {
        return new Date(Date.parse(dateStr.replace(/(\d{4} \w{3} \d{2}) (\d{2}:\d{2}:\d{2}) (AM|PM)/, "$1T$2 $3")));
      } catch (e) {
        console.warn("Failed to parse date:", dateStr);
        return null;
      }
    };

    // Generate sample noise data
    const generateSampleNoiseData = () => {
      const complaints = [];
      const nycBounds = {
        north: 40.9176,
        south: 40.4774,
        east: -73.7004,
        west: -74.2591
      };

      // Generate 200 random noise complaints
      for (let i = 0; i < 200; i++) {
        const lat = nycBounds.south + Math.random() * (nycBounds.north - nycBounds.south);
        const lng = nycBounds.west + Math.random() * (nycBounds.east - nycBounds.west);
        
        // Random time in the last 30 days
        const daysAgo = Math.random() * 30;
        const hoursAgo = Math.random() * 24;
        const minutesAgo = Math.random() * 60;
        
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(date.getHours() - hoursAgo);
        date.setMinutes(date.getMinutes() - minutesAgo);
        
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateStr = `${date.getFullYear()} ${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')} ${date.toLocaleTimeString('en-US', {hour12: true})}`;

        complaints.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          properties: {
            created_date: dateStr,
            complaint_type: "Noise - Street/Sidewalk",
            weight: 1
          }
        });
      }

      return complaints;
    };

    // Update heatmap function
    const updateHeatmap = (interval, intervalCounts, maxIntervalCount, rawNoiseData) => {
      const hour = Math.floor(interval / 2);
      const minute = interval % 2 === 0 ? "00" : "30";
      const ampm = hour < 12 ? "AM" : "PM";
      const labelHour = hour % 12 === 0 ? 12 : hour % 12;
      
      const timeLabel = document.getElementById("timeLabel");
      if (timeLabel) {
        timeLabel.textContent = `${labelHour}:${minute} ${ampm}`;
      }

      const now = new Date("2025-07-20");

      const filtered = rawNoiseData
        .map(f => {
          const ts = parseDate(f.properties.created_date);
          if (!ts) return null;
          const tsInterval = ts.getHours() * 2 + Math.floor(ts.getMinutes() / 30);
          if (tsInterval !== interval) return null;

          const ageDays = (now - ts) / (1000 * 60 * 60 * 24);
          const recencyWeight = 1 / (1 + ageDays);
          const timeWeight = maxIntervalCount > 0 ? maxIntervalCount / Math.max(intervalCounts[interval], 1) : 1;

          f.properties.weight = recencyWeight * timeWeight;
          return f;
        })
        .filter(Boolean);

      const source = map.current.getSource("noise-data");
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: filtered
        });
      }
    };

    // Wait for map to load
    map.current.on('load', () => {
      console.log('Map loaded successfully!');

      // Load the actual noise complaints data
      fetch("/noise_complaints.geojson")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('GeoJSON data loaded:', data);
          const rawNoiseData = data.features.filter(f => f.geometry);

          // Count complaints per 30-min interval (48 buckets)
          let intervalCounts = new Array(48).fill(0);
          for (const f of rawNoiseData) {
            const t = parseDate(f.properties.created_date);
            if (t) {
              const interval = t.getHours() * 2 + Math.floor(t.getMinutes() / 30);
              intervalCounts[interval]++;
            }
          }
          const maxIntervalCount = Math.max(...intervalCounts);

          // Add source and layer
          map.current.addSource("noise-data", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          map.current.addLayer({
            id: "noise-heatmap",
            type: "heatmap",
            source: "noise-data",
            paint: {
              "heatmap-weight": ["get", "weight"],
              "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 1, 16, 3],
              "heatmap-color": [
                "interpolate", ["linear"], ["heatmap-density"],
                0,    "rgba(255,255,255,0)",       // transparent white
                0.1,  "#ffd1e0",                   // very light pink
                0.3,  "#ff66a3",                   // light pink
                0.5,  "#ff006f",                   // main color
                0.7,  "#cc005a",                   // deep magenta
                0.9,  "#800040",                   // dark plum
                1,    "black"   
              ],
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 15, 16, 40],
              "heatmap-opacity": 0.8
            },
          });

          // Initialize heatmap with noon data
          updateHeatmap(16, intervalCounts, maxIntervalCount, rawNoiseData);

          // Set up slider event listener
          const slider = document.getElementById("timeSlider");
          if (slider) {
            slider.addEventListener("input", (e) => {
              updateHeatmap(parseInt(e.target.value), intervalCounts, maxIntervalCount, rawNoiseData);
            });
          }
        })
        .catch((error) => {
          console.error('Error loading noise complaints data:', error);
          console.log('Falling back to sample data...');
          
          // Fallback to sample data if the file can't be loaded
          const sampleNoiseData = generateSampleNoiseData();
          let intervalCounts = new Array(48).fill(0);
          for (const f of sampleNoiseData) {
            const t = parseDate(f.properties.created_date);
            if (t) {
              const interval = t.getHours() * 2 + Math.floor(t.getMinutes() / 30);
              intervalCounts[interval]++;
            }
          }
          const maxIntervalCount = Math.max(...intervalCounts);

          map.current.addSource("noise-data", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          map.current.addLayer({
            id: "noise-heatmap",
            type: "heatmap",
            source: "noise-data",
            paint: {
              "heatmap-weight": ["get", "weight"],
              "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 1, 16, 3],
              "heatmap-color": [
                "interpolate", ["linear"], ["heatmap-density"],
                0, "rgba(255,255,0,0)",
                0.2, "rgba(255,255,0,0.5)",
                0.4, "orange",
                0.6, "orangered",
                0.8, "red",
                1, "darkred"
              ],
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 15, 16, 40],
              "heatmap-opacity": 0.8
            },
          });

          updateHeatmap(24, intervalCounts, maxIntervalCount, sampleNoiseData);

          const slider = document.getElementById("timeSlider");
          if (slider) {
            slider.addEventListener("input", (e) => {
              updateHeatmap(parseInt(e.target.value), intervalCounts, maxIntervalCount, sampleNoiseData);
            });
          }
        });
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '430px' }}>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden'
        }} 
      />
      <div id="time-slider-container" style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '4px 8px',
        borderRadius: '4px',
        boxShadow: '0 0 0px 2px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px'
      }}>
        <input 
          type="range" 
          min="0" 
          max="47" 
          defaultValue="16" 
          id="timeSlider"
          style={{
            appearance: 'none',
            width: '160px',
            height: '2.5px',
            background: '#ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
        <span id="timeLabel" style={{
          fontWeight: '500',
          minWidth: '60px',
          textAlign: 'center'
        }}>8:00 AM</span>
      </div>
    </div>
  );
};

export default MapboxNoiseMap;