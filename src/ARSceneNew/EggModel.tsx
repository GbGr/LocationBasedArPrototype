import React, { FC, MutableRefObject, useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { AnimationAction, AnimationMixer, LoopOnce, Vector3 } from 'three'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import ARSceneEventBus, { ARSceneEvent } from './ARSceneEventBus'
import { Euler } from 'three/src/math/Euler'
import { ARScenePoint } from './ARSceneTypes'

const eggModelRotation = new Euler(0, Math.PI/2, 0);
const eggModelScale = new Vector3(1, 1, 1);

interface EggModelProps {
  point: ARScenePoint;
  threexRef: MutableRefObject<any>;
}
const EggModel: FC<EggModelProps> = ({ point, threexRef }) => {
  const { camera } = useThree();
  const mixerRef = useRef<AnimationMixer>();
  const eggGroupRef = useRef<Group>();
  const animationActionsRef = useRef<Array<AnimationAction>>();
  const eggModel = useLoader(GLTFLoader, '/ARScene/egg.gltf');
  const [ isEggAnimationPlaying, setIsEggAnimationPlaying ] = useState(false);

  useEffect(() => {
    if (!eggModel.scene) return;
    mixerRef.current = new AnimationMixer(eggModel.scene);
    animationActionsRef.current = new Array<AnimationAction>();
    eggModel.animations.forEach((animation) => {
      const clipAction = mixerRef.current?.clipAction(animation);
      clipAction?.setLoop(LoopOnce, 0);
      animationActionsRef.current?.push(clipAction as any);
    });

    animationActionsRef.current?.forEach((action) => {
      action.reset().play();
    });

    mixerRef.current?.update(0);

  }, [ eggModel.scene ]);

  useEffect(() => {
    return ARSceneEventBus.on(ARSceneEvent.EGG_CAPTURED_ANIMATION_START, () => {
      setIsEggAnimationPlaying(true);
      setTimeout(() => {
        ARSceneEventBus.emit(ARSceneEvent.EGG_CAPTURED_ANIMATION_END);
      }, 3000);
    });
  }, [])

  useEffect(() => {
    if (!threexRef.current) return;
    return ARSceneEventBus.on(ARSceneEvent.GPS_UPDATED, (gpsData: GeolocationPosition) => {
      const eggGroup = eggGroupRef.current;
      if (!eggGroup) throw new Error('undefined eggGroup');
      threexRef.current.setWorldPosition(eggGroup, point.long, point.lat);
      ARSceneEventBus.emit(ARSceneEvent.DEBUG, { distance: camera.position.clone().sub(eggGroup.position).length()});
    });
  }, [ threexRef, eggGroupRef, camera ]);

  useFrame((state, delta) => {
    if (isEggAnimationPlaying) {
      mixerRef.current?.update(delta);
    }
  });

  return (
    <group ref={eggGroupRef as any} scale={eggModelScale} rotation={eggModelRotation}>
      <primitive object={eggModel.scene}></primitive>
      {/*<mesh>*/}
      {/*  <sphereBufferGeometry />*/}
      {/*  <meshBasicMaterial color={'#ff0000'}></meshBasicMaterial>*/}
      {/*</mesh>*/}
    </group>
  );
};

export default EggModel;