import type { Object3D } from 'three'
import { AnimationMixer, Group, Scene } from 'three'
import { useEffect, useState } from 'react'
import loadModel from './loadModel'
import { LoopRepeat } from 'three/src/constants'

let scene: Scene;
let mixer: AnimationMixer;
let initialized = false;

const useLoadModel = (): { scene: Scene, mesh: null | Object3D, isLoading: boolean, mixer: AnimationMixer, } => {
  const [ isLoading, setIsLoading ] = useState(false);
  const [ mesh, setMesh ] = useState<null | Object3D>(null);

  useEffect(() => {
    if (initialized) return;
    initialized = true;
    if (!scene) scene = new Scene();
    if (isLoading || mesh !== null) return;
    setIsLoading(true);

    loadModel().then(([ model, animations]) => {
      if (!mixer) mixer = new AnimationMixer(model);
      model.scale.set(4, 4, 4);
      const mesh = new Group();
      mesh.add(model);
      mesh.rotation.y = Math.PI / 2;
      setIsLoading(false);
      setMesh(mesh);
      scene.add(mesh);

      console.log('TADAAAA')
      animations.forEach((clip) => {
        mixer.clipAction(clip).loop = LoopRepeat;
        mixer.clipAction(clip).reset().play();
      });
    }).catch(alert);
  }, []);

  return { mesh, isLoading, scene, mixer };
}

export default useLoadModel;