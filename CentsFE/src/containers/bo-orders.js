import curry from 'lodash/curry';
import debounce from 'lodash/debounce';

import { connect } from 'react-redux';
import Orders from '../components/business-owner/orders/orders';
import * as ordersApi from '../api/business-owner/orders';
import { createNamespacer } from '../utils/reducers';
import actionTypes from '../actionTypes';

const ordersAT = actionTypes.businessOwner.orders;
const ordersNamespacer = createNamespacer("BO-ORDERS");

const fetchOrders = async (dispatch, params) => {
    const { keyword, page = 1, stores, status } = params;

    dispatch({
        type: ordersNamespacer(ordersAT.ORDERS_LIST_CALL_STARTED),
        payload: {
            page
        }
    });
    try {
        const resp = await ordersApi.fetchOrders({
            keyword: keyword || null,
            page,
            stores,
            status
        });
        dispatch({
            type: ordersNamespacer(ordersAT.ORDERS_LIST_CALL_SUCCEEDED),
            payload: resp
        });
    }
    catch (e) {
        dispatch({
            type: ordersNamespacer(ordersAT.ORDERS_LIST_CALL_FAILED),
            payload: e
        });
    }
}

const debouncedOrderSearch = debounce(fetchOrders, 500)

const mapStateToProps = (state) => {
    return {
        filteredLocations: state.businessOwner.dashboard.selectedLocations,
        allLocations: state.businessOwner.dashboard.allLocations,
        ...state.businessOwner.orders,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchOrders: curry(fetchOrders)(dispatch),

        setActivePill: (pill) => {
            dispatch({
                type: ordersNamespacer(ordersAT.SET_ACTIVE_STATUS),
                payload: pill,
            });
        },

        handleOrderClick: (order) => {
            dispatch({
                type: ordersNamespacer(ordersAT.SET_ACTIVE_ORDER),
                payload: order,
            })
        },

        fetchInsights: async(stores) => {
            dispatch({
                type: ordersNamespacer(ordersAT.ORDERS_INSIGHTS_CALL_STARTED)
            });
            try {
                const resp = await ordersApi.fetchInsights({stores});
                dispatch({
                    type: ordersNamespacer(ordersAT.ORDERS_INSIGHTS_CALL_SUCCEEDED),
                    payload: resp
                });
            }
            catch (e) {
                dispatch({
                    type: ordersNamespacer(ordersAT.ORDERS_INSIGHTS_CALL_FAILED),
                    payload: e
                });
            }
        },

        fetchOrderDetails: async (order) => {
            if (!order?.id) {
                dispatch({
                    type: ordersNamespacer(ordersAT.RESET_ORDERS_DETAILS)
                });
                return;
            };

            let orderId = order.id;

            dispatch({
                type: ordersNamespacer(ordersAT.ORDERS_DETAILS_CALL_STARTED)
            });
            try {
                let resp;
                if(order.orderableType === 'InventoryOrder') {
                    resp = await ordersApi.fetchInventoryOrderDetails(orderId);
                } else {
                    resp = await ordersApi.fetchOrderDetails(orderId);
                }
                dispatch({
                    type: ordersNamespacer(ordersAT.ORDERS_DETAILS_CALL_SUCCEEDED),
                    payload: resp
                });
            }
            catch (e) {
                dispatch({
                    type: ordersNamespacer(ordersAT.ORDERS_DETAILS_CALL_FAILED),
                    payload: e
                });
            }
        
        },
        setSearchInProgress: (value) => {
			dispatch({
			    type: ordersNamespacer(ordersAT.SET_SEARCH_IN_PROGRESS),
			    payload: value
            });

            if(!value) {
                dispatch({
                    type: ordersNamespacer(ordersAT.SET_ORDER_SEARCH_TEXT),
                    payload: '',
                });
            }
        },
        handleOrderSearch: async (params) => {
            dispatch({
                type: ordersNamespacer(ordersAT.SET_ORDER_SEARCH_TEXT),
                payload: params.keyword || '',
            });

            debouncedOrderSearch(dispatch, params);
        },
        resetOrdersData: () => {
            dispatch({
			    type: ordersNamespacer(ordersAT.RESET_ORDERS_DATA)
            });
        }
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(Orders);
