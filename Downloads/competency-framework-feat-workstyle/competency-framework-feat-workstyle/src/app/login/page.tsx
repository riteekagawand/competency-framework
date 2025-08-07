"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    Name: "",
    EmployeeId: "",
    Department: "Engineering",
    Level: "",
    Role: "",
  });
  const [message, setMessage] = useState("");

  const [levels, setLevels] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [allData, setAllData] = useState<any[]>([]);

  // Fetch entire JSON once
  useEffect(() => {
    fetch("/Data/Band 1/Band1.json")
      .then((res) => res.json())
      .then((json) => {
        setAllData(json);

        const uniqueLevels = Array.from(new Set(json.map((item: any) => item.Level)));
        setLevels(uniqueLevels);

        // Set default Level and roles
        if (uniqueLevels.length > 0) {
          const defaultLevel = uniqueLevels[0];
          setFormData((prev) => ({ ...prev, Level: defaultLevel }));
          updateRolesForLevel(defaultLevel, json);
        }
      })
      .catch((err) => console.error("Error fetching Band1.json:", err));
  }, []);

  const updateRolesForLevel = (level: string, data = allData) => {
    const rolesForLevel = data
      .filter((item: any) => item.Level === level)
      .map((item: any) => item.Role);

    setRoles(rolesForLevel);
    if (rolesForLevel.length > 0) {
      setFormData((prev) => ({ ...prev, Role: rolesForLevel[0] }));
    } else {
      setFormData((prev) => ({ ...prev, Role: "" }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "Level") {
      updateRolesForLevel(value);
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
  // Save logged in user for later retrieval
  await fetch("/api/getUser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  router.push("/Landing");
}

  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md space-y-4 w-96"
      >
        <h1 className="text-xl font-bold">Login</h1>

        {/* Name */}
        <div>
          <label className="block font-medium">Name</label>
          <input
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            required
            className="border w-full p-2 rounded"
          />
        </div>

        {/* EmployeeId */}
        <div>
          <label className="block font-medium">EmployeeId</label>
          <input
            name="EmployeeId"
            value={formData.EmployeeId}
            onChange={handleChange}
            required
            className="border w-full p-2 rounded"
          />
        </div>

        {/* Department Dropdown */}
        <div>
          <label className="block font-medium">Department</label>
          <select
            name="Department"
            value={formData.Department}
            onChange={handleChange}
            required
            className="border w-full p-2 rounded"
          >
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        {/* Level Dropdown */}
        <div>
          <label className="block font-medium">Level</label>
          <select
            name="Level"
            value={formData.Level}
            onChange={handleChange}
            required
            className="border w-full p-2 rounded"
          >
            {levels.length > 0 ? (
              levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))
            ) : (
              <option value="">Loading...</option>
            )}
          </select>
        </div>

        {/* Role Dropdown */}
        <div>
          <label className="block font-medium">Role</label>
          <select
            name="Role"
            value={formData.Role}
            onChange={handleChange}
            required
            className="border w-full p-2 rounded"
          >
            {roles.length > 0 ? (
              roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))
            ) : (
              <option value="">No roles available</option>
            )}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Submit
        </button>

        {message && <p className="text-green-600">{message}</p>}
      </form>
    </div>
  );
}
