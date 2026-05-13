#!/bin/bash
# Verify that features from BOTH branches are present

echo "🔍 Verifying combined-features-clean branch has features from BOTH branches..."
echo ""
echo "Current branch: $(git branch --show-current)"
echo "Latest commit: $(git log --oneline -1)"
echo ""

echo "=" | tr '=' '-' | head -c 80; echo ""
echo "✓ Features from feature/chart-changes:"
echo "=" | tr '=' '-' | head -c 80; echo ""

echo "1. 'No data available' label:"
grep -q "No data available" src/plugins/custom-charts/BigNumberStay.tsx && echo "   ✅ Found in BigNumberStay.tsx" || echo "   ❌ Missing"

echo ""
echo "2. Color palette modifications (PROPORTION values):"
grep -A3 "const PROPORTION" plugins/plugin-chart-echarts/src/BigNumber/BigNumberViz.tsx | head -5

echo ""
echo "3. Table pagination (checking TableChart.tsx exists):"
[ -f "plugins/plugin-chart-table/src/TableChart.tsx" ] && echo "   ✅ TableChart.tsx exists" || echo "   ❌ Missing"

echo ""
echo "=" | tr '=' '-' | head -c 80; echo ""
echo "✓ Features from fix/layout-responsiveness:"
echo "=" | tr '=' '-' | head -c 80; echo ""

echo "1. Date picker functionality:"
grep -q "DatePicker\|selectedDate" src/plugins/custom-charts/PieChartStay.tsx && echo "   ✅ Found in PieChartStay.tsx" || echo "   ❌ Missing"

echo ""
echo "2. Offline overlay component:"
[ -f "src/dashboard/components/OfflineOverlay.tsx" ] && echo "   ✅ OfflineOverlay.tsx exists" || echo "   ❌ Missing"

echo ""
echo "3. Date range utils:"
[ -f "src/utils/dateRangeUtils.js" ] && echo "   ✅ dateRangeUtils.js exists" || echo "   ❌ Missing"

echo ""
echo "4. Shimmer loader improvements:"
grep -q "useLayoutEffect\|shimmer" src/plugins/custom-charts/ShimmerLoader.tsx && echo "   ✅ Found in ShimmerLoader.tsx" || echo "   ❌ Missing"

echo ""
echo "5. Calendar navigation (month/week):"
grep -q "month\|week\|calendar" src/plugins/custom-charts/PieChartStay.tsx && echo "   ✅ Found in PieChartStay.tsx" || echo "   ❌ Missing"

echo ""
echo "6. Package updates (checking key dependencies):"
grep -q "@react-spring/web\|global-box" package.json && echo "   ✅ New packages in package.json" || echo "   ⚠️  Check package.json manually"

echo ""
echo "=" | tr '=' '-' | head -c 80; echo ""
echo "📊 File comparison:"
echo "=" | tr '=' '-' | head -c 80; echo ""
echo "PieChartStay.tsx line count: $(wc -l < src/plugins/custom-charts/PieChartStay.tsx)"
echo "  (fix/layout-responsiveness has ~2529 lines with date picker)"
echo "  (feature/chart-changes has ~1351 lines without date picker)"
echo ""

echo "✅ Verification complete!"
echo ""
echo "Expected: PieChartStay should have ~2529 lines (with date picker from fix/layout-responsiveness)"
echo "          AND 'No data available' feature from feature/chart-changes"
