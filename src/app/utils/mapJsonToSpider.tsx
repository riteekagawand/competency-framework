export function mapJsonToSpider(data: any) {
  const goalAreas = data["Competency Framework"]["Goal Areas"];
  const totalWeight = goalAreas.reduce(
    (sum: number, g: any) => sum + parseFloat(g.TotalWeightage.replace("%", "")),
    0
  );

  let angleCursor = 0;
  const category: {
    name: string;
    goalArea: string;
    competencies: string[];
    defaultCount: number;
    startAngle: number;
    endAngle: number;
  }[] = [];
  const groupMap: Record<string, number[]> = {};

  goalAreas.forEach((goal: any) => {
    const goalWeight = parseFloat(goal.TotalWeightage.replace("%", ""));
    const goalAngle = (goalWeight / totalWeight) * 360;
    const totalCompWeight = goal["Expected Competancy"].reduce(
      (sum: number, c: any) => sum + parseFloat(c.Weightage.replace("%", "")),
      0
    );

    goal["Expected Competancy"].forEach((expected: any) => {
      const compWeight = parseFloat(expected.Weightage.replace("%", ""));
      const sliceAngle = (compWeight / totalCompWeight) * goalAngle;
      const startAngle = angleCursor;
      const endAngle = angleCursor + sliceAngle;

      const index = category.length;
      category.push({
        name: expected.Title,
        goalArea: goal.Name,
        competencies: expected.Competencies,
        defaultCount: expected["Default Competencies"],
        startAngle,
        endAngle,
      });

      if (!groupMap[goal.Name]) groupMap[goal.Name] = [];
      groupMap[goal.Name].push(index);

      angleCursor += sliceAngle;
    });
  });

  const defaultVals = category.map((cat) => cat.defaultCount);
  const tooltips: string[][] = category.map((cat) =>
    Array.from({ length: 5 }, (_, i) =>
      cat.competencies[i]
        ? `${cat.competencies[i]}`
        : `<b>${cat.goalArea} → ${cat.name}</b><br/><b>Level ${i + 1}</b><br/>No competency defined`
    )
  );

  return { category, defaultVals, tooltips, groupMap, goalAreas };
}
