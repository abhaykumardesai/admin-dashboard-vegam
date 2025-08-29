import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';

// Local-first development: Mock API and types
import {
  fetchUsers,
  updateUserStatus,
  type ApiResponse,
} from '../api/userApi';
import { useUserTableColumns } from '../utils/columnFactory';
import type { User } from '../types';

/**
 * The main page component for displaying the user management dashboard.
 * It handles data fetching, state management (loading, error, success),
 * and renders the metadata-driven data grid with interactive actions.
 */
const UsersPage = () => {
  // Get the dynamic columns from our metadata-driven factory
  const columns = useUserTableColumns();
  const queryClient = useQueryClient();

  // State for the search input
  const [globalFilter, setGlobalFilter] = useState('');
  // State for the debounced search term to avoid excessive API calls
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  // Debounce effect to prevent API calls on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [globalFilter]);

  // Query for fetching user data, re-fetches when the debounced filter changes
  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: ['users', debouncedGlobalFilter],
    queryFn: () => fetchUsers(debouncedGlobalFilter),
  });

  // Mutation for updating a user's status with optimistic UI
  const { mutateAsync: updateUser } = useMutation({
    mutationFn: updateUserStatus,
    onMutate: async (updatedUser) => {
      const queryKey = ['users', debouncedGlobalFilter];
      await queryClient.cancelQueries({ queryKey });

      const previousUsers = queryClient.getQueryData<ApiResponse>(queryKey);

      queryClient.setQueryData<ApiResponse | undefined>(
        queryKey,
        (oldData: ApiResponse | undefined) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            data: oldData.data.map((user: User) =>
              user.id === updatedUser.id
                ? { ...user, status: updatedUser.status }
                : user
            ),
          };
        }
      );

      return { previousUsers };
    },
    // If the mutation fails, roll back to the previous state
    // ... inside useMutation
    onError: (_err, _variables, context) => { // <-- Prefixed with underscores
      if (context?.previousUsers) {
        queryClient.setQueryData(
          ['users', debouncedGlobalFilter],
          context.previousUsers
        );
      }
      setSnackbar({
        open: true,
        message: 'Failed to update user status.',
        severity: 'error',
      });
    },
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'User status updated successfully!',
        severity: 'success',
      });
    },
    // Always refetch after the mutation is settled to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', debouncedGlobalFilter] });
    },
  });

  const table = useMaterialReactTable({
    columns: columns as MRT_ColumnDef<User>[],
    data: data?.data ?? [],
    // Synchronize the table's state with our component's state
    state: {
      globalFilter,
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching,
    },
    // Configuration for server-side filtering
    manualFiltering: true,
    onGlobalFilterChange: setGlobalFilter,

    // Performance and styling
    enableRowVirtualization: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: '70vh',
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
      },
    },

    // Row actions configuration
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          variant="outlined"
          size="small"
          color={row.original.status === 'active' ? 'error' : 'success'}
          onClick={() => {
            const newStatus =
              row.original.status === 'active' ? 'inactive' : 'active';
            updateUser({ id: row.original.id, status: newStatus });
          }}
        >
          {row.original.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
      </Box>
    ),
    displayColumnDefOptions: {
      'mrt-row-actions': { header: 'Actions', size: 120 },
    },

    // UI elements for error and search
    muiToolbarAlertBannerProps: isError
      ? { color: 'error', children: 'Error loading data' }
      : undefined,
    renderTopToolbarCustomActions: () => (
      <TextField
        onChange={(e) => setGlobalFilter(e.target.value)}
        value={globalFilter ?? ''}
        placeholder="Search by name or email"
        variant="outlined"
        size="small"
      />
    ),
  });

  return (
    <Box sx={{ padding: { xs: '0.5rem', md: '1rem' } }}>
      <Typography variant="h4" sx={{ marginBottom: '1.5rem' }}>
        Users Dashboard
      </Typography>
      <MaterialReactTable table={table} />
      <Snackbar
        open={!!snackbar?.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(null)}
          severity={snackbar?.severity}
          sx={{ width: '100%' }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;

