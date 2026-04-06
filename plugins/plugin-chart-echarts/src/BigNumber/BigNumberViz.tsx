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
import { PureComponent, MouseEvent, createRef } from 'react';
import {
  t,
  getNumberFormatter,
  getTimeFormatter,
  SMART_DATE_VERBOSE_ID,
  computeMaxFontSize,
  BRAND_COLOR,
  styled,
  BinaryQueryObjectFilterClause,
} from '@superset-ui/core';
import Echart from '../components/Echart';
import { BigNumberVizProps } from './types';
import { EventHandlers } from '../types';

const defaultNumberFormatter = getNumberFormatter();

const PROPORTION = {
  // text size: proportion of the chart container sans trendline
  METRIC_NAME: 0.125,
  KICKER: 0.1,
  HEADER: 0.3,
  SUBHEADER: 0.125,
  // trendline size: proportion of the whole chart container
  TRENDLINE: 0.3,
};

type BigNumberVisState = {
  elementsRendered: boolean;
  recalculateTrigger: boolean;
};

class BigNumberVis extends PureComponent<BigNumberVizProps, BigNumberVisState> {
  static defaultProps = {
    className: '',
    headerFormatter: defaultNumberFormatter,
    formatTime: getTimeFormatter(SMART_DATE_VERBOSE_ID),
    headerFontSize: PROPORTION.HEADER,
    kickerFontSize: PROPORTION.KICKER,
    metricNameFontSize: PROPORTION.METRIC_NAME,
    showMetricName: true,
    mainColor: BRAND_COLOR,
    showTimestamp: false,
    showTrendLine: false,
    startYAxisAtZero: true,
    subheader: '',
    subheaderFontSize: PROPORTION.SUBHEADER,
    timeRangeFixed: false,
  };

  // Create refs for each component to measure heights
  metricNameRef = createRef<HTMLDivElement>();

  kickerRef = createRef<HTMLDivElement>();

  headerRef = createRef<HTMLDivElement>();

  subheaderRef = createRef<HTMLDivElement>();

  subtitleRef = createRef<HTMLDivElement>();

  state = {
    elementsRendered: false,
    recalculateTrigger: false,
  };

  componentDidMount() {
    // Wait for elements to render and then calculate heights
    setTimeout(() => {
      this.setState({ elementsRendered: true });
    }, 0);
  }

  componentDidUpdate(prevProps: BigNumberVizProps) {
    if (
      prevProps.height !== this.props.height ||
      prevProps.showTrendLine !== this.props.showTrendLine
    ) {
      this.setState(prevState => ({
        recalculateTrigger: !prevState.recalculateTrigger,
      }));
    }
  }

  getClassName() {
    const { className, showTrendLine, bigNumberFallback } = this.props;
    const names = `superset-legacy-chart-big-number ${className} ${
      bigNumberFallback ? 'is-fallback-value' : ''
    }`;
    if (showTrendLine) return names;
    return `${names} no-trendline`;
  }

  createTemporaryContainer() {
    const container = document.createElement('div');
    container.className = this.getClassName();
    container.style.position = 'absolute'; // so it won't disrupt page layout
    container.style.opacity = '0'; // and not visible
    return container;
  }

  renderFallbackWarning() {
    const { bigNumberFallback, formatTime, showTimestamp } = this.props;
    if (!formatTime || !bigNumberFallback || showTimestamp) return null;
    return (
      <span
        className="alert alert-warning"
        role="alert"
        title={t(
          `Last available value seen on %s`,
          formatTime(bigNumberFallback[0]),
        )}
      >
        {t('Not up to date')}
      </span>
    );
  }

  renderMetricName(maxHeight: number) {
    const { metricName, width, showMetricName } = this.props;
    if (!showMetricName || !metricName) return null;

    const text = metricName;

    const container = this.createTemporaryContainer();
    document.body.append(container);
    const fontSize = computeMaxFontSize({
      text,
      maxWidth: width,
      maxHeight,
      className: 'metric-name',
      container,
    });
    container.remove();

    return (
      <div
        ref={this.metricNameRef}
        className="metric-name"
        style={{
          fontSize,
          height: 'auto',
        }}
      >
        {text}
      </div>
    );
  }

  renderKicker(maxHeight: number) {
    const { timestamp, showTimestamp, formatTime, width } = this.props;
    if (
      !formatTime ||
      !showTimestamp ||
      typeof timestamp === 'string' ||
      typeof timestamp === 'bigint' ||
      typeof timestamp === 'boolean'
    )
      return null;

    const text = timestamp === null ? '' : formatTime(timestamp);

    const container = this.createTemporaryContainer();
    document.body.append(container);
    const fontSize = computeMaxFontSize({
      text,
      maxWidth: width,
      maxHeight,
      className: 'kicker',
      container,
    });
    container.remove();

    return (
      <div
        ref={this.kickerRef}
        className="kicker"
        style={{
          fontSize,
          height: 'auto',
        }}
      >
        {text}
      </div>
    );
  }

  renderHeader(maxHeight: number) {
    const { bigNumber, headerFormatter, width, colorThresholdFormatters } =
      this.props;
    // @ts-ignore
    const text = bigNumber === null ? t('No data') : headerFormatter(bigNumber);

    const hasThresholdColorFormatter =
      Array.isArray(colorThresholdFormatters) &&
      colorThresholdFormatters.length > 0;

    let numberColor;
    if (hasThresholdColorFormatter) {
      colorThresholdFormatters!.forEach(formatter => {
        const formatterResult = bigNumber
          ? formatter.getColorFromValue(bigNumber as number)
          : false;
        if (formatterResult) {
          numberColor = formatterResult;
        }
      });
    } else {
      numberColor = 'black';
    }

    const container = this.createTemporaryContainer();
    document.body.append(container);
    const fontSize = computeMaxFontSize({
      text,
      maxWidth: width * 0.9, // reduced it's max width
      maxHeight,
      className: 'header-line',
      container,
    });
    container.remove();

    const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
      if (this.props.onContextMenu) {
        e.preventDefault();
        this.props.onContextMenu(e.nativeEvent.clientX, e.nativeEvent.clientY);
      }
    };

    return (
      <div
        ref={this.headerRef}
        className="header-line"
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize,
          height: 'auto',
          color: numberColor,
        }}
        onContextMenu={onContextMenu}
      >
        {text}
      </div>
    );
  }

  rendermetricComparisonSummary(maxHeight: number) {
    const { subheader, width } = this.props;
    let fontSize = 0;

    const text = subheader;

    if (text) {
      const container = this.createTemporaryContainer();
      document.body.append(container);
      try {
        fontSize = computeMaxFontSize({
          text,
          maxWidth: width * 0.9,
          maxHeight,
          className: 'subheader-line',
          container,
        });
      } finally {
        container.remove();
      }

      return (
        <div
          ref={this.subheaderRef}
          className="subheader-line"
          style={{
            fontSize,
            height: maxHeight,
          }}
        >
          {text}
        </div>
      );
    }
    return null;
  }

  renderSubtitle(maxHeight: number) {
    const { subtitle, width, bigNumber, bigNumberFallback } = this.props;
    let fontSize = 0;

    const NO_DATA_OR_HASNT_LANDED = t(
      'No data after filtering or data is NULL for the latest time record',
    );
    const NO_DATA = t(
      'Try applying different filters or ensuring your datasource has data',
    );

    let text = subtitle;
    if (bigNumber === null) {
      text =
        subtitle || (bigNumberFallback ? NO_DATA : NO_DATA_OR_HASNT_LANDED);
    }

    if (text) {
      const container = this.createTemporaryContainer();
      document.body.append(container);
      fontSize = computeMaxFontSize({
        text,
        maxWidth: width * 0.9,
        maxHeight,
        className: 'subtitle-line',
        container,
      });
      container.remove();

      return (
        <>
          <div
            ref={this.subtitleRef}
            className="subtitle-line subheader-line"
            style={{
              fontSize: `${fontSize}px`,
              height: maxHeight,
            }}
          >
            {text}
          </div>
        </>
      );
    }
    return null;
  }

  renderTrendline(maxHeight: number) {
    const { width, trendLineData, echartOptions, refs } = this.props;

    // if can't find any non-null values, no point rendering the trendline
    if (!trendLineData?.some(d => d[1] !== null)) {
      return null;
    }

    const eventHandlers: EventHandlers = {
      contextmenu: eventParams => {
        if (this.props.onContextMenu) {
          eventParams.event.stop();
          const { data } = eventParams;
          if (data) {
            const pointerEvent = eventParams.event.event;
            const drillToDetailFilters: BinaryQueryObjectFilterClause[] = [];
            drillToDetailFilters.push({
              col: this.props.formData?.granularitySqla,
              grain: this.props.formData?.timeGrainSqla,
              op: '==',
              val: data[0],
              formattedVal: this.props.xValueFormatter?.(data[0]),
            });
            this.props.onContextMenu(
              pointerEvent.clientX,
              pointerEvent.clientY,
              { drillToDetail: drillToDetailFilters },
            );
          }
        }
      },
    };

    return (
      echartOptions && (
        <Echart
          refs={refs}
          width={Math.floor(width)}
          height={maxHeight}
          echartOptions={echartOptions}
          eventHandlers={eventHandlers}
        />
      )
    );
  }

  getTotalElementsHeight() {
    const marginPerElement = 8; // theme.gridUnit = 4, so margin-bottom = 8px

    const refs = [
      this.metricNameRef,
      this.kickerRef,
      this.headerRef,
      this.subheaderRef,
      this.subtitleRef,
    ];

    // Filter refs to only those with a current element
    const visibleRefs = refs.filter(ref => ref.current);

    const totalHeight = visibleRefs.reduce((sum, ref, index) => {
      const height = ref.current?.offsetHeight || 0;
      const margin = index < visibleRefs.length - 1 ? marginPerElement : 0;
      return sum + height + margin;
    }, 0);

    return totalHeight;
  }

  shouldApplyOverflow(availableHeight: number) {
    if (!this.state.elementsRendered) return false;
    const totalHeight = this.getTotalElementsHeight();
    return totalHeight > availableHeight;
  }

  render() {
    const {
      showTrendLine,
      height,
      kickerFontSize,
      headerFontSize,
      subtitleFontSize,
      metricNameFontSize,
      subheaderFontSize,
      metricName,
      subtitle,
    } = this.props;
    const className = this.getClassName();

    if (showTrendLine) {
      const chartHeight = Math.floor(PROPORTION.TRENDLINE * height);
      const allTextHeight = height - chartHeight;
      const shouldApplyOverflow = this.shouldApplyOverflow(allTextHeight);

      return (
        <div className={className}>
          <div
            className="text-container"
            style={{
              height: allTextHeight,
              ...(shouldApplyOverflow
                ? {
                    display: 'block',
                    boxSizing: 'border-box',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    width: '100%',
                  }
                : {}),
            }}
          >
            {this.renderFallbackWarning()}
            {this.renderMetricName(
              Math.ceil(
                (metricNameFontSize || 0) * (1 - PROPORTION.TRENDLINE) * height,
              ),
            )}
            {this.renderKicker(
              Math.ceil(
                (kickerFontSize || 0) * (1 - PROPORTION.TRENDLINE) * height,
              ),
            )}
            {this.renderHeader(
              Math.ceil(headerFontSize * (1 - PROPORTION.TRENDLINE) * height),
            )}
            {this.rendermetricComparisonSummary(
              Math.ceil(
                subheaderFontSize * (1 - PROPORTION.TRENDLINE) * height,
              ),
            )}
            {this.renderSubtitle(
              Math.ceil(subtitleFontSize * (1 - PROPORTION.TRENDLINE) * height),
            )}
          </div>
          {this.renderTrendline(chartHeight)}
        </div>
      );
    }
    const shouldApplyOverflow = this.shouldApplyOverflow(height);
    const metricLabelText = metricName ? String(metricName) : '';
    const subtitleText = subtitle ? String(subtitle).trim() : '';
    const metricLabelLower = metricLabelText.toLowerCase();
    const normalizedMetricLabel = metricLabelLower.replace(/\s+/g, '');
    const isCountAlias =
      normalizedMetricLabel === 'sum(count)' ||
      normalizedMetricLabel === 'sum__count' ||
      normalizedMetricLabel === 'count';
    const displayMetricLabel = isCountAlias
      ? t('Refunded rate')
      : metricLabelText;
    const shouldUsePercentFallback =
      isCountAlias ||
      metricLabelLower.includes('rate') ||
      metricLabelLower.includes('percent') ||
      metricLabelLower.includes('%');
    const footerLabel = displayMetricLabel
      ? displayMetricLabel.toUpperCase()
      : t('Metric');
    const fallbackFromBigNumber =
      typeof this.props.bigNumber === 'number' &&
      Number.isFinite(this.props.bigNumber)
        ? shouldUsePercentFallback
          ? `${this.props.bigNumber.toFixed(1)}%`
          : defaultNumberFormatter(this.props.bigNumber)
        : '';
    const footerValue = subtitleText || fallbackFromBigNumber;

    return (
      <div
        className={className}
        style={{
          height,
          ...(shouldApplyOverflow
            ? {
                display: 'block',
                boxSizing: 'border-box',
                overflowX: 'hidden',
                overflowY: 'auto',
                width: '100%',
              }
            : {}),
        }}
      >
        <div className="text-container text-container--kpi">
          {this.renderFallbackWarning()}
          <div className="kpi-circle">
            <div className="kpi-circle-cap" />
            <div className="kpi-circle-inner">
              <div className="kpi-circle-icon">&#8635;</div>
              {this.renderHeader(Math.ceil(headerFontSize * height))}
            </div>
          </div>
          {footerValue && (
            <div className="kpi-footer">
              <span className="kpi-footer-label">{footerLabel}</span>
              <span className="kpi-footer-value">{footerValue}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default styled(BigNumberVis)`
  ${({ theme }) => `
    font-family: ${theme.typography.families.sansSerif};
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    &.no-trendline .subheader-line {
      padding-bottom: 0.3em;
    }

    .text-container {
       display: flex;
       flex-direction: column;
       justify-content: center;
       align-items: center;
       width: 100%;
      .alert {
        font-size: ${theme.typography.sizes.s};
        margin: -0.5em 0 0.4em;
        line-height: 1;
        padding: ${theme.gridUnit}px;
        border-radius: ${theme.gridUnit}px;
      }
    }

    &.no-trendline {
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: ${theme.gridUnit * 4}px ${theme.gridUnit * 4}px
        ${theme.gridUnit * 2}px;
      background: ${theme.colors.grayscale.light5};
      border-radius: ${theme.gridUnit * 3}px;
    }

    &.no-trendline .text-container--kpi {
      flex: 1;
      justify-content: center;
      align-items: center;
      gap: ${theme.gridUnit * 3}px;
      width: 100%;
    }

    &.no-trendline .kpi-circle {
      position: relative;
      width: min(42vw, 150px);
      height: min(42vw, 150px);
      border-radius: 50%;
      background: ${theme.colors.grayscale.light4};
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &.no-trendline .kpi-circle-cap {
      position: absolute;
      top: ${theme.gridUnit * 0.75}px;
      left: 50%;
      transform: translateX(-50%);
      width: ${theme.gridUnit * 4.5}px;
      height: ${theme.gridUnit * 1.9}px;
      border-radius: ${theme.gridUnit * 2}px;
      background: ${theme.colors.grayscale.dark2};
    }

    &.no-trendline .kpi-circle-inner {
      width: 84%;
      height: 84%;
      border-radius: 50%;
      background: ${theme.colors.grayscale.light5};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: ${theme.gridUnit * 0.8}px;
    }

    &.no-trendline .kpi-circle-icon {
      line-height: 1;
      width: ${theme.gridUnit * 4.5}px;
      height: ${theme.gridUnit * 4.5}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${theme.typography.sizes.l}px;
      font-weight: ${theme.typography.weights.bold};
      color: ${theme.colors.primary.base};
      background: ${theme.colors.grayscale.light4};
      border: 1px solid ${theme.colors.grayscale.light2};
    }

    &.no-trendline .header-line {
      margin-bottom: 0;
      color: ${theme.colors.grayscale.dark2};
      font-weight: ${theme.typography.weights.bold};
      line-height: 0.95em;
    }

    &.no-trendline .kpi-footer {
      width: 100%;
      max-width: 360px;
      border-radius: ${theme.gridUnit * 3.5}px;
      background: ${theme.colors.grayscale.light4};
      border: 1px solid ${theme.colors.grayscale.light2};
      padding: ${theme.gridUnit * 2}px ${theme.gridUnit * 3}px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: ${theme.gridUnit * 2}px;
    }

    &.no-trendline .kpi-footer-label {
      color: ${theme.colors.primary.base};
      font-size: ${theme.typography.sizes.xs}px;
      font-weight: ${theme.typography.weights.bold};
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &.no-trendline .kpi-footer-value {
      color: ${theme.colors.success.base};
      font-size: ${theme.typography.sizes.m}px;
      font-weight: ${theme.typography.weights.bold};
      white-space: nowrap;
    }

    .kicker {
      line-height: 1em;
      margin-bottom: ${theme.gridUnit * 2}px;
    }

    .metric-name {
      line-height: 1em;
      margin-bottom: ${theme.gridUnit * 2}px;
    }

    .header-line {
      position: relative;
      line-height: 1em;
      white-space: nowrap;
      margin-bottom:${theme.gridUnit * 2}px;
      span {
        position: absolute;
        bottom: 0;
      }
    }

    .subheader-line {
      line-height: 1em;
      margin-bottom: ${theme.gridUnit * 2}px;
    }

    .subtitle-line {
      line-height: 1em;
      margin-bottom: ${theme.gridUnit * 2}px;
    }

    &.is-fallback-value {
      .kicker,
      .header-line,
      .subheader-line {
        opacity: ${theme.opacity.mediumHeavy};
      }
    }
  `}
`;
