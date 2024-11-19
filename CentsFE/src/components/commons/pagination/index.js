import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight
} from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";

const noOP = ()=>{};

class Pagination extends Component {
  state = {
    currentPage: this.props.currentPage,
    totalPage: this.props.totalPage,
    leftChevronDisabled: false,
    rightChevronDisabled: false,
    extremeLeftChevronDisabled: false,
    extremeRightChevronDisabled: false,
    dynamicPages: [1, 2, 3, 4, 5]
  };

  componentDidMount() {
    const { currentPage, totalPage } = this.props;

    if (currentPage === 1 && currentPage < totalPage)
      this.setState({
        leftChevronDisabled: true,
        extremeLeftChevronDisabled: true
      });
    else if (currentPage === totalPage)
      this.setState({
        rightChevronDisabled: true,
        extremeRightChevronDisabled: true
      });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentPage !== nextProps.currentPage) {
      this.setState({ currentPage: nextProps.currentPage });
    }
  }

  handlePagination = page => {
    const { totalPage, dynamicPages, currentPage } = this.state;
    this.props.handlePagination(page);

    // right chevron
    if (page < totalPage) {
      this.setState({ rightChevronDisabled: false });
    } else if (page === totalPage) {
      this.setState({ rightChevronDisabled: true });
    }

    // left chevron
    if (page > 1) {
      this.setState({ leftChevronDisabled: false });
    } else if (page === 1) {
      this.setState({ leftChevronDisabled: true });
    }

    // dynamic pages
    if (totalPage > 5) {
      const len = dynamicPages.length;
      const index = dynamicPages.indexOf(page);

      if (index >= Math.round(len / 2)) {
        const lastEl = dynamicPages[len - 1];
        // elements next to mid element
        if (lastEl < totalPage) {
          if (page === lastEl && lastEl !== totalPage) {
            // far element next to mid
            if (totalPage - lastEl > 1) {
              let newDynamicPages = [];
              // pop first 2 elements
              dynamicPages.shift();
              dynamicPages.shift();
              newDynamicPages = dynamicPages;
              // push bigger elements in incremental sequence twice
              newDynamicPages.push(lastEl + 1);
              newDynamicPages.push(lastEl + 2);
              this.setState({ dynamicPages: newDynamicPages });
            } else {
              // edge case: when last element is (last - 1)
              let newDynamicPages = [];
              // pop first 1 element
              dynamicPages.shift();
              newDynamicPages = dynamicPages;
              // push bigger elements in incremental sequence once
              newDynamicPages.push(lastEl + 1);
              this.setState({ dynamicPages: newDynamicPages });
            }
          } else {
            // immediate element next to mid
            let newDynamicPages = [];
            // pop first element
            dynamicPages.shift();
            newDynamicPages = dynamicPages;
            // push bigger element to array
            newDynamicPages.push(lastEl + 1);
            this.setState({ dynamicPages: newDynamicPages });
          }
        }
      } else {
        // elements previous to mid element
        const firstEl = dynamicPages[0];
        if (firstEl > 1) {
          if (page === firstEl && firstEl !== 1) {
            // far element previous to mid
            if (firstEl - 1 > 1) {
              let newDynamicPages = [];
              // pop last 2 elements
              dynamicPages.pop();
              dynamicPages.pop();
              newDynamicPages = dynamicPages;
              // push smaller elements in decremental sequence twice
              newDynamicPages.unshift(firstEl - 1);
              newDynamicPages.unshift(firstEl - 2);
              this.setState({ dynamicPages: newDynamicPages });
            } else {
              // edge case: when first element is (first + 1)
              let newDynamicPages = [];
              // pop last 1 element
              dynamicPages.pop();
              newDynamicPages = dynamicPages;
              // push smaller elements in decremental sequence once
              newDynamicPages.unshift(firstEl - 1);
              this.setState({ dynamicPages: newDynamicPages });
            }
          } else {
            // immediate element previous to mid
            let newDynamicPages = [];
            // pop last element
            dynamicPages.pop();
            newDynamicPages = dynamicPages;
            // push smaller element to beginning of array
            newDynamicPages.unshift(firstEl - 1);
            this.setState({ dynamicPages: newDynamicPages });
          }
        }
      }
    }

    // update extreme chevrons
    if (currentPage > 0) {
      this.setState({ extremeLeftChevronDisabled: false });
    }
    if (currentPage <= totalPage) {
      this.setState({ extremeRightChevronDisabled: false });
    }
  };

  handleLeftPagination = () => {
    const { leftChevronDisabled } = this.state;

    if (!leftChevronDisabled) {
      const { currentPage, totalPage, dynamicPages } = this.state;
      const prevPage = currentPage - 1;
      if (prevPage >= 1) {
        this.props.handlePagination(prevPage);
        // left chevron
        if (prevPage === 1)
          this.setState({
            leftChevronDisabled: true
          });
        // right chevron
        if (prevPage < totalPage)
          this.setState({ rightChevronDisabled: false });

        // dynamic pages
        if (totalPage > 5) {
          const firstEl = dynamicPages[0];

          if (currentPage === firstEl && firstEl !== 1) {
            let newDynamicPages = [];
            // pop last element
            dynamicPages.pop();
            newDynamicPages = dynamicPages;
            // push smaller element to the beginning of array
            newDynamicPages.unshift(firstEl - 1);
            this.setState({ dynamicPages: newDynamicPages });
          }
        } // dynamic pages ends
      }

      // update extreme chevrons
      if (currentPage > 0) {
        this.setState({ extremeLeftChevronDisabled: false });
      }
      if (currentPage <= totalPage) {
        this.setState({ extremeRightChevronDisabled: false });
      }
    }
  };

  handleRightPagination = () => {
    const { rightChevronDisabled } = this.state;

    if (!rightChevronDisabled) {
      const { currentPage, totalPage, dynamicPages } = this.state;
      const nextPage = currentPage + 1;
      if (nextPage <= totalPage) {
        this.props.handlePagination(nextPage);
        // right chevron
        if (nextPage === totalPage)
          this.setState({ rightChevronDisabled: true });
        // left chevron
        if (nextPage > 1) this.setState({ leftChevronDisabled: false });

        // dynamic pages
        if (totalPage > 5) {
          const len = dynamicPages.length;
          const lastEl = dynamicPages[len - 1];

          if (currentPage === lastEl && lastEl !== totalPage) {
            let newDynamicPages = [];
            // pop first element
            dynamicPages.shift();
            newDynamicPages = dynamicPages;
            // push bigger element to array
            newDynamicPages.push(lastEl + 1);
            this.setState({ dynamicPages: newDynamicPages });
          }
        } // dynamic pages ends
      }

      // update extreme chevrons
      if (currentPage > 0) {
        this.setState({ extremeLeftChevronDisabled: false });
      }
      if (currentPage <= totalPage) {
        this.setState({ extremeRightChevronDisabled: false });
      }
    }
  };

  handleExtremeLeftPagination = () => {
    const { totalPage } = this.state;
    if (totalPage > 5) {
      this.props.handlePagination(1);
      let count = 0;
      let newDynamicPages = [];
      let newPage = 1;
      do {
        newDynamicPages.push(newPage);
        newPage += 1;
        count += 1;
      } while (count < 5);
      this.setState({ dynamicPages: newDynamicPages });
    } else {
      this.props.handlePagination(1);
    }
    this.setState({
      leftChevronDisabled: true,
      extremeLeftChevronDisabled: true,
      rightChevronDisabled: false,
      extremeRightChevronDisabled: false
    });
  };

  handleExtremeRightPagination = () => {
    const { totalPage } = this.state;
    if (totalPage > 5) {
      this.props.handlePagination(totalPage);
      let count = 0;
      let newDynamicPages = [];
      let newPage = totalPage;
      do {
        newDynamicPages.push(newPage);
        newPage -= 1;
        count += 1;
      } while (count < 5);
      newDynamicPages = newDynamicPages.reverse();
      this.setState({ dynamicPages: newDynamicPages });
    } else {
      this.props.handlePagination(totalPage);
    }
    this.setState({
      leftChevronDisabled: false,
      extremeLeftChevronDisabled: false,
      rightChevronDisabled: true,
      extremeRightChevronDisabled: true
    });
  };

  render() {
    const {
      leftChevronDisabled,
      rightChevronDisabled,
      extremeLeftChevronDisabled,
      extremeRightChevronDisabled
    } = this.state;
    const { currentPage, totalPage, dynamicPages } = this.state;
    let paginationItems = [];
    for (let index = 1; index <= totalPage; index++) {
      paginationItems.push({ page: index });
    }

    return (
      <div className="pagination">
        <span
          onClick={this.handleExtremeLeftPagination}
          className={cx("chevron", { disabled: extremeLeftChevronDisabled })}
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
        </span>
        <span
          onClick={this.handleLeftPagination}
          className={cx("chevron", { disabled: leftChevronDisabled })}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </span>

        {totalPage <= 5
          ? paginationItems.map((item, index) => {
              const isActive = item.page === currentPage
              const activePage = isActive ? "active-page" : null;

              return (
                <span
                  key={index}
                  className={activePage}
                  onClick={isActive ? noOP : () => this.handlePagination(item.page)}
                >
                  {item.page}
                </span>
              );
            })
          : dynamicPages.map((page, index) => {
              const isActive = page === currentPage
              const activePage = isActive ? "active-page" : null;

              return (
                <span
                  key={index}
                  className={activePage}
                  onClick={isActive ? noOP : () => this.handlePagination(page)}
                >
                  {page}
                </span>
              );
            })}
        <span
          onClick={this.handleRightPagination}
          className={cx("chevron", { disabled: rightChevronDisabled })}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </span>
        <span
          onClick={this.handleExtremeRightPagination}
          className={cx("chevron", { disabled: extremeRightChevronDisabled })}
        >
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        </span>
      </div>
    );
  }
}

export default Pagination;
