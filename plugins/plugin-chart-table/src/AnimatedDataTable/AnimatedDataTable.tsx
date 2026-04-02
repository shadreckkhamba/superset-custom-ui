/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretUpOutlined, CaretDownOutlined, MinusOutlined } from '@ant-design/icons';

interface DataRow {
  location: string;
  distribution: number;
  count: number;
  trend: number; // percentage change
  lastVisit: string;
}

interface AnimatedDataTableProps {
  data: DataRow[];
  className?: string;
}

const AnimatedDataTable: React.FC<AnimatedDataTableProps> = ({
  data,
  className = '',
}) => {
  // Calculate max count for proportional bar scaling
  const maxCount = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(row => row.count));
  }, [data]);

  // Format trend indicator
  const renderTrendIndicator = (trend: number) => {
    if (trend > 0) {
      return (
        <div className="flex items-center gap-1 text-green-500">
          <CaretUpOutlined className="w-4 h-4" />
          <span className="font-medium">+{trend}%</span>
        </div>
      );
    }
    if (trend < 0) {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <CaretDownOutlined className="w-4 h-4" />
          <span className="font-medium">{trend}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <MinusOutlined className="w-4 h-4" />
        <span className="font-medium">0%</span>
      </div>
    );
  };

  // Row animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  // Bar animation variants
  const barVariants = {
    hidden: { scaleX: 0 },
    visible: (width: number) => ({
      scaleX: width,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        delay: 0.2,
      },
    }),
  };

  return (
    <div
      className={`animated-data-table ${className}`}
      style={{
        maxHeight: '360px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 #f1f5f9',
      }}
    >
      <style>
        {`
          .animated-data-table::-webkit-scrollbar {
            width: 6px;
          }
          .animated-data-table::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          .animated-data-table::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .animated-data-table::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Distribution
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Count
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Trend
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Last Visit
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {data.map((row, index) => {
              const barWidth = maxCount > 0 ? row.count / maxCount : 0;
              return (
                <motion.tr
                  key={row.location}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="border-b border-gray-100 hover:bg-accent/30 transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full bg-teal-500"
                        style={{ minWidth: '8px', minHeight: '8px' }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {row.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-teal-500 rounded-full"
                        style={{ transformOrigin: 'left' }}
                        variants={barVariants}
                        custom={barWidth}
                        initial="hidden"
                        animate="visible"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-teal-600 font-mono">
                      {row.count.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {renderTrendIndicator(row.trend)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">
                      {row.lastVisit}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default AnimatedDataTable;
