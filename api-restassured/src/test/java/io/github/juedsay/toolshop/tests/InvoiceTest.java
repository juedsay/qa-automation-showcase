package io.github.juedsay.toolshop.tests;

import static io.github.juedsay.toolshop.support.Schemas.matchesSchema;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

import io.github.juedsay.toolshop.client.CartsClient;
import io.github.juedsay.toolshop.client.InvoicesClient;
import io.github.juedsay.toolshop.client.ProductsClient;
import io.github.juedsay.toolshop.client.RequestSpecs;
import io.github.juedsay.toolshop.model.Address;
import io.github.juedsay.toolshop.model.CartItem;
import io.github.juedsay.toolshop.model.InvoiceRequest;
import io.github.juedsay.toolshop.support.AuthenticatedCustomer;
import io.github.juedsay.toolshop.support.TestSetup;
import io.restassured.path.json.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Checkout through the API: cart → invoice. Invoices cannot be deleted through the public API,
 * so each run leaves one invoice behind on its own throwaway customer.
 */
class InvoiceTest {

    private static final int QUANTITY = 2;

    private final CartsClient carts = new CartsClient(RequestSpecs.anonymous());
    private AuthenticatedCustomer session;
    private String cartId;
    private String productId;

    @BeforeEach
    void cartWithOneProduct() {
        session = TestSetup.newAuthenticatedCustomer();
        productId = TestSetup.productId("Combination Pliers");
        cartId = carts.create().then().statusCode(201).extract().path("id");
        carts.addItem(cartId, new CartItem(productId, QUANTITY)).then().statusCode(200);
    }

    @Test
    void checkout_creates_an_invoice_that_matches_the_cart() {
        Address billing = TestSetup.billingAddress("US", "62701", "42");
        InvoicesClient invoices = new InvoicesClient(session.spec());

        String invoiceId = invoices.create(InvoiceRequest.cashOnDelivery(cartId, billing))
                .then()
                .statusCode(201)
                .extract().path("id");

        JsonPath invoice = invoices.get(invoiceId)
                .then()
                .statusCode(200)
                .body(matchesSchema("invoice"))
                .body("user_id", equalTo(session.id()))
                .body("status", equalTo("AWAITING_FULFILLMENT"))
                .body("billing_city", equalTo(billing.city()))
                .body("payment.payment_method", equalTo("cash-on-delivery"))
                .body("invoicelines", hasSize(1))
                .body("invoicelines[0].product_id", equalTo(productId))
                .body("invoicelines[0].quantity", equalTo(QUANTITY))
                .extract().jsonPath();

        // Compare against the catalog, not against the invoice's own unit price, so a wrong price is caught.
        double catalogPrice = new ProductsClient(RequestSpecs.anonymous()).byId(productId)
                .then().statusCode(200)
                .extract().jsonPath().getDouble("price");
        assertThat(invoice.getDouble("invoicelines[0].unit_price"))
                .as("invoice line unit price = catalog price")
                .isEqualTo(catalogPrice, within(0.001));
        assertThat(invoice.getDouble("total"))
                .as("invoice total = catalog price x quantity")
                .isEqualTo(catalogPrice * QUANTITY, within(0.001));
    }

    @Test
    void billing_city_must_match_the_postcode() {
        Address mismatched = new Address("Main Street", "42", "Springfield", "Illinois", "US", "62701");

        new InvoicesClient(session.spec()).create(InvoiceRequest.cashOnDelivery(cartId, mismatched))
                .then()
                .statusCode(422)
                .body("billing_country[0]", containsString("The city does not belong to the selected country."));
    }

    @Test
    void checkout_requires_authentication() {
        Address billing = TestSetup.billingAddress("US", "62701", "42");

        new InvoicesClient(RequestSpecs.anonymous()).create(InvoiceRequest.cashOnDelivery(cartId, billing))
                .then()
                .statusCode(401);
    }
}
