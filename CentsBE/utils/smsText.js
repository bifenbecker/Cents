// eslint-disable-next-line no-unused-vars
function englishText(order, storeCustomer, secondaryDetails, store, textType, shortURL, settings) {
    const english = {
        CREATE_ORDER: `Laundry Update: Order Received! Click to review your order, add promos and more: ${shortURL}`,
        CREATE_ORDER_POST_PAY: `Laundry Update: Order Received! Click to review your order, add promos and more: ${shortURL}`,
        READY_FOR_PICKUP: `Laundry Update: Your Laundry is Ready! Click to view your order and see return options: ${shortURL}`,
        // COMPLETED: `Thank you for doing your laundry with us! Please rate
        //  order #${order.orderCode} by texting back a number
        // between 1 to 5 (5 being amazing). We really appreciate your feedback,
        //  and hope to see you again soon! View order here ${shortURL}`,
        COMPLETED: `Laundry Update: Order Complete! Click here to view receipt: ${shortURL}`,
        RATING_REPLY: 'Thank you for your feedback, and have a great day!',
    };

    const spanish = {
        CREATE_ORDER: `Actualización de la lavandería: ¡Pedido recibido! Haga clic para revisar su pedido, añadir promos y más: ${shortURL}`,
        CREATE_ORDER_POST_PAY: `Actualización de la lavandería: ¡Pedido recibido! Haga clic para revisar su pedido, añadir promos y más: ${shortURL}`,
        READY_FOR_PICKUP: `Actualización de la lavandería: ¡Su lavandería está lista! Haga clic para ver su pedido y ver las opciones de devolución: ${shortURL}`,
        // COMPLETED: `¡Gracias por lavar la ropa con nosotros! Califique el pedido
        //  #${order.orderCode} enviando un mensaje de texto con un número entre 1 y 5
        // (5 es increíble). Realmente apreciamos sus comentarios y esperamos volver a verlos
        //  pronto. Ver orden aquí ${shortURL}`,
        COMPLETED: `Actualización de la lavandería: ¡Orden completa! Haga clic aquí para ver el recibo: ${shortURL}`,
        RATING_REPLY: 'Gracias por tus comentarios y que tengas un gran día.',
    };
    const { languageId } = storeCustomer;
    if (languageId === 2) {
        return spanish[textType];
    }
    return english[textType];
}

module.exports = exports = englishText;
