import * as React from 'react';
import { PureComponent } from 'react';
import * as PropTypes from 'prop-types';
// import isArray from 'lodash/isArray';
import classnames from 'classnames';
import Popover from '../../popover';
import Tabs from '../../tabs';
import { CascaderHandler, CascaderValue, ICascaderItem } from '../types';

const TabPanel = Tabs.TabPanel;
const withPopover = Popover.withPopover;

export interface ItabsContentProps {
  prefix?: string;
  className?: string;
  clickHandler: CascaderHandler;
  value: CascaderValue[];
  options: ICascaderItem[];
  isLoading?: boolean;
  recursiveNextOptions(
    options: ICascaderItem[],
    value: CascaderValue
  ): ICascaderItem[];
  expandTrigger?: 'click' | 'hover';
  loadingStage: number;
  popover: Popover;
  activeId: number | string;
  onTabChange: (id: string | number) => void;
  title: React.ReactNode[];
  i18n: {
    title: string;
  };
}

class TabsContent extends PureComponent<ItabsContentProps> {
  static propTypes = {
    prefix: PropTypes.string,
    className: PropTypes.string,
    clickHandler: PropTypes.func,
    value: PropTypes.array,
    options: PropTypes.array,
    title: PropTypes.array,
    isLoading: PropTypes.bool,
    recursiveNextOptions: PropTypes.func,
    expandTrigger: PropTypes.oneOf(['click', 'hover']),
  };

  renderCascaderItems(items, stage, popover) {
    let { prefix, value, clickHandler } = this.props;

    let cascaderItems = items.map(item => {
      let cascaderItemCls = classnames({
        [`${prefix}-cascader__list-link`]: true,
        active: item.id === value[stage - 1],
      });

      return (
        <div className={`${prefix}-cascader__list-item`} key={item.id}>
          <span
            className={cascaderItemCls}
            title={item.title}
            onClick={() => clickHandler(item, stage, popover)}
          >
            {item.title}
          </span>
        </div>
      );
    });

    return <div className={`${prefix}-cascader__list`}>{cascaderItems}</div>;
  }

  renderTabTitle(title: React.ReactNode, stage: number) {
    let { prefix, isLoading, loadingStage } = this.props;

    if (isLoading && stage === loadingStage) {
      return (
        <div className={`${prefix}-cascader__loading`}>
          <div className={`${prefix}-cascader__loading-label`}>{title}</div>
          <div className={`${prefix}-cascader__loading-icon`} />
        </div>
      );
    }

    return title;
  }

  renderPanels(popover, i18n) {
    let PanelEls = [];
    let tabIndex = 1;
    let { title, options, value, recursiveNextOptions } = this.props;

    let tabTitle = i18n.title;

    title = Array.isArray(title) ? title : [];
    if (title.length > 0) {
      tabTitle = title[0];
    }

    PanelEls.push(
      <TabPanel
        tab={this.renderTabTitle(tabTitle, tabIndex)}
        id={tabIndex}
        key={tabIndex}
      >
        {this.renderCascaderItems(options, tabIndex, popover)}
      </TabPanel>
    );

    if (value && value.length > 0) {
      for (let i = 0; i < value.length; i++) {
        tabIndex++;
        options = recursiveNextOptions(options, value[i]);
        if (title.length >= tabIndex) {
          tabTitle = title[tabIndex - 1];
        } else {
          tabTitle = i18n.title;
        }
        if (options) {
          PanelEls.push(
            <TabPanel
              tab={this.renderTabTitle(tabTitle, tabIndex)}
              id={tabIndex}
              key={tabIndex}
            >
              {this.renderCascaderItems(options, tabIndex, popover)}
            </TabPanel>
          );
        }
      }
    }

    return PanelEls;
  }

  render() {
    const { prefix, activeId, popover, i18n, onTabChange } = this.props;
    return (
      <div className={`${prefix}-cascader__popup-inner`}>
        <Tabs
          activeId={activeId}
          onTabChange={onTabChange}
          className={`${prefix}-cascader__tabs`}
        >
          {this.renderPanels(popover, i18n)}
        </Tabs>
      </div>
    );
  }
}

export default withPopover(TabsContent as any) as typeof TabsContent;
