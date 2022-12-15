import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { gl } from './core/WebGL'
import { effects } from './effects/Effects'
import fragmentShader from './shader/planeFrag.glsl'
import vertexShader from './shader/planeVert.glsl'
import { gui } from './utils/gui'

gsap.registerPlugin(ScrollTrigger)

export class TCanvas {
	private animeID?: number

	private palette = {
		ball1: '#41D1FF',
		ball2: '#FFDD35',
		mix: '#BD34FE',
	}

	constructor(private parentNode: ParentNode) {
		this.init()
		this.createObjects()
		this.setAnimationFrame()
		this.ceateGsapAnimation()
	}

	private init() {
		gl.setup(this.parentNode.querySelector('.three-container')!)
		gl.camera.position.set(0, 0, 1.5)

		gl.setResizeCallback(() => effects.resize())
	}

	private createObjects() {
		const material = new THREE.ShaderMaterial({
			uniforms: {
				u_progress: { value: 0 },
				u_color1: { value: new THREE.Color() },
				u_color2: { value: new THREE.Color() },
			},
			vertexShader,
			fragmentShader,
			transparent: true,
		})

		{
			const geometry = new THREE.PlaneGeometry(1, 1, 100, 100)
			const mat = material.clone()
			mat.uniforms.u_color1.value.set(this.palette.ball1)
			mat.uniforms.u_color2.value.set(this.palette.mix)
			const mesh = new THREE.Mesh(geometry, mat)
			mesh.scale.multiplyScalar(1.3)
			mesh.position.z = -0.01
			mesh.name = 'ball1'
			gl.scene.add(mesh)

			const folder = gui.addFolder('ball 1')
			folder.addColor(mat.uniforms.u_color1, 'value').name('color 1')
			folder.addColor(mat.uniforms.u_color2, 'value').name('color 2')
		}
		{
			const geometry = new THREE.PlaneGeometry(1, 1, 100, 100)
			const mat = material.clone()
			mat.uniforms.u_color1.value.set(this.palette.mix)
			mat.uniforms.u_color2.value.set(this.palette.ball2)
			const mesh = new THREE.Mesh(geometry, mat)
			mesh.scale.multiplyScalar(1.3)
			mesh.position.y = -2.0
			mesh.name = 'ball2'
			gl.scene.add(mesh)

			const folder = gui.addFolder('ball 2')
			folder.addColor(mat.uniforms.u_color1, 'value').name('color 1')
			folder.addColor(mat.uniforms.u_color2, 'value').name('color 2')
		}
	}

	private ceateGsapAnimation() {
		const ball1 = gl.getMesh<THREE.ShaderMaterial>('ball1')
		const ball2 = gl.getMesh('ball2')

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: this.parentNode.querySelector('.section'),
				start: 'top top',
				end: 'bottom bottom',
				scrub: 0.3,
			},
		})

		tl.to(ball1.material.uniforms.u_progress, { value: 1 }, 0)
		tl.to(ball2.position, { y: 0 }, 0)
	}

	private setAnimationFrame() {
		const anime = () => {
			// const et = gl.time.getElapsedTime()
			// gl.getMesh('ball1').position.x = Math.sin(et * 0.5)
			// gl.getMesh('ball2').position.x = Math.sin(-et * 0.5)

			// gl.render()
			effects.render()
			requestAnimationFrame(anime)
		}
		this.animeID = requestAnimationFrame(anime)
	}

	dipose() {
		this.animeID && cancelAnimationFrame(this.animeID)
	}
}