import * as three from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

/**
 * 加载模型
 * @param {Object} modelData 模型信息
 * @returns {Object} 模型组合
 */
export const loadModels = async (modelData) => {
  const { models, attributes, methods, animations } = modelData
  const group = new three.Group()
  for (let key in models) {
    const ways = {
      createModel,
      loadGltf,
      loadObj
    }
    const model = await ways[models[key].type](models[key])
    if (model && model instanceof three.Object3D) {
      models[key].model = model
      group.add(model)
    }
  }

  if (attributes) setAttirbutes(group, attributes)
  if (methods) setMethods(group, methods)
  if (animations && animations.length > 0) {
    for (let k = 0; k < animations.length; k++) {
      createAnimation(group, animations[k])
    }
  }
  return group
}

export const createModel = (options) => {
  const {
    light,
    lightInitArgs = [],
    geometry,
    geometryInitArgs = [],
    material,
    materialInitArgs = [],
    textureUrl,
    attributes,
    methods,
    animations,
  } = options
  return new Promise(async (resolve, reject) => {
    if (light) {
      const lightInstance = new three[light](...lightInitArgs)
      if (attributes) setAttirbutes(lightInstance, attributes)
      if (methods) setMethods(lightInstance, methods)
      if (animations && animations.length > 0) {
        for (let k = 0; k < animations.length; k++) {
          createAnimation(lightInstance, animations[k])
        }
      }
      if (attributes) setAttirbutes(lightInstance, attributes)
      if (methods) setMethods(lightInstance, methods)
      resolve(lightInstance)
    } else if (geometry && material) {
      const geo = new three[geometry](...geometryInitArgs)
      const mat = new three[material](...materialInitArgs)
      if (textureUrl) {
        const texture = await loadTexture({ textureUrl })
        mat.map = texture
      }
      const mesh = new three.Mesh(geo, mat)
      if (animations && animations.length > 0) {
        for (let k = 0; k < animations.length; k++) {
          createAnimation(mesh, animations[k])
        }
      }
      if (attributes) setAttirbutes(mesh, attributes)
      if (methods) setMethods(mesh, methods)
      resolve(mesh)
    } else {
      reject()
    }
  })
}

/**
 * 加载gltf模型
 * @param {Object} options 模型选项
 * @returns {Promise} 模型信息
 */
export const loadGltf = (options) => {
  const {
    gltfUrl,
    animations,
    attributes,
    methods,
    castShadow,
    receiveShadow
  } = options
  return new Promise((resolve, reject) => {
    const gltfLoader = new GLTFLoader()
    gltfLoader.load(gltfUrl, (model) => {
      if (model) {
        if (animations && animations.length > 0) {
          for (let k = 0; k < animations.length; k++) {
            createAnimation(model.scene, animations[k])
          }
        }
        if (attributes) setAttirbutes(model, attributes)
        if (methods) setMethods(model, methods)
        if (castShadow || receiveShadow) shadowDeep(model.scene, castShadow, receiveShadow)
        resolve(model.scene)
        return
      }
      reject(model)
    })
  })
}

/**
 * 加载obj模型
 * @param {Object} options 模型选项
 * @returns {Promise} 模型信息
 */
export const loadObj = (options) => {
  const {
    mtlUrl,
    objUrl,
    animations,
    attributes,
    methods,
    castShadow,
    receiveShadow
  } = options
  return new Promise((resolve, reject) => {
    const mtlLoader = new MTLLoader()
    mtlLoader.load(mtlUrl, (materials) => {
      materials.preload()

      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)

      objLoader.load(objUrl, (model) => {
        if (model) {
          if (animations && animations.length > 0) {
            for (let k = 0; k < animations.length; k++) {
              createAnimation(model, animations[k])
            }
          }
          if (attributes) setAttirbutes(model, attributes)
          if (methods) setMethods(model, methods)
          if (castShadow || receiveShadow) shadowDeep(model.scene, castShadow, receiveShadow)
          resolve(model)
          return
        }
        reject(model)
      })
    })
  })
}

/**
 * 递归整个模型，统一修改castShadow & receiveShadow
 * @param {Object} model 模型
 * @param {Boolean} castShadow 是否产生投影
 * @param {Boolean} receiveShadow 是否接收阴影
 */
export const shadowDeep = (model, castShadow, receiveShadow) => {
  if (!model) return
  model.traverse(node => {
    if ( node instanceof three.Mesh ) {
      if (castShadow) node.castShadow = true
      if (receiveShadow) node.receiveShadow = true
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          shadowDeep(child)
        })
      }
    }
  })
}

/**
 * 加载贴图
 * @param {Object} options 贴图选项
 * @returns {Promise} 贴图信息
 */
export const loadTexture = (options) => {
  const { textureUrl } = options
  return new Promise((resolve, reject) => {
    const loader = new three.TextureLoader()
    loader.load(textureUrl, (texture) => {
      if (texture) {
        resolve(texture)
        return
      }
      reject(texture)
    }, undefined, (err) => {
      reject(err)
    })
  })
}

/**
 * 给模型创建动画效果
 * @param {Object} model 模型信息
 * @param {Object} animation 动画信息
 */
export const createAnimation = (model, animation) => {
  if (!model || !animation) return
  const { method, args, interval } = animation
  if (!model[method]) return
  return interval ?
    setInterval(() => {
      model[method](...args)
    }, interval) :
    model[method](...args)
}

/**
 * 给模型添加属性
 * @param {Object} model 模型信息
 * @param {Object} attributes 属性信息
 */
export const setAttirbutes = (model, attributes) => {
  if (!model || !attributes) return
  for (let attr in attributes) {
    if (model.hasOwnProperty(attr)) {
      if (model[attr].set) {
        model[attr].set(...attributes[attr])
      } else {
        model[attr] = attributes[attr]
      }
    }
  }
}

/**
 * 调用模型方法
 * @param {Object} model 模型信息
 * @param {Object} methods 方法信息
 */
export const setMethods = (model, methods) => {
  if (!model || !methods) return
  for (let name in methods) {
    model[name](...methods[name])
  }
}

/**
 * 调用模型，改变模型状态，需在加载模型时的配置填写上对应的调用方式
 * @param {Object} modelData 模型信息
 * @param {String} callName 调用名称
 * @param {String} state 调用名称所采用的状态名称
 */
export const callModel = (modelData, callName, state) => {
  const { models, callers } = modelData
  if (!callers[callName]) return
  if (!callers[callName][state]) return
  if (callers[callName].intervals) {
    callers[callName].intervals.forEach(intervalInstance => {
      if (intervalInstance) clearInterval(intervalInstance)
    })
  }
  callers[callName].intervals = []

  const { animations, attributes } = callers[callName][state]
  // animations
  if (animations && animations.length > 0) {
    animations.forEach(animation => {
      if (!models[animation.modelName]) return
      const intervalInstance = createAnimation(models[animation.modelName].model, animation)
      callers[callName].intervals.push(intervalInstance)
    })
  }
  // attributes
  if (attributes) {
    const {
      modelName,
      ...attrs
    } = attributes
    if (models[modelName] && models[modelName].model) {
      setAttirbutes(models[modelName].model, attrs)
    }
  }
}
