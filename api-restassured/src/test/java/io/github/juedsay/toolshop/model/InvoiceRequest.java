package io.github.juedsay.toolshop.model;

import java.util.Map;

/** Checkout payload: turns a cart into an invoice for the authenticated customer. */
public record InvoiceRequest(
        String billingStreet,
        String billingHouseNumber,
        String billingCity,
        String billingState,
        String billingCountry,
        String billingPostalCode,
        String paymentMethod,
        Map<String, Object> paymentDetails,
        String cartId) {

    public static InvoiceRequest cashOnDelivery(String cartId, Address billing) {
        return new InvoiceRequest(
                billing.street(),
                billing.houseNumber(),
                billing.city(),
                billing.state(),
                billing.country(),
                billing.postalCode(),
                "cash-on-delivery",
                Map.of(),
                cartId);
    }
}
