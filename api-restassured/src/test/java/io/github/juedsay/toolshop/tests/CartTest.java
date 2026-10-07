package io.github.juedsay.toolshop.tests;

import static io.github.juedsay.toolshop.support.Schemas.matchesSchema;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

import io.github.juedsay.toolshop.client.CartsClient;
import io.github.juedsay.toolshop.client.RequestSpecs;
import io.github.juedsay.toolshop.model.CartItem;
import io.github.juedsay.toolshop.support.TestSetup;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class CartTest {

    private final CartsClient carts = new CartsClient(RequestSpecs.anonymous());
    private String cartId;
    private String productId;

    @BeforeEach
    void createCart() {
        productId = TestSetup.productId("Combination Pliers");
        cartId = carts.create().then().statusCode(201).extract().path("id");
    }

    @AfterEach
    void deleteCart() {
        // Best-effort cleanup; the lifecycle test already deletes its own cart (then this returns 404).
        carts.delete(cartId);
    }

    @Test
    void cart_supports_add_read_update_remove_and_delete() {
        carts.addItem(cartId, new CartItem(productId, 2))
                .then().statusCode(200);

        carts.get(cartId)
                .then()
                .statusCode(200)
                .body(matchesSchema("cart"))
                .body("cart_items", hasSize(1))
                .body("cart_items[0].product_id", equalTo(productId))
                .body("cart_items[0].quantity", equalTo(2));

        carts.updateQuantity(cartId, new CartItem(productId, 5))
                .then().statusCode(200);
        carts.get(cartId)
                .then().body("cart_items[0].quantity", equalTo(5));

        carts.removeItem(cartId, productId)
                .then().statusCode(204);
        carts.get(cartId)
                .then().statusCode(200).body("cart_items", empty());

        carts.delete(cartId)
                .then().statusCode(204);
        carts.get(cartId)
                .then().statusCode(404);
    }

    @ParameterizedTest(name = "quantity {0}")
    @ValueSource(ints = {0, -1})
    void quantity_below_one_is_rejected(int quantity) {
        carts.addItem(cartId, new CartItem(productId, quantity))
                .then()
                .statusCode(422)
                .body("errors.quantity[0]", equalTo("The quantity field must be at least 1."));
    }

    @Test
    void unknown_product_cannot_be_added() {
        carts.addItem(cartId, new CartItem("01ZZZZZZZZZZZZZZZZZZZZZZZZ", 1))
                .then()
                .statusCode(422)
                .body("errors.product_id[0]", equalTo("The selected product id is invalid."));
    }
}
