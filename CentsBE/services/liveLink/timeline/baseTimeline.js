const BaseService = require('../../base');
const ServiceOrder = require('../../../models/serviceOrders');
const { orderDeliveryStatuses } = require('../../../constants/constants');

const ResidentialOrderStage = require('./orderStage/residentialOrderStage');
const OnlineOrderStage = require('./orderStage/onlineOrderStage');
const ServiceOrderStage = require('./orderStage/serviceOrderStage');
const CanceledOrderStage = require('./orderStage/canceledOrderStage');

const ORDER_STAGE_MAPPER = {
    RESIDENTIAL: ResidentialOrderStage,
    ONLINE: OnlineOrderStage,
    SERVICE: ServiceOrderStage,
    CANCELED: CanceledOrderStage,
};

class BaseTimeline extends BaseService {
    constructor(serviceOrderId) {
        super();
        this.timeline = this.defaultTimeline;
        this.serviceOrderId = serviceOrderId;
        this.serviceOrder = {};
    }

    get defaultTimeline() {
        return {
            header: {
                name: '',
                description: '',
            },
            footer: {
                name: '',
                description: '',
            },
            imageKey: '',
            deliveryProvider: '',
            totalNumberOfSteps: 5,
        };
    }

    get orderStageClass() {
        if (['CANCELLED', 'CANCELED'].includes(this.serviceOrder.status)) {
            return ORDER_STAGE_MAPPER.CANCELED;
        }
        return ORDER_STAGE_MAPPER[this.serviceOrder.orderType];
    }

    async perform() {
        this.addStep();
        await this.setServiceOrderDetails();
        await this.setOrderStage();
        this.buildHeader();
        this.buildFooter();
        this.setImageKey();
        this.setDeliveryProvider();
        return this.timeline;
    }

    async setOrderStage() {
        const OrderStageClass = this.orderStageClass;
        this.orderStage = new OrderStageClass(this.serviceOrder, this.timeline.step);
        await this.orderStage.setupThirdPartyDetails();
    }

    setImageKey() {
        this.timeline.imageKey = this.orderStage.getImageKey() || '';
    }

    buildHeader() {
        this.timeline.header = this.orderStage.getHeaderDetails();
    }

    buildFooter() {
        this.timeline.footer = this.orderStage.getFooterDetails();
    }

    addStep() {
        throw new Error('Step not implemented');
    }

    async setServiceOrderDetails() {
        this.serviceOrder = await ServiceOrder.query(this.transaction)
            .withGraphFetched(
                '[store.[settings],serviceOrderRouteDeliveries(serviceOrderRouteDelivery).routeDelivery.[route(route).[driver.[user],timing]],order.[pickup(pickup).[timing,routeDelivery.[route.[driver.[user]]]],delivery(delivery).[timing,routeDelivery.[route.[driver.[user]]]]]]',
            )
            .modifiers({
                pickup: (query) => {
                    query
                        .where('status', '!=', orderDeliveryStatuses.CANCELED)
                        .orderBy('id', 'DESC')
                        .first();
                },
                delivery: (query) => {
                    query
                        .where('status', '!=', orderDeliveryStatuses.CANCELED)
                        .orderBy('id', 'DESC')
                        .first();
                },
                serviceOrderRouteDelivery: (query) => {
                    query.orderBy('id', 'DESC').first();
                },
                route: (query) => {
                    query.orderBy('id', 'DESC').first();
                },
            })
            .findById(this.serviceOrderId);
    }

    get delivery() {
        return this.serviceOrder.order.delivery || null;
    }

    get pickup() {
        return this.serviceOrder.order.pickup || null;
    }

    get returnMethod() {
        if (this.serviceOrder.returnMethod) {
            if (this.serviceOrder.returnMethod === 'DELIVERY' && !this.delivery) {
                return 'IN_STORE_PICKUP';
            }
            if (this.serviceOrder.returnMethod === 'DELIVERY' && this.delivery) {
                return this.serviceOrder.returnMethod;
            }
            return this.serviceOrder.returnMethod;
        }
        if (!this.serviceOrder.returnMethod && !this.delivery) {
            return 'IN_STORE_PICKUP';
        }

        return 'DELIVERY';
    }

    setDeliveryProvider() {
        this.timeline.deliveryProvider = '';
    }
}

module.exports = exports = BaseTimeline;
