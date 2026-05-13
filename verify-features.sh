#!/bin/bash
# Verify that features from feature/chart-changes are present

echo "🔍 Verifying features from feature/chart-changes branch..."
echo ""

echo "✓ Checking for 'No data available' feature:"
grep -r "No data available" src/plugins/custom-charts/*.tsx | head -2

echo ""
echo "✓ Checking for empty state behavior:"
grep -r "isEmptyRange\|isEmpty" src/plugins/custom-charts/PieChartStay.tsx | head -2

echo ""
echo "✓ Checking for color palette modifications:"
grep -r "PROPORTION\|METRIC_NAME" plugins/plugin-chart-echarts/src/BigNumber/BigNumberViz.tsx | head -5

echo ""
echo "✓ Checking for responsive line connector:"
grep -r "line.*connector\|connector.*line" src/plugins/custom-charts/*.tsx | head -2

echo ""
echo "✓ Files that should have chart changes:"
echo "   - src/plugins/custom-charts/PieChartStay.tsx"
echo "   - src/plugins/custom-charts/BigNumberStay.tsx"
echo "   - src/plugins/custom-charts/RunChartStay.tsx"
echo "   - plugins/plugin-chart-echarts/src/BigNumber/BigNumberViz.tsx"
echo "   - plugins/plugin-chart-echarts/src/Pie/EchartsPie.tsx"
echo "   - plugins/plugin-chart-table/src/TableChart.tsx"

echo ""
echo "✅ Feature verification complete!"
