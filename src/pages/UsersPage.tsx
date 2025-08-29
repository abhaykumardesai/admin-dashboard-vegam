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
import {
  fetchUsers,
  updateUserStatus,
  type ApiResponse,
} from '../api/userApi';
import { useUserTableColumns } from '../utils/columnFactory';
import type { User } from '../types';

const UsersPage = () => {
  const columns = useUserTableColumns();
  const queryClient = useQueryClient();

  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
    }, 500);
    return () => clearTimeout(handler);
  }, [globalFilter]);

  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: ['users', debouncedGlobalFilter],
    queryFn: () => fetchUsers(debouncedGlobalFilter),
  });

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
    onError: (err, variables, context) => {
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', debouncedGlobalFilter] });
    },
  });

  const table = useMaterialReactTable({
    columns: columns as MRT_ColumnDef<User>[],
    data: data?.data ?? [],
    // Add globalFilter to the table's state object
    state: {
      globalFilter, // <--- THIS IS THE FIX
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching,
    },
    manualFiltering: true,
    onGlobalFilterChange: setGlobalFilter,

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
    muiToolbarAlertBannerProps: isError
      ? { color: 'error', children: 'Error loading data' }
      : undefined,
    // Add the search text field to the top toolbar
    renderTopToolbarCustomActions: () => (
      <TextField
        onChange={(e) => setGlobalFilter(e.target.value)}
        // FIX: Ensure the value is never undefined
        value={globalFilter ?? ''}
        placeholder="Search by name or email"
        variant="outlined"
        size="small"
      />
    ),
  });

  return (
    <Box sx={{ padding: '1rem' }}>
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



