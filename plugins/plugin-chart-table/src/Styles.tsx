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
    // Enhanced table styling for admin dashboard
    table {
      width: 100%;
      min-width: auto;
      max-width: none;
      margin: 0;
      border-collapse: separate;
      border-spacing: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    th,
    td {
      min-width: 4.3em;
      padding: 12px 16px !important;
      transition: all 0.2s ease;
    }

    thead > tr > th {
      padding-right: 0;
      position: relative;
      background: #1e293b !important; /* Dark slate for admin dashboard */
      color: #f8fafc !important;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #0f172a !important; /* Darker shade */
      height: 48px; /* Compact header */
      vertical-align: middle;
      
      &:first-child {
        border-top-left-radius: 8px;
      }
      &:last-child {
        border-top-right-radius: 8px;
      }
    }
    
    th svg {
      color: rgba(255, 255, 255, 0.7) !important;
      margin: ${theme.gridUnit / 2}px;
      transition: all 0.2s ease;
    }
    th:hover svg {
      color: #f8fafc !important;
      transform: scale(1.1);
    }
    th.is-sorted svg {
      color: #f8fafc !important;
    }
    
    .table > tbody > tr:first-of-type > td,
    .table > tbody > tr:first-of-type > th {
      border-top: 0;
    }

    .table > tbody tr {
      transition: all 0.2s ease;
      border-bottom: 1px solid #e2e8f0 !important;
      height: 44px; /* Compact rows for admin dashboard */
      
      &:hover {
        background: #f1f5f9 !important; /* Subtle slate hover */
        transform: none;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      /* Subtle zebra striping */
      &:nth-child(even) {
        background: #f8fafc !important;
        
        &:hover {
          background: #f1f5f9 !important;
        }
      }
      
      &:last-child {
        border-bottom: none !important;
        
        td:first-child {
          border-bottom-left-radius: 12px;
        }
        td:last-child {
          border-bottom-right-radius: 12px;
        }
      }
    }

    .table > tbody tr td {
      font-feature-settings: 'tnum' 1;
      color: #334155;
      font-size: 13px;
      border: none !important;
      border-bottom: 1px solid #e2e8f0 !important;
      vertical-align: middle;
      
      /* Left-align text columns */
      text-align: left;
      
      &:hover {
        background: #fff !important;
        box-shadow: inset 0 0 0 1px rgba(30, 41, 59, 0.1);
      }
    }

    /* Right-align numeric columns */
    td.numeric,
    .dt-metric {
      text-align: right;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-weight: 500;
      color: #0f172a;
    }

    /* Bar column specific styling */
    td.bar-cell {
      padding-left: 8px !important;
      padding-right: 8px !important;
    }

    .dt-controls {
      padding: 12px 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      
      // Enhanced search input styling
      input[type="search"], .dt-global-filter input {
        border-radius: 6px;
        border: 1px solid #cbd5e1 !important;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 400;
        color: #334155;
        background: white;
        transition: all 0.2s ease;
        width: 220px;
        
        &:focus {
          border-color: #1e293b !important;
          box-shadow: 0 0 0 2px rgba(30, 41, 59, 0.1);
          outline: none;
        }
        
        &::placeholder {
          color: #94a3b8;
        }
      }
    }
    .dt-metric {
      text-align: right;
      font-weight: 600;
      color: #1e293b;
    }
    .dt-totals {
      font-weight: 600;
      background: #f1f5f9 !important;
      color: #475569 !important;
      border-top: 2px solid #cbd5e1 !important;
      
      &:hover {
        background: #e2e8f0 !important;
      }
    }
    .dt-is-null {
      color: #94a3b8;
      font-style: italic;
      font-weight: 500;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
    }
    td.dt-is-filter {
      cursor: pointer;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%) !important;
    }
    td.dt-is-filter:hover {
      background-color: ${theme.colors.secondary.light4};
      transform: none;
    }
    td.dt-is-active-filter,
    td.dt-is-active-filter:hover {
      background-color: ${theme.colors.secondary.light3};
      box-shadow: inset 0 0 0 1px #1e293b;
    }

    .dt-global-filter {
      float: right;
    }

    .dt-truncate-cell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }
    .dt-truncate-cell:hover {
      overflow: visible;
      white-space: normal;
      height: auto;
      max-width: none;
    }

    .dt-pagination {
      text-align: right;
      padding-top: 0.5em;
      
      // Enhanced pagination buttons - admin dashboard theme
      .pagination {
        margin: 0;
        
        li {
          a, span {
            border-radius: 4px !important;
            margin: 0 2px;
            border: 1px solid #cbd5e1;
            color: #475569;
            font-weight: 500;
            padding: 5px 10px;
            transition: all 0.2s ease;
            
            &:hover {
              background: #1e293b;
              color: white;
              border-color: #1e293b;
              transform: none;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
          }
          
          &.active {
            a, span {
              background: #1e293b;
              color: white;
              border-color: #1e293b;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
          }
          
          &.disabled {
            a, span {
              color: #cbd5e1;
              border-color: #e2e8f0;
              
              &:hover {
                background: white;
                color: #cbd5e1;
                border-color: #e2e8f0;
                transform: none;
                box-shadow: none;
              }
            }
          }
        }
      }
    }
    .dt-pagination .pagination {
      margin: 0;
    }

    .pagination > li > span.dt-pagination-ellipsis:focus,
    .pagination > li > span.dt-pagination-ellipsis:hover {
      background: ${theme.colors.grayscale.light5};
    }

    .dt-no-results {
      text-align: center;
      padding: 2em 0.6em;
      color: #64748b;
      font-size: 13px;
      
      &::before {
        content: "📊";
        font-size: 48px;
        display: block;
        margin-bottom: 16px;
      }
    }

    .right-border-only {
      border-right: 2px solid ${theme.colors.grayscale.light2};
    }
    table .right-border-only:last-child {
      border-right: none;
    }
    
    // Page size selector styling
    .dt-page-size {
      select {
        border-radius: 6px;
        border: 1px solid #cbd5e1 !important;
        padding: 5px 8px;
        color: #334155;
        background: white;
        transition: all 0.2s ease;
        
        &:focus {
          border-color: #1e293b !important;
          box-shadow: 0 0 0 2px rgba(30, 41, 59, 0.1);
          outline: none;
        }
      }
    }
    
    // Responsive enhancements
    @media (max-width: 1024px) {
      th, td {
        padding: 10px 12px !important;
        font-size: 12px;
      }
      
      .dt-controls {
        flex-direction: column;
        gap: 10px;
        
        .dt-global-filter {
          float: none;
          width: 100%;
        }
      }
    }
    
    @media (max-width: 768px) {
      th, td {
        padding: 8px 10px !important;
        font-size: 11px;
      }
      
      table {
        border-radius: 6px;
      }
      
      thead > tr > th {
        height: 40px;
        font-size: 11px;
        
        &:first-child {
          border-top-left-radius: 6px;
        }
        &:last-child {
          border-top-right-radius: 6px;
        }
      }
      
      .table > tbody tr {
        height: 36px;
      }
      
      .dt-controls {
        padding: 10px 12px;
        
        input[type="search"], .dt-global-filter input {
          width: 100%;
          font-size: 12px;
        }
      }
      
      .dt-pagination {
        .pagination li {
          a, span {
            padding: 4px 8px;
            font-size: 11px;
          }
        }
      }
    }
    
    @media (max-width: 480px) {
      th, td {
        padding: 6px 8px !important;
        font-size: 10px;
      }
      
      thead > tr > th {
        height: 36px;
        font-size: 10px;
      }
      
      .table > tbody tr {
        height: 32px;
      }
      
      .dt-controls {
        padding: 8px 10px;
      }
    }
    
    // Scrollbar styling for table container
    .ReactVirtualized__Grid {
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 8px;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      
      &::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
        border-radius: 8px;
        border: 2px solid #f1f5f9;
        transition: all 0.2s ease;
        
        &:hover {
          background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
        }
      }
    }
  `}
`;
