import { CommonModule } from '@angular/common';
import { Component, Input, effect, signal } from '@angular/core';

@Component({
  selector: 'app-tensor-visualizer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card w-full max-w-4xl border rounded-lg shadow-sm">
      <div class="card-header p-4 border-b">
        <h3 class="text-lg font-semibold">Tensor Visualization</h3>
        <div class="text-sm text-gray-500">
          Dimensions: {{ dims().join(' × ') }}
        </div>
      </div>

      <div class="card-content p-4">
        @if (dims().length === 3) {
          <div class="mb-4 space-y-2">
            <div>
              <label class="mr-2">Batch:</label>
              <select [value]="selectedDim()" (change)="onDimChange($event)" class="border rounded p-1">
                <option *ngFor="let i of range(dims()[0])" [value]="i">Batch {{ i + 1 }}</option>
              </select>

              <select [value]="selectedIndex()" (change)="onIndexChange($event)" class="border rounded p-1">
                <option *ngFor="let i of range(dims()[1])" [value]="i">Token {{ i + 1 }}</option>
              </select>
            </div>
          </div>
        }

        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse">
            <thead>
              <tr>
                <th class="border p-2">Index</th>
                <th class="border p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              @for (item of getCurrentData(); track $index) {
                <tr>
                  <td class="border p-2 text-center">
                    {{ (currentPage() - 1) * ITEMS_PER_PAGE + $index }}
                  </td>
                  <td class="border p-2 text-right">
                    {{ formatNumber(item) }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPages() > 1) {
          <div class="mt-4 flex justify-center gap-2">
            <button
              (click)="prevPage()"
              [disabled]="currentPage() === 1"
              class="px-3 py-1 border rounded disabled:opacity-50">
              Previous
            </button>
            <span class="px-3 py-1">
              Page {{ currentPage() }} of {{ totalPages() }}
            </span>
            <button
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages()"
              class="px-3 py-1 border rounded disabled:opacity-50">
              Next
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TensorVisualizerComponent {
  @Input() set tensorData(data: any) {
    if (data instanceof Float32Array) {
      this._tensorData.set(data);
    }
  }
  @Input() set dimensions(dims: number[]) {
    if (dims) {
      this.dims.set(dims);
      this.selectedDim.set(0); // Default to the first batch
      this.selectedIndex.set(0); // Default to the first sequence
    }
  }

  private _tensorData = signal<Float32Array>(new Float32Array());
  dims = signal<number[]>([]);
  selectedDim = signal(0);
  selectedIndex = signal(0);
  currentPage = signal(1);
  readonly ITEMS_PER_PAGE = 100;

  totalPages = signal(1);

  constructor() {
    // effect를 사용하여 tensorData 변경 감지
    // this._tensorData.subscribe(data => {
    //   this.totalPages.set(Math.ceil(data.length / this.ITEMS_PER_PAGE));
    // });
    effect(() => {
      const data = this._tensorData();
      this.totalPages.set(Math.ceil(data.length / this.ITEMS_PER_PAGE));
    }, { allowSignalWrites: true });
  }

  onDimChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedDim.set(Number(value));
  }

  onIndexChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedIndex.set(Number(value));
  }

  formatNumber(num: number): string {
    return Number(num).toFixed(4);
  }

  getCurrentData(): number[] {
    const dims = this.dims();
    const [batchSize, sequenceLength, vectorSize] = dims;

    if (dims.length === 3) {
      const selectedBatch = this.selectedDim();
      const selectedSequence = this.selectedIndex();

      // Compute the start index for the current selection
      const startIdx = selectedBatch * (sequenceLength * vectorSize) + selectedSequence * vectorSize;

      // Extract the vector for the selected batch and sequence
      return Array.from(this._tensorData().slice(startIdx, startIdx + vectorSize));
    }

    return [];
  }

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }
}
