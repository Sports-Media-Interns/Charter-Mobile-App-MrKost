// CRM Event Queue - Offline persistence and retry logic

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CRMEvent, CRMQueueItem } from '@/types/crm';

const QUEUE_STORAGE_KEY = '@crm_event_queue';
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

export type EventProcessor = (event: CRMEvent) => Promise<boolean>;

export class CRMEventQueue {
  private queue: CRMQueueItem[] = [];
  private isProcessing: boolean = false;
  private processor: EventProcessor | null = null;
  private isOnline: boolean = true;

  async initialize(): Promise<void> {
    await this.loadQueue();
  }

  setProcessor(processor: EventProcessor): void {
    this.processor = processor;
  }

  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline && this.queue.length > 0) {
      this.processQueue();
    }
  }

  async enqueue(event: CRMEvent): Promise<void> {
    const queueItem: CRMQueueItem = {
      id: event.id,
      event,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.queue.push(queueItem);
    await this.saveQueue();

    if (this.isOnline) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !this.processor || !this.isOnline) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0 && this.isOnline) {
        const item = this.queue[0];

        if (item.retryCount >= MAX_RETRIES) {
          // Max retries exceeded, remove from queue
          this.queue.shift();
          await this.saveQueue();
          continue;
        }

        const success = await this.processItem(item);

        if (success) {
          this.queue.shift();
          await this.saveQueue();
        } else {
          item.retryCount++;
          item.lastAttempt = new Date().toISOString();
          await this.saveQueue();

          // Exponential backoff
          const delay = this.calculateBackoff(item.retryCount);
          await this.sleep(delay);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processItem(item: CRMQueueItem): Promise<boolean> {
    if (!this.processor) {
      return false;
    }

    try {
      return await this.processor(item.event);
    } catch (error) {
      item.error = error instanceof Error ? error.message : 'Unknown error';
      return false;
    }
  }

  private calculateBackoff(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return BASE_RETRY_DELAY_MS * Math.pow(2, retryCount - 1);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load CRM queue from storage:', error);
      this.queue = [];
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to save CRM queue to storage:', error);
    }
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getPendingEvents(): CRMQueueItem[] {
    return [...this.queue];
  }

  getFailedEvents(): CRMQueueItem[] {
    return this.queue.filter((item) => item.retryCount >= MAX_RETRIES);
  }

  async removeEvent(eventId: string): Promise<void> {
    this.queue = this.queue.filter((item) => item.id !== eventId);
    await this.saveQueue();
  }

  async retryEvent(eventId: string): Promise<void> {
    const item = this.queue.find((i) => i.id === eventId);
    if (item) {
      item.retryCount = 0;
      item.error = undefined;
      await this.saveQueue();
      this.processQueue();
    }
  }

  isProcessingQueue(): boolean {
    return this.isProcessing;
  }
}
