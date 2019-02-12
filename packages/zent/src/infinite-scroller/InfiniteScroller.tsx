import * as React from 'react';
import { Component } from 'react';
import * as PropTypes from 'prop-types';
import cx from 'classnames';
import Loading from '../loading';

export interface IInfiniteScrollerProps {
  className?: string;
  prefix?: string;
  hasMore?: boolean;
  loadMore?: (() => Promise<unknown>) | ((stopLoading?: () => void) => void);
  offset?: number;
  initialLoad?: boolean;
  useWindow?: boolean;
  useCapture?: boolean;
  loader?: React.ReactNode;
}

export class InfiniteScroller extends Component<IInfiniteScrollerProps> {
  static propTypes = {
    prefix: PropTypes.string,
    className: PropTypes.string,
    hasMore: PropTypes.bool,
    loadMore: PropTypes.func,
    offset: PropTypes.number,
    initialLoad: PropTypes.bool,
    useWindow: PropTypes.bool,
    useCapture: PropTypes.bool,
    loader: PropTypes.node,
  };

  static defaultProps = {
    prefix: 'zent',
    hasMore: true,
    offset: 20,
    initialLoad: true,
    useWindow: true,
    useCapture: false,
    loader: <Loading height={60} show />,
  };

  scroller: HTMLDivElement | null = null;

  state = {
    isLoading: false,
  };

  stopLoading = () => {
    this.setState({ isLoading: false });
  };

  calculateTopPosition = el => {
    if (!el) {
      return 0;
    }
    return el.offsetTop + this.calculateTopPosition(el.offsetParent);
  };

  getWindowScrollTop = () => {
    return window.pageYOffset !== undefined
      ? window.pageYOffset
      : (document.documentElement || (document.body.parentNode as HTMLHtmlElement) || document.body)
          .scrollTop;
  };

  isScrollAtBottom = () => {
    const { offset, useWindow } = this.props;
    let offsetDistance;

    if (useWindow) {
      const windowScrollTop = this.getWindowScrollTop();
      offsetDistance =
        this.calculateTopPosition(this.scroller) +
        this.scroller.offsetHeight -
        windowScrollTop -
        window.innerHeight;
    } else {
      const { scrollHeight, clientHeight, scrollTop } = this.scroller;
      offsetDistance = scrollHeight - clientHeight - scrollTop;
    }

    return offsetDistance <= offset;
  };

  handleScroll = () => {
    const { hasMore, loadMore } = this.props;
    const { isLoading } = this.state;
    if (!hasMore || !this.isScrollAtBottom() || isLoading) {
      return;
    }

    this.setState({
      isLoading: true,
    });

    if (loadMore.length > 0) {
      loadMore(this.stopLoading);
    } else {
      (loadMore() as Promise<unknown>)
        .then(this.stopLoading)
        .catch(this.stopLoading);
    }
  };

  addScrollListener = () => {
    const { useWindow, useCapture } = this.props;

    let scrollEl: Window | HTMLDivElement = window;
    if (!useWindow) {
      scrollEl = this.scroller;
    }

    scrollEl.addEventListener('scroll', this.handleScroll, useCapture);
    scrollEl.addEventListener('resize', this.handleScroll, useCapture);
  };

  removeScrollListener = () => {
    const { useWindow, useCapture } = this.props;

    let scrollEl: Window | HTMLDivElement = window;
    if (!useWindow) {
      scrollEl = this.scroller;
    }

    scrollEl.removeEventListener('scroll', this.handleScroll, useCapture);
    scrollEl.removeEventListener('resize', this.handleScroll, useCapture);
  };

  componentDidMount() {
    const { loadMore, initialLoad } = this.props;

    this.addScrollListener();

    if (initialLoad && loadMore) {
      loadMore();
    }
  }

  componentWillUnmount() {
    this.removeScrollListener();
  }

  render() {
    const {
      prefix,
      className,
      children,
      hasMore,
      loader,
      useWindow,
    } = this.props;
    const { isLoading } = this.state;
    const classString = cx(`${prefix}-infinite-scroller`, className, {
      [`${prefix}-infinite-scroller-y`]: !useWindow,
    });
    return (
      <div ref={scroller => (this.scroller = scroller)} className={classString}>
        {children}
        {hasMore && isLoading && loader}
      </div>
    );
  }
}

export default InfiniteScroller;
