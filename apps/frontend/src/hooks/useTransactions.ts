import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransaction, type TransactionPayload } from '../lib/api';

/** Checkout mutation — refreshes product stock and dashboard metrics on success. */
export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransactionPayload) => createTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
