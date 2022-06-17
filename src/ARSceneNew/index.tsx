import React, { FC, Suspense, useEffect, useRef, useState } from 'react'
import classes from './ARScene.module.scss'
import { Canvas } from '@react-three/fiber'
import EggModel from './EggModel'
import ARSceneEventBus, { ARSceneEvent } from './ARSceneEventBus'
import LocationBasedAR from './LocationBasedAR'
import Debug from './Debug'

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

  const onCaptureClick = (): void => {
    ARSceneEventBus.emit(ARSceneEvent.EGG_CAPTURED_ANIMATION_START);
    setEggHasBeenCaptured(true);
  }

  return (
    <div className={classes.root}>
      <Debug />
      <Canvas ref={canvasRef as any}>
        <LocationBasedAR threexRef={threexRef} />
        <hemisphereLight color={'#fff6e3'} intensity={3} />
        <Suspense fallback={<mesh><sphereBufferGeometry /></mesh>}>
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