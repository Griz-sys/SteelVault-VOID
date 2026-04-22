'use client';
import React, { useEffect, useState } from 'react';
import TableComponent from '../Table';
import SearchFilter from '../SearchFilter';

const ViewClient = () => {
  const router = useRouter();
  const [dbUsers, setDbUsers] = useState([]); // store users from DB
  const removeUser = useUserStore((state) => state.removeUser);
  const setSelectedUser = useUserStore((state) => state.setSelectedUser);

  const [filteredData, setFilteredData] = useState([]);

  // 🔹 Fetch all users (employees and client users)
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      const clients = data
        .filter(u => u.userType?.toLowerCase() === 'client')
        .map(u => ({
          ...u,
          companyName: u.client?.companyName || '—',
          contactNo: u.client?.contactNo || '—',
        }));
      setDbUsers(clients);
      setFilteredData(clients);
    };
    fetchUsers();
  }, []);

  const handleDelete = async (row) => {
    if (!confirm(`Delete ${row.name}?`)) return;

    try {
      const res = await fetch(`/api/users?id=${row.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Remove from UI
      setFilteredData(prev => prev.filter(u => u.id !== row.id));
      removeUser(row.id);

    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  const handleEdit = (row) => {
    setSelectedUser(row);
    router.push('/dashboard/admin/user/new_user');
  };

  return (
    <div className="p-6">
      <SearchFilter
        data={dbClients}
        searchFields={['name', 'email', 'companyName', 'contactNo']}
        onFilteredDataChange={setFilteredData}
      />
      <TableComponent
        headers={['Name', 'Email', 'Company Name', 'Contact No']}
        keys={['name', 'email', 'companyName', 'contactNo']}
        data={filteredData}
        showActions={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ViewClient;