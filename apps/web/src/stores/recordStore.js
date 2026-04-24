import { create } from 'zustand';
import { api } from '../api/client';

export const useRecordStore = create((set, get) => ({
  records: [],
  loading: false,
  error: null,

  fetchRecords: async (type) => {
    set({ loading: true, error: null });
    try {
      const records = await api.getRecords(type);
      set({ records, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addRecord: async (data) => {
    const record = await api.createRecord(data);
    set({ records: [record, ...get().records] });
    return record;
  },

  removeRecord: async (id) => {
    await api.deleteRecord(id);
    set({ records: get().records.filter(r => r.id !== id) });
  },
}));
