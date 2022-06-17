import eventemitter3 from 'eventemitter3';

type Unsubscribe = () => void;

export enum ARSceneEvent {
  EGG_CAPTURED_ANIMATION_START = 'EGG_CAPTURED_ANIMATION_START',
  EGG_CAPTURED_ANIMATION_END = 'EGG_CAPTURED_ANIMATION_END',
  GPS_UPDATED = 'GPS_UPDATED',
  DEBUG = 'DEBUG',
}

export default class ARSceneEventBus {
  private static readonly _ee = new eventemitter3();

  public static on(eventName: ARSceneEvent, callback: (data?: any) => void): Unsubscribe {
    ARSceneEventBus._ee.on(eventName, callback);
    return () => ARSceneEventBus._ee.off(eventName, callback);
  }

  public static emit(eventName: ARSceneEvent, data?: any): void {
    ARSceneEventBus._ee.emit(eventName, data);
  }
}