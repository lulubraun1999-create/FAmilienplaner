'use client';
import { useFirebase } from '@/firebase/provider';
import type { User } from 'firebase/auth';

export interface UseUserResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const useUser = (): UseUserResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};

    