module.exports = function deliveryWindowOuterWhereQuery(range) {
    return function outerWhere() {
        this.whereBetween('deliveryWindow[1]', range);
        this.whereBetween('deliveryWindow[2]', range);
    };
};
