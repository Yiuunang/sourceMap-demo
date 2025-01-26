import { defineStore } from "pinia";
import type { eventWithTime } from '@rrweb/types'
import { ref } from "vue";

export const useRrwebStore = defineStore('rrwebStore', () => {
    const events = ref<eventWithTime[]>([]);

    const setEvents = (newEvents: eventWithTime[]) => {
        events.value = newEvents;
    }

    return {
        events,
        setEvents
    }
})