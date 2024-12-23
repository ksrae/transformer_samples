import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonDirective } from '../../directives/common.directive';
// import * as THREE from 'three';

@Component({
  selector: 'app-depth-estimation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './depth-estimation.component.html',
  styleUrl: './depth-estimation.component.scss'
})
export class DepthEstimationComponent extends CommonDirective implements AfterViewInit {
  // @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  // private scene!: THREE.Scene;
  // private camera!: THREE.PerspectiveCamera;
  // private renderer!: THREE.WebGLRenderer;
  // private mesh?: THREE.Mesh;
  // private animationId?: number;

  loading = signal(false);
  output = signal('');
  imageUrl = signal('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cats.jpg');
  resultViewer = signal(false);

  ngAfterViewInit() {
    this.worker = new Worker(new URL('../../workers/depth-estimation.worker', import.meta.url), { type: 'module' });
    this.workerMessage();

  }

  // private initThreeJs() {
  //   this.scene = new THREE.Scene();
  //   this.camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
  //   this.camera.position.z = 2;

  //   this.renderer = new THREE.WebGLRenderer();
  //   this.renderer.setSize(640, 480);
  //   this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
  // }

  workerMessage() {
    if (!this.worker) return;

    this.worker.onmessage = (event) => {
      this.loading.set(false);
      this.stopTimer();

      // Receive ArrayBuffer and convert back to object
      const buffer = event.data;
      const result = this.arrayBufferToObject(buffer);
      const { type, output, error } = result;

      if (type === 'SUCCESS') {
        this.successResult(output);
      } else if (type === 'ERROR') {
        console.error('Worker error:', error);
      }
    };
  }

  successResult(output: any) {
    this.resultViewer.set(true);

    // 1. 이미지 출력
    this.displayDepthImage(output.depth);

    // 2. 3D Depth Map 출력
    // this.displayPredictedDepth3D(output.predicted_depth);
  }

  displayDepthImage(depth: any) {
    const { data, width, height, channels } = depth;

    const uint8Array = new Uint8Array(data);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
    for (let i = 0; i < height * width; i++) {
      imageData.data[i * 4] = uint8Array[i * channels];     // R
      imageData.data[i * 4 + 1] = uint8Array[i * channels]; // G
      imageData.data[i * 4 + 2] = uint8Array[i * channels]; // B
      imageData.data[i * 4 + 3] = 255;                      // A
    }

    ctx.putImageData(imageData, 0, 0);

    setTimeout(() => {
      const container = document.querySelector('#image-output');
      container?.appendChild(canvas);
    }, 0);

  }

  // displayPredictedDepth3D(predictedDepth: any) {
  //   const { geometry } = predictedDepth;

  //   // Clean up previous mesh if it exists
  //   if (this.mesh) {
  //     this.scene.remove(this.mesh);
  //     this.mesh.geometry.dispose();
  //   }

  //   // Create new geometry from worker data
  //   const bufferGeometry = new THREE.BufferGeometry();
  //   bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(geometry.vertices, 3));
  //   if (geometry.indices.length > 0) {
  //     bufferGeometry.setIndex(geometry.indices);
  //   }

  //   const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
  //   this.mesh = new THREE.Mesh(bufferGeometry, material);
  //   this.scene.add(this.mesh);

  //   // Start animation if not already running
  //   if (!this.animationId) {
  //     this.animate();
  //   }
  // }

  // private animate = () => {
  //   this.animationId = requestAnimationFrame(this.animate);
  //   if (this.mesh) {
  //     this.mesh.rotation.x += 0.005;
  //     this.mesh.rotation.y += 0.005;
  //   }
  //   this.renderer.render(this.scene, this.camera);
  // };

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set('');
    this.resultViewer.set(false);
    this.startTimer();

    const value = this.imageUrl();
    const message = {
      value,
    };

    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }


}
