"use client";

import React from "react";

interface HeaderProps {
  departments: string[];
  roles: string[];
  selectedDepartment: string;
  selectedRole: string;
  onDepartmentChange: (dept: string) => void;
  onRoleChange: (role: string) => void;
}

export default function Header({
  departments,
  roles,
  selectedDepartment,
  selectedRole,
  onDepartmentChange,
  onRoleChange,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-60  min-w-screen  bg-white flex justify-between items-center mx-6 h-20 z-50 custom-dashed-border">
      {/* Left side - dropdowns */}
      <div className="flex gap-4">
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="w-68 h-9 ml-5 font-medium border border-gray-400 text-gray-600 rounded-lg bg-white"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-68 h-9 font-medium border border-gray-400 text-gray-600 rounded-lg bg-white"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Right side - circle avatar */}
      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300">
        <img
          src="https://randomuser.me/api/portraits/men/75.jpg"
          alt="User Avatar"
          className="w-full h-full object-cover"
        />
      </div>
    </header>
  );
}
