<template>
  <div>
    <div class="scene-container" ref="container"></div>

    <Controller
      @toggle-revolution="toggleRevolution"
      @toggle-rotation="toggleRotation">
    </Controller>
  </div>
</template>

<script>
import * as three from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { loadModels, callModel } from '@utils'
import Controller from '@components/Controller'
import modelsList from './models-universe.js'

export default {
  name: 'HelloWorld',

  components: {
    Controller
  },

  data () {
    return {
      container: null,
      renderer: null,
      scene: null,
      camera: null,
      controls: null,
      jumpInterval: null,
      jumpFrameCount: 0,
      jumpSpeed: 100,
      jumpLastTarget: null,
      modelsList: modelsList,
      revolution: false,
      rotation: false,
      earthRevolutionInterval: null,
      earthRevolutionPoints: [],
      earthRevolutionIndex: 0
    }
  },

  async mounted () {
    this.container = this.$refs.container

    // scene
    this.scene = new three.Scene()
    this.scene.background = new three.Color('#e0e0e0')

    // renderer
    this.renderer = new three.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0xffffff, 0.6)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.container.appendChild(this.renderer.domElement)

    this.renderer.shadowMapEnabled = true
    this.renderer.shadowMap.type = three.PCFSoftShadowMap

    // camera
    this.camera = new three.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    this.camera.position.set(300, 300, 300)

    // lights
    this.scene.add(new three.AmbientLight(0xf0f0f0))

    // background
    this.scene.background = new three.Color(0x000000)

    // controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.minDistance = 1
    this.controls.maxDistance = 300
    // this.controls.maxPolarAngle = Math.PI * ( 80 / 180 )
    this.controls.update()

    // helper
    // const helper = new three.GridHelper(200, 200)
    // helper.material.opacity = 0.25
    // helper.material.transparent = true
    // this.scene.add(helper)

    for (let key in this.modelsList) {
      const group = await loadModels(this.modelsList[key])
      this.scene.add(group)
    }
    this.animate()
    this.createRevolutionCurve()
    this.toggleRotation()
    this.toggleRevolution()
  },

  methods: {
    animate () {
      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(this.animate)
    },

    createRevolutionCurve () {
      const curve = new three.EllipseCurve(
        0, 100,            // ax, aY
        100, 80,         // xRadius, yRadius
        0,  2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
      )
      const points = curve.getPoints(3650)
      const geometry = new three.BufferGeometry().setFromPoints( points )
      const material = new three.LineBasicMaterial( { color : 0xe0e0e0 } )
      // Create the final object to add to the scene
      const ellipse = new three.Line( geometry, material )
      ellipse.rotateX(Math.PI / 2)
      ellipse.position.z = -100
      ellipse.position.x = -20
      this.scene.add(ellipse)
      this.earthRevolutionPoints = points
      this.earthRevolutionIndex = points.length - 1
    },

    earthRevolution () {
      this.earthRevolutionInterval = setInterval(() => {
        const { modelsList, earthRevolutionPoints, earthRevolutionIndex } = this
        const { model } = modelsList.earth.models.main
        const point = earthRevolutionPoints[earthRevolutionIndex]
        model.position.x = point.x - 20
        model.position.z = point.y - 100
        model.position.y = 0
        this.earthRevolutionIndex -= 1
        if (this.earthRevolutionIndex < 0) this.earthRevolutionIndex = earthRevolutionPoints.length - 1
      }, 10)
    },

    toggleRotation () {
      callModel(this.modelsList.earth, 'rotation', this.rotation ? 'off': 'on')
      this.rotation = !this.rotation
    },

    toggleRevolution () {
      if (this.revolution) {
        clearInterval(this.earthRevolutionInterval)
      } else {
        this.earthRevolution()
      }
      this.revolution = !this.revolution
    }
  }
}
</script>

<style lang="scss" scoped>
.scene-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
