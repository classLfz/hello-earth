module.exports = {
  sun: {
    models: {
      main: {
        type: 'createModel',
        geometry: 'SphereBufferGeometry',
        geometryInitArgs: [29, 32, 32],
        material: 'MeshStandardMaterial',
        materialInitArgs: [{ color: 0xff0000 }],
        textureUrl: process.env.NODE_ENV === 'production'
          ? '/hello-earth/static/textures/sun.jpg'
          : '/static/textures/sun.jpg'
      },
      light: {
        type: 'createModel',
        light: 'PointLight',
        lightInitArgs: [0xffffff, 10, 0, 0],
        attributes: {
          castShadow: true
        }
      }
    },
    attributes: {
      position: [0, 0, 0]
    },
    targetPosition: { x: 0, y: 0, z: 0 },
    viewPosition: { x: 110, y: 110, z: 110 }
  },
  earth: {
    models: {
      main: {
        type: 'createModel',
        geometry: 'SphereBufferGeometry',
        geometryInitArgs: [5, 32, 32],
        // geometryInitArgs: [0.25, 32, 32],
        material: 'MeshStandardMaterial',
        textureUrl: process.env.NODE_ENV === 'production'
          ? '/hello-earth/static/textures/earth.jpg'
          : '/static/textures/earth.jpg',
        attributes: {
          castShadow: true,
          receiveShadow: true
        },
        methods: {
          rotateZ: [Math.PI * 23 / 180]
        }
      }
    },
    callers: {
      rotation: {
        on: {
          animations: [
            { modelName: 'main', method: 'rotateY', args: [Math.PI / 90], interval: 10 }
          ]
        },
        off: {}
      }
    },
    targetPosition: { x: 100, y: 0, z: 100 },
    viewPosition: { x: 110, y: 10, z: 110 }
  }
}
