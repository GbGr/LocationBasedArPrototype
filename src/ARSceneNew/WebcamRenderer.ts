import * as THREE from 'three';
import { MeshBasicMaterial, OrthographicCamera, PlaneBufferGeometry, Scene, VideoTexture, WebGLRenderer } from 'three'

export default class WebcamRenderer {
  private readonly sceneWebcam: Scene;
  private geom: PlaneBufferGeometry | undefined;
  private readonly texture: VideoTexture;
  private readonly material: MeshBasicMaterial;
  private readonly cameraWebcam: OrthographicCamera;

  constructor(private readonly renderer: WebGLRenderer, private readonly videoElement: HTMLVideoElement ) {
    const cWidth = renderer.domElement.getBoundingClientRect().width;
    const cHeight = renderer.domElement.getBoundingClientRect().height;
    this.renderer = renderer;
    this.renderer.autoClear = false;
    this.sceneWebcam = new THREE.Scene();
    this.texture = new THREE.VideoTexture(videoElement);
    this.material = new THREE.MeshBasicMaterial({ map: this.texture });
    this.cameraWebcam = new THREE.OrthographicCamera(
      -0.5,
      0.5,
      0.5,
      -0.5,
      0,
      10
    );
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      const constraints = {
        video: {
          width: { min: cWidth, },
          height: { min: cHeight, },
          facingMode: process.env.NODE_ENV === 'production' ? { exact: 'environment' } : 'environment',
        },
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          // this.createGeometry(cWidth, cHeight, stream.getVideoTracks()[0].getSettings().width as any, stream.getVideoTracks()[0].getSettings().height as any);
          this.createGeometry(cWidth, cHeight);
          console.log(`using the webcam successfully...`);
          this.videoElement.srcObject = stream;
          this.videoElement.play().catch(console.error);
        })
        .catch((e) => {
          alert(`Webcam error: ${e}`);
        });
    } else {
      alert("sorry - media devices API not supported");
    }
  }

  private createGeometry(w: number, h: number): void {
    let gX, gY = 0;
    const ratio = w / h;
    if (h < w) {
      gX = 1;
      gY = 1 / ratio;
    } else {
      gY = 1;
      gX = 1 / ratio;
    }
    this.geom = new THREE.PlaneBufferGeometry(gX, gY);
    const mesh = new THREE.Mesh(this.geom, this.material);
    this.sceneWebcam.add(mesh);
  }

  public update(): void {
    this.renderer.clear();
    this.renderer.render(this.sceneWebcam, this.cameraWebcam);
    this.renderer.clearDepth();
  }

  public dispose(): void {
    this.material.dispose();
    this.texture.dispose();
    this.geom?.dispose();
  }
}