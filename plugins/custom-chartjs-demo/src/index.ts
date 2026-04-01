import { t } from '@superset-ui/core';
import {chartPlugin} from '@superset-ui/plugin-chart-composite';
import CustomChartJS from './CustomChartJS';
import transformProps from './transformProps';


export default class CustomChartJSPlugin {
  constructor() {
    this.metadata = {
      name: 'Custom Chart.js',
      description: 'Customizable Chart.js charts',
      categories: ['Charts'],
    };
  }

  configure() {
    return {
      controlPanelSections: [
        {
          label: t('Chart Options'),
          controlSetRows: [
            ['chartType'],
            ['colorScheme'],
            ['showLegend'],
            ['stacked']
          ]
        }
      ]
    };
  }
}

new CustomChartJSPlugin().configure();
