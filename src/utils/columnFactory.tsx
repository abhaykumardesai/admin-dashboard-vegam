import React, { useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import type { MRT_ColumnDef, MRT_Row } from 'material-react-table';
import { Chip, Stack, Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import type { User } from '../types';
import metadata from '../pages/column-metadata.json';

// Columns to hide on small screens
const columnsToHideOnMobile = ['email', 'createdAt', 'groups'];

export const useUserTableColumns = () => {
  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () =>
      metadata.map((col) => {
        const columnDef: MRT_ColumnDef<User> = {
          accessorKey: col.key,
          header: col.header,
          size: col.width || 150,
          enableResizing: true,
          muiTableBodyCellProps: {
            sx: {
              display: columnsToHideOnMobile.includes(col.key)
                ? { xs: 'none', sm: 'table-cell' }
                : 'table-cell',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          },
          muiTableHeadCellProps: {
            sx: {
              display: columnsToHideOnMobile.includes(col.key)
                ? { xs: 'none', sm: 'table-cell' }
                : 'table-cell',
              whiteSpace: 'nowrap',
            },
          },
        };

        // Custom cell rendering
        switch (col.type) {
          case 'badge':
            columnDef.Cell = ({ row }) => (
              <Chip
                label={row.original.status}
                color={row.original.status === 'active' ? 'success' : 'default'}
                variant="outlined"
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            );
            break;
          case 'chiplist':
            columnDef.Cell = ({ row }) => (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {row.original.groups.slice(0, 2).map((group) => (
                  <Chip key={group.id} label={group.name} size="small" />
                ))}
              </Stack>
            );
            break;
          case 'date':
            columnDef.Cell = ({ cell }) => {
              if (!cell.getValue<string>()) return '';
              return format(new Date(cell.getValue<string>()), col.format || 'dd/MM/yyyy');
            };
            break;
        }

        return columnDef;
      }),
    []
  );

  return columns;
};

// Example Table Component
export const UserTable: React.FC<{ data: User[] }> = ({ data }) => {
  const columns = useUserTableColumns();

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableColumnResizing
      enablePagination
      enableStickyHeader
      muiTableContainerProps={{
        sx: { overflowX: 'auto' }, // Horizontal scroll for small screens
      }}
      // Collapsible rows for small screens
      renderDetailPanel={({ row }: { row: MRT_Row<User> }) => (
        <Box
          sx={{
            display: { xs: 'block', sm: 'none' },
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          {columns
            .filter((col) => columnsToHideOnMobile.includes(col.accessorKey as string))
            .map((col) => {
              const value = row.getValue(col.accessorKey as string);
              return (
                <Box key={col.accessorKey} mb={1}>
                  <Typography variant="subtitle2">{col.header}:</Typography>
                  <Typography variant="body2">
                    {(() => {
                      const meta = metadata.find(m => m.key === col.accessorKey);
                      if (meta?.type === 'date' && value) {
                        return typeof value === 'string' || typeof value === 'number'
                          ? format(new Date(value), meta.format || 'dd/MM/yyyy')
                          : '-';
                      } else if (Array.isArray(value)) {
                        return value.map((v: any) => v?.name || v).join(', ');
                      } else if (value !== undefined && value !== null && value !== '') {
                        return String(value);
                      } else {
                        return '-';
                      }
                    })()}
                  </Typography>
                </Box>
              );
            })}
        </Box>
      )}
    />
  );
};
