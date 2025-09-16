"use client";
import { useState } from "react";
import CompetencySidebar from "../_components/sidebar";

export default function EmployeeDashboardPage() {
	const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});

	return (
		<CompetencySidebar
			showGoals={true}
			selectedLevels={selectedLevels}
			setSelectedLevels={setSelectedLevels}
			hideDefaultChart={false}
			goalAreas={[]}
		/>
	);
}

