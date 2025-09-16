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
    <header className="custom-dashed-border h-16  top-0 min-w-full bg-white -mt-14">
      <div className="flex h-full items-center justify-between">
        {/* Left side - dropdowns */}
        <div className="flex gap-4">
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="h-9 w-68 rounded-lg border border-gray-400 bg-white font-medium text-gray-600"
        >
          {departments.length === 0 ? (
            <option value="" disabled>
              Loading departments...
            </option>
          ) : (
            departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))
          )}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="h-9 w-68 rounded-lg border border-gray-400 bg-white font-medium text-gray-600"
        >
          {roles.length === 0 ? (
            <option value="" disabled>
              Loading roles...
            </option>
          ) : (
            roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))
          )}
        </select>
        </div>

        {/* Right side - circle avatar */}
        <div className="h-14 w-14 mr-10 overflow-hidden rounded-full border border-gray-300">
          <img
            src="https://randomuser.me/api/portraits/men/75.jpg"
            alt="User Avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
