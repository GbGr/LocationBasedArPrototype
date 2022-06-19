import React, { FC, useEffect, useState } from 'react'
import classes from './debug.module.scss'
import ARSceneEventBus, { ARSceneEvent } from './ARSceneEventBus'

const Debug: FC = () => {
  const [ debug, setDebug ] = useState<any>({
    distance: -99999,
  });

  useEffect(() => {
    return ARSceneEventBus.on(ARSceneEvent.DEBUG, (stats: any) => {
      // console.log(JSON.stringify(debug, null, 2))
      Object.keys(stats).forEach((key) => debug[key] = stats[key]);
      setDebug({ ...debug });
    });
  }, []);

  return (
    <div className={classes.root}>
      <table>
        <tbody>
        {Object.keys(debug).map((key) => (
          <tr key={key}><td>{key.toUpperCase()}:</td><td>{debug[key]}</td></tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default Debug;