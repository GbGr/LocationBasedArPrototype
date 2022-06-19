import { FC, MutableRefObject, RefObject, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
// @ts-ignore
import * as THREEx from '@ar-js-org/ar.js/three.js/build/ar-threex-location-only'
import ARSceneEventBus, { ARSceneEvent } from './ARSceneEventBus'
import isMobile from '../ARScene/misc/isMobile'
import WebcamRenderer from './WebcamRenderer'

globalThis['THREE'] = THREE;

interface LocationBasedARProps {
  arVideoRef: RefObject<HTMLVideoElement>;
  threexRef: MutableRefObject<any>;
}
const LocationBasedAR: FC<LocationBasedARProps> = ({ arVideoRef, threexRef }) => {
  const { scene, camera, gl } = useThree();
  const webcamRendererRef = useRef<any>();
  const orientationControlsRef = useRef<any>();

  useEffect(() => {
    const locationBasedController = threexRef.current = new THREEx.LocationBased(scene, camera);
    locationBasedController.setGpsOptions({ gpsMinAccuracy: 50_000, });
    if (!arVideoRef.current) throw new Error('video ref should be exist');
    webcamRendererRef.current = new WebcamRenderer(gl, arVideoRef.current);
    if (!isMobile()) return;
    orientationControlsRef.current = new THREEx.DeviceOrientationControls(camera);
  }, [ scene, camera ]);

  useEffect(() => {
    const threex = threexRef.current;
    if (!threex) return;

    threex.on('gpsupdate', (pos: GeolocationPosition) => {
      ARSceneEventBus.emit(ARSceneEvent.DEBUG, { lat_long: `${pos.coords.latitude}; ${pos.coords.longitude}` })
      ARSceneEventBus.emit(ARSceneEvent.DEBUG, { accuracy: `${pos.coords.accuracy / 1000}` })
      Promise.resolve().then(() => ARSceneEventBus.emit(ARSceneEvent.GPS_UPDATED, pos));
    });

    threex.startGps();

    return () => threex.stopGps();
  }, [ threexRef ]);

  useFrame(() => {
    webcamRendererRef.current?.update();
    orientationControlsRef.current?.update();
  });

  return null;
};
// const originalLonLatToWorldCoords = THREEx.LocationBased.prototype.lonLatToWorldCoords;
// THREEx.LocationBased.prototype.lonLatToWorldCoords = function () {
//   console.log(`setWorldPosition params: ${Array.prototype.slice.call(arguments).join('; ')}`);
//   const result = originalLonLatToWorldCoords.apply(this, Array.prototype.slice.apply(arguments));
//   result.forEach((v: any, i: number) => result[i] = Math.abs(v));
//   // debugger;
//   console.log(`setWorldPosition result: ${result.join('; ')}`);
//   return result;
// }

export default LocationBasedAR;