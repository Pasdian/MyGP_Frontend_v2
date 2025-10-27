import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import { getAllUsers } from '@/types/users/getAllUsers';

export default function useGetAllUsers() {
  const { data, error, isLoading } = useSWR('/api/users/getAllUsers', axiosFetcher);
  const [users, setUsers] = React.useState<getAllUsers[]>([]);

  React.useEffect(() => {
    if (data) setUsers(data);
  }, [data]);

  return {
    users,
    setUsers, // in case you want to update it manually
    isLoading,
    error,
  };
}
