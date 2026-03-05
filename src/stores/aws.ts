// src/stores/aws.store.ts
import { defineStore } from 'pinia';
import { AwsEvent, AwsMetrics } from './interfaces/aws';
import { eventLinks } from '../pages/data/event-links'
import { EventLinkItem } from './interfaces/types';
import { API_CONFIG } from '@/services/config';
import api from '../services/api';

export const useAwsStore = defineStore('aws', {
  state: () => ({
    events: [] as AwsEvent[],
    services: [] as string[],
    metrics: {
      total: 0,
      runInstances: 0,
      createDBInstance: 0,
      createFunction: 0,
      createLoadBalancer: 0,
    } as AwsMetrics,
    loading: false,
    selectedRange: 'last hour',
    startDate: '',
    endDate: '',
  }),
  getters: {
    chartDataServices: (state) => {
      const counts = state.events.reduce((acc: Record<string, number>, event) => {
        const service = event.eventSource.split('.')[0]; 
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      }, {});

      return {
        labels: Object.keys(counts),
        datasets: [
          {
            label: 'AWS Services Usage',
            backgroundColor: 'rgba(74, 227, 135, 0.2)',
            borderColor: 'rgba(0, 102, 0, 1)',
            borderWidth: 1,
            data: Object.values(counts),
          },
        ],
      };
    },
    formattedEvents: (state) => {
    const lang = navigator.language === 'es-ES' ? 'es' : 'en';

    const linksMap = (eventLinks as EventLinkItem[]).reduce((acc, item) => {
        acc[item.eventName] = item;
        return acc;
    }, {} as Record<string, EventLinkItem>);

    return state.events.map((event) => {
        const linkConfig = linksMap[event.eventName] || linksMap['Empty'];
        
        return {
        ...event,
        eventLink: linkConfig ? linkConfig.url : '#', 
        description: linkConfig ? linkConfig.description[lang] : 'No description',
        displayTime: new Date(event.eventTime).toLocaleString(),
        };
    });
    },
  },
  actions: {
    async fetchDashboardData(range: string) {
  this.loading = true;
  this.selectedRange = range;

  try {
    const now = new Date();
    let startIso: string;
    let endIso: string;
    const formatForBackend = (date: Date) => {
        return date.toISOString().split('.')[0] + 'Z';
        };
    if (range === 'last hour') {
      const end = new Date(now.getTime() - 2 * 60 * 60 * 1000)
      const start = new Date(now.getTime() - 3 * 60 * 60 * 1000)
      endIso = formatForBackend(end)
      startIso = formatForBackend(start)
    } else if (range === 'last six hours') {
      const end = new Date(now.getTime() - 2 * 60 * 60 * 1000)
      const start = new Date(now.getTime() - 10 * 60 * 60 * 1000)
      endIso = formatForBackend(end)
      startIso = formatForBackend(start)
    } else if (range === 'last day') {
      const end = new Date()
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      endIso = formatForBackend(end)
      startIso = formatForBackend(start)
    } else if (range === 'last week') {
      const end = new Date()
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      endIso = formatForBackend(end)
      startIso = formatForBackend(start)
    } else { //default 1 hora
    const end = new Date(now.getTime() - 2 * 60 * 60 * 1000)
      const start = new Date(now.getTime() - 3 * 60 * 60 * 1000)
      endIso = formatForBackend(end)
      startIso = formatForBackend(start)
    }

    this.startDate = startIso;
    this.endDate = endIso;

    const [eventsRes, totalRes, runRes, dbRes, funcRes, lbRes] = await Promise.all([
      api.client.get('/scan', { params: { from: startIso, to: endIso } }),
      api.client.get('/scan', { params: { from: startIso, to: endIso, count: 'True' } }),
      api.client.get('/scan', { params: { from: startIso, to: endIso, eventName: 'RunInstances', count: 'True' } }),
      api.client.get('/scan', { params: { from: startIso, to: endIso, eventName: 'CreateDBInstance', count: 'True', begin_with: 'True' } }),
      api.client.get('/scan', { params: { from: startIso, to: endIso, eventName: 'CreateFunction', count: 'True', begin_with: 'True' } }),
      api.client.get('/scan', { params: { from: startIso, to: endIso, eventName: 'CreateLoadBalancer', count: 'True' } })
    ]);

    this.events = eventsRes.data;
    this.metrics = {
      total: totalRes.data,
      runInstances: runRes.data,
      createDBInstance: dbRes.data,
      createFunction: funcRes.data,
      createLoadBalancer: lbRes.data
    };

  } catch (error) {
    console.error("Error en la migración de datos AWS:", error);
  } finally {
    this.loading = false;
  }
}
  }
}
)


