import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories, createCategory, updateCategory, deleteCategory,
  type CategoriesResponse,
} from '../lib/api';

/** React Query data layer for categories. */
export function useCategories(search?: string) {
  return useQuery({
    queryKey: ['categories', search ?? ''],
    queryFn: async () => (await fetchCategories({ search: search || undefined })).data,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) => updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    // Optimistic update: remove the category from every cached list immediately
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['categories'] });
      const snapshots = qc.getQueriesData<CategoriesResponse>({ queryKey: ['categories'] });
      snapshots.forEach(([key, data]) => {
        if (data) {
          qc.setQueryData(key, {
            ...data,
            data: data.data.filter((c) => c.id !== id),
            total: Math.max(0, data.total - 1),
          });
        }
      });
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
