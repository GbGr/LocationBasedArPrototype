import type { Group, AnimationClip } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

const loadModel = (): Promise<[ Group, AnimationClip[] ]> => {
  return new Promise<[ Group, AnimationClip[] ]>((resolve, reject) => {
    loader.load('/ar-scene/egg.gltf', (gltf) => {
      resolve([ gltf.scene, gltf.animations ]);
    }, undefined, reject);
  });
}

export default loadModel;