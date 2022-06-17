import React, { FC, MutableRefObject, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
// @ts-ignore
import * as THREEx from '@ar-js-org/ar.js/three.js/build/ar-threex-location-only'
import ARSceneEventBus, { ARSceneEvent } from './ARSceneEventBus'
import isMobile from '../ARScene/misc/isMobile'

globalThis['THREE'] = THREE;

interface LocationBasedARProps {
  threexRef: MutableRefObject<any>;
}
const LocationBasedAR: FC<LocationBasedARProps> = ({ threexRef }) => {
  const { scene, camera, gl } = useThree();
  const webcamRendererRef = useRef<any>();
  const orientationControlsRef = useRef<any>();

  useEffect(() => {
    const locationBasedController = threexRef.current = new THREEx.LocationBased(scene, camera);
    locationBasedController.setGpsOptions({ gpsMinAccuracy: 50_000, })
    webcamRendererRef.current = new THREEx.WebcamRenderer(gl, '#ar-video-source');
    if (!isMobile()) return;
    orientationControlsRef.current = new THREEx.DeviceOrientationControls(camera);
  }, [ scene, camera ]);

  useEffect(() => {
    const threex = threexRef.current;
    if (!threex) return;

    threex.on('gpsupdate', (pos: GeolocationPosition) => {
      ARSceneEventBus.emit(ARSceneEvent.DEBUG, { lat_long: `${pos.coords.latitude}; ${pos.coords.longitude}` })
      ARSceneEventBus.emit(ARSceneEvent.GPS_UPDATED, pos)
    });

    threex.startGps(1_000);

    return () => {
      alert('threex.stopGps()');
      threex.stopGps();
    };
  }, [ threexRef ]);

  useFrame(() => {
    webcamRendererRef.current?.update();
    orientationControlsRef.current?.update();
  });

  return null;
};

export default LocationBasedAR;