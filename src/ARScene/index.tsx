import React, { createRef, FC, useEffect, useState } from 'react'
import classes from './ARScene.module.scss'
import * as THREE from 'three'
import { Object3D } from 'three'
// @ts-ignore
import * as THREEx from '@ar-js-org/ar.js/three.js/build/ar-threex-location-only'
import isMobile from './misc/isMobile'
import useLoadModel from './misc/useLoadModel'

if (typeof window !== 'undefined') { // @ts-ignore
  window['THREE'] = THREE;
}

let initialized = false;
const VECTOR3_BUFFER = new THREE.Vector3();

interface ARPoint {
  id: string;
  lat: number;
  long: number;
}

interface ARSceneProps {
  point: ARPoint;
  onCatch?: (point: ARPoint) => void;
}

const ARScene: FC<ARSceneProps> = ({ point, onCatch }) => {
  const htmlCanvasElementRef = createRef<HTMLCanvasElement>();
  const catchButtonRef = createRef<HTMLButtonElement>();
  const [ canCatch, setCanCatch ] = useState<boolean>(false);
  const { mesh, isLoading, scene, mixer } = useLoadModel();
  const onClickCatch = (): void => {
    if (!onCatch) return;

    onCatch(point);
  }

  useEffect(() => {
    if (!mesh || isLoading) return;
    if (!htmlCanvasElementRef.current) return;
    if (initialized) return;
    initialized = true;
    let requestAnimationFrameId: number;

    const oneDegAsRad = THREE.MathUtils.degToRad(1);
    const clock = new THREE.Clock();

    const light = new THREE.HemisphereLight(0xC8FDFF, 0x000000, 10);
    scene.add(light);
    const camera = new THREE.PerspectiveCamera(80, 2, 0.1, 50000);
    const renderer = new THREE.WebGLRenderer({ canvas: htmlCanvasElementRef.current });
    const threex = new THREEx.LocationBased(scene, camera);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;

    let rewardMesh: Object3D;

    const createRewardMesh = (): Object3D => {
      // const tmpGeometry = new THREE.BoxGeometry(10, 10, 10);
      // const tmpMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
      // const mesh = new THREE.Mesh(tmpGeometry, tmpMaterial);
      // mesh.name = point.id;
      mesh.name = point.id;

      return mesh;
    }

    const updateObject = (point: ARPoint, coordinates: GeolocationCoordinates): void => {
      console.log(`Your current coors: lat: ${coordinates.latitude}, long: ${coordinates.longitude}`);

      const mesh: Object3D = rewardMesh || createRewardMesh();
      rewardMesh = mesh;
      threex.add(mesh, point.long, point.lat);
    }

    threex.on('gpsupdate', (pos: any) => updateObject(point, pos.coords));

    const cam = new THREEx.WebcamRenderer(renderer, '#ar-video-source');

    let orientationControls: any;

    if (isMobile()){
      orientationControls = new THREEx.DeviceOrientationControls(camera);
    }

    threex.on('gpserror', (code: any) => alert(`GPS error: code ${code}`));

    threex.startGps();

    const render = () => {
      resizeUpdate();
      if(orientationControls) orientationControls.update();
      cam.update();
      renderer.render(scene, camera);
      setCanCatch(getAngleToReward() < 1);
      mixer.update(clock.getDelta());
      requestAnimationFrame(render);
    }

    if(!isMobile()) {
      let mousedown = false;
      let lastX = 0;

      console.log(`move: ${lastX}`);

      window.addEventListener('mousedown', () => {
        mousedown = true;
      });

      window.addEventListener('mouseup', () => {
        mousedown = false;
      });

      window.addEventListener('mousemove', (e) => {
        if(!mousedown) return;
        if(e.clientX < lastX) {
          camera.rotation.y -= oneDegAsRad;
          if(camera.rotation.y < 0) {
            camera.rotation.y += 2 * Math.PI;
          }
        } else if (e.clientX > lastX) {
          camera.rotation.y += oneDegAsRad;
          if(camera.rotation.y > 2 * Math.PI) {
            camera.rotation.y -= 2 * Math.PI;
          }
        }
        lastX = e.clientX;
      });
    }

    const getAngleToReward = (): number => {
      VECTOR3_BUFFER.set(0, 0, -1);
      VECTOR3_BUFFER.applyQuaternion(camera.quaternion);
      const rewardPosition = scene.getObjectByName(point.id)?.position as any;
      return rewardPosition ? VECTOR3_BUFFER.angleTo(rewardPosition) : Number.MAX_SAFE_INTEGER;
    }

    const resizeUpdate = () => {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if(width !== canvas.width || height !== canvas.height) {
        renderer.setSize(width, height, false);
      }

      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    requestAnimationFrameId = requestAnimationFrame(render);

    return () => {
      // delete threex._eventHandlers['gpsupdate'];
      // delete threex._eventHandlers['gpserror'];
      // if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
    }

  }, [ mesh, isLoading ]);

  return (
    <div className={classes.root}>
      <canvas
        ref={htmlCanvasElementRef}
        className={classes.canvas}
      />
      <button
        ref={catchButtonRef}
        disabled={!canCatch}
        className={classes.button}
        onClick={onClickCatch}
      >Catch!</button>
    </div>
  );
};

export default React.memo(ARScene);
