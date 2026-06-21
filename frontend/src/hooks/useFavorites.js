import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites';
import { useAuthStore } from '../store/authStore';

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch favorites
  const { data: favorites = [], isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await getFavorites();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'favorites-sync-event') {
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [queryClient]);

  const notifyOtherTabs = () => {
    localStorage.setItem('favorites-sync-event', Date.now().toString());
  };

  // Toggle favorite mutation with Optimistic UI updates
  const toggleMutation = useMutation({
    mutationFn: async ({ propertyId, isFav }) => {
      if (isFav) {
        await removeFavorite(propertyId);
      } else {
        await addFavorite(propertyId);
      }
    },
    onMutate: async ({ propertyId, isFav, property }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData(['favorites']) || [];

      // Optimistically update the query cache
      queryClient.setQueryData(['favorites'], (old = []) => {
        if (isFav) {
          return old.filter((item) => item.id !== propertyId);
        } else {
          return [...old, property];
        }
      });

      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      notifyOtherTabs();
    },
  });

  const toggleFavorite = (property) => {
    if (!isAuthenticated) return;
    const isFav = favorites.some((item) => item.id === property.id);
    toggleMutation.mutate({ propertyId: property.id, isFav, property });
  };

  const isFavorited = (propertyId) => {
    return favorites.some((item) => item.id === propertyId);
  };

  return {
    favorites,
    isLoading,
    error,
    toggleFavorite,
    isFavorited,
  };
};
