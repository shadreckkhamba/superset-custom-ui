/*
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

import { css, styled } from '@superset-ui/core';

export default styled.div`
  ${({ theme }) => css`
    table {
      width: 100%;
      min-width: auto;
      max-width: none;
      margin: 0;
    }

    /* Animated Data Table Styles */
    .animated-data-table {
      max-height: 360px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f5f9;
    }

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

    .animated-data-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .animated-data-table thead {
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;
    }

    .animated-data-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e5e7eb;
    }

    .animated-data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
    }

    .animated-data-table tr:hover {
      background-color: rgba(0, 169, 214, 0.1);
    }

    .animated-data-table .teal-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #0d9488;
      min-width: 8px;
      min-height: 8px;
    }

    .animated-data-table .distribution-bar {
      position: relative;
      height: 8px;
      background-color: #f3f4f6;
      border-radius: 9999px;
      overflow: hidden;
    }

    .animated-data-table .distribution-bar-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: #0d9488;
      border-radius: 9999px;
      transform-origin: left;
    }

    .animated-data-table .count {
      font-size: 14px;
      font-weight: 700;
      color: #0d9488;
      font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
    }

    .animated-data-table .trend-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .animated-data-table .trend-indicator.positive {
      color: #22c55e;
    }

    .animated-data-table .trend-indicator.negative {
      color: #ef4444;
    }

    .animated-data-table .trend-indicator.neutral {
      color: #9ca3af;
    }

    .animated-data-table .last-visit {
      font-size: 14px;
      color: #9ca3af;
    }
  `}
`;
