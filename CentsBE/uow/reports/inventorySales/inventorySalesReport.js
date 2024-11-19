const { first, last } = require('lodash');
const { raw } = require('objection');
const AbstractCsvReport = require('../abstractCsvReport');
const Store = require('../../../models/store');
const InventoryItem = require('../../../models/inventoryItem');

const reportUtils = require('../../../utils/reports/reportsUtils');

class InventorySalesReport extends AbstractCsvReport {
    getReportName() {
        return 'Cents_Inventory_Sales_Report';
    }

    getRequiredParams() {
        return ['startDate', 'endDate', 'timeZone', 'stores', 'allStoresCheck', 'businessId'];
    }

    getEmailParams() {
        return {
            storeCount: this.stores.length,
        };
    }

    getReportHeaders() {
        return [
            {
                title: 'Location Name',
                id: 'storeName',
            },
            {
                title: 'Product Name',
                id: 'productName',
            },
            {
                title: 'Product Description',
                id: 'productDescription',
            },
            {
                title: 'Starting Inventory',
                id: 'startingAmount',
            },
            {
                title: 'Ending Inventory',
                id: 'endingAmount',
            },
            {
                title: 'Gross Sales Value',
                id: 'totalSales',
            },
        ];
    }

    getReportObjectType() {
        return 'object';
    }

    async getReportData() {
        const { startDate, endDate, timeZone, stores, allStoresCheck, businessId } = this;

        const [finalStartDate, finalEndDate] = reportUtils.getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );

        const storesFilter =
            allStoresCheck === 'true'
                ? await Store.query()
                      .select('id')
                      .where({ businessId })
                      .then((items) => items.map((item) => item.id))
                : stores;

        const inventoryItems = await InventoryItem.query()
            .withGraphJoined(
                '[store.[settings], inventoryLineItems, serviceLineItems, inventory, inventoryChanges]',
            )
            .select(
                'inventoryItems.id as productId',
                'store.name as storeName',
                'inventory.productName as productName',
                'inventory.description as productDescription',
                'inventoryItems.quantity as endingQuantity',
            )
            .whereIn('inventoryItems.storeId', storesFilter)
            .andWhere('inventoryItems.isFeatured', true)
            .andWhere((builder) =>
                builder
                    .andWhere(
                        raw(
                            `CAST("inventoryLineItems"."createdAt" AT TIME ZONE "store:settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
                        ),
                    )
                    .orWhere(
                        raw(
                            `CAST("serviceLineItems"."createdAt" AT TIME ZONE "store:settings"."timeZone" AS DATE) BETWEEN '${finalStartDate}' AND '${finalEndDate}'`,
                        ),
                    ),
            );

        const inventoryLineItems = inventoryItems.map((item) => item.inventoryLineItems);
        const inventoryTotals = inventoryLineItems.map((item) => ({
            itemId: item.length > 0 ? item[0].inventoryItemId : item.inventoryItemId,
            totalSales: item.length > 0 ? item[0].lineItemTotalCost : item.lineItemTotalCost,
            quantitySold: item.length > 0 ? item[0].lineItemQuantity : item.lineItemQuantity,
        }));
        const serviceLineItems = inventoryItems.map((item) => item.serviceLineItems);
        const serviceTotals = serviceLineItems.map((item) => ({
            itemId: item.length > 0 ? item[0].soldItemId : item.soldItemId,
            totalSales: item.length > 0 ? item[0].lineItemTotalCost : item.lineItemTotalCost,
            quantitySold: item.length > 0 ? item[0].lineItemQuantity : item.lineItemQuantity,
        }));
        const combinedLineItems = inventoryTotals.concat(serviceTotals);

        const mergedLineItems = Object.values(
            combinedLineItems.reduce((acc, { totalSales, quantitySold, ...r }) => {
                const key = Object.entries(r).join('-');
                acc[key] = acc[key] || {
                    ...r,
                    totalSales: 0,
                    quantitySold: 0,
                };
                const final =
                    ((acc[key].totalSales += totalSales),
                    (acc[key].quantitySold += quantitySold),
                    acc);
                return final;
            }, {}),
        );

        const inventorySales = mergedLineItems.map((item, i) => ({
            ...item,
            ...inventoryItems[i],
        }));
        inventorySales.forEach((item) => {
            const individualItem = item;
            delete individualItem.store;
            delete individualItem.inventoryLineItems;
            delete individualItem.serviceLineItems;
            delete individualItem.inventory;

            return item;
        });

        return inventorySales;
    }

    mapReportDataToRows(data) {
        return data
            .filter((row) => row.inventoryChanges)
            .map((row) => {
                const firstChange = first(row.inventoryChanges);
                const lastChange = last(row.inventoryChanges);
                return {
                    storeName: row.storeName,
                    productName: row.productName,
                    productDescription: row.productDescription,
                    startingAmount: firstChange?.startingAmount ?? 0,
                    endingAmount: lastChange?.endingAmount ?? 0,
                    totalSales: row.totalSales,
                };
            });
    }
}

module.exports = InventorySalesReport;
