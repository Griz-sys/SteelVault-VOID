'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TableComponent from '../Table';
import SearchFilter from '../SearchFilter';
import useUserStore from '../../../stores/userStore';

const ViewUser = () => {
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
      const employees = data.filter(
        u => u.userType?.toLowerCase() === 'employee'
      ); setDbUsers(employees);
      setFilteredData(employees);
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
  const hydratedUser = {
    ...row,
    companyName: row.client?.companyName || '',
    contactNo: row.client?.contactNo || '',
    address: row.client?.address || '',
  };

  setSelectedUser(hydratedUser);
  router.push('/dashboard/admin/user/new_user');
};

  return (
    <div className="p-6">
      <SearchFilter
        data={dbUsers}
        searchFields={[
          'name',
          'department',
          'designation',
          'empId',
          'userType',
          'email',
        ]}
        onFilteredDataChange={setFilteredData}
      />

      <TableComponent
        headers={['Name', 'Email', 'User Type', 'Department', 'Designation', 'Employee Code']}
        keys={['name', 'email', 'userType', 'department', 'designation', 'empId']}
        data={filteredData}
        showActions={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ViewUser;
