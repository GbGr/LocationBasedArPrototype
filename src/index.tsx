import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
// import ARScene from './ARScene'
import ARScene from './ARSceneNew'
const EXAMPLE_POINT = {
  id: 'the point id',
  lat: 54.3804364,
  long: 37.6832711,
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ARScene
      point={EXAMPLE_POINT}
      onCaptured={(data) => alert(JSON.stringify(data, null, 2))}
    />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
