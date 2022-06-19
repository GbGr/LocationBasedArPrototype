import React, { createRef, FC, Suspense, useEffect, useRef, useState } from 'react'
import classes from './ARScene.module.scss'
import { Canvas } from '@react-three/fiber'
import EggModel from './EggModel'
import ARSceneEventBus, { ARSceneEvent } from './ARSceneEventBus'
import LocationBasedAR from './LocationBasedAR'
import Debug from './Debug'
import type { PerspectiveCamera } from 'three'

interface ARScenePoint {
  id: string;
  lat: number;
  long: number;
}

interface ARSceneCapturedData {
  ts: number
  duration: number
  screenshot: string
}

interface ARSceneProps {
  point: ARScenePoint;
  onCaptured?: (data: ARSceneCapturedData) => void;
}

const ARScene: FC<ARSceneProps> = ({
  point,
  onCaptured,
}) => {
  const threexRef = useRef<any>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const cameraRef = useRef<PerspectiveCamera>()
  const arVideoRef = createRef<HTMLVideoElement>();
  const [ launchedAt ] = useState(Date.now());
  const [ eggHasBeenCaptured, setEggHasBeenCaptured ] = useState(false);

  useEffect(() => {
    return ARSceneEventBus.on(ARSceneEvent.EGG_CAPTURED_ANIMATION_END, () => {
      const now = Date.now();
      const screenshot = canvasRef.current?.toDataURL('image/jpeg', 0.75);
      if (!screenshot || !onCaptured) return;
      onCaptured({
        ts: now,
        screenshot,
        duration: now - launchedAt,
      });
    })
  }, []);

  useEffect(() => {
    if (cameraRef.current) {

    }
  }, [cameraRef])

  const onCaptureClick = (): void => {
    ARSceneEventBus.emit(ARSceneEvent.EGG_CAPTURED_ANIMATION_START);
    setEggHasBeenCaptured(true);
  }

  return (
    <div className={classes.root}>
      <video ref={arVideoRef} muted autoPlay playsInline style={{ display: 'none' }} />
      <Debug />
      <Canvas ref={canvasRef as any} className={classes.canvas}>
        {/*<Camera />*/}
        <LocationBasedAR arVideoRef={arVideoRef} threexRef={threexRef} />
        <hemisphereLight color={'#fff6e3'} intensity={3} />
        <Suspense fallback={null}>
          <EggModel point={point} threexRef={threexRef} />
        </Suspense>
      </Canvas>
      {eggHasBeenCaptured ? null : (
        <button
          className={classes.captureBtn}
          onClick={onCaptureClick}
        >Capture</button>
      )}
    </div>
  );
};

export default ARScene;