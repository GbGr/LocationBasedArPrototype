import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import ARScene from './ARScene'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ARScene
      point={{ id: 'POINT_1', lat: 55.6993225 + 0.0004, long: 37.7354969, }}
      onCatch={(point) => alert(`Catched: ${JSON.stringify(point, null, 2)}`)}
    />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
