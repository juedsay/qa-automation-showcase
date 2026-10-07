package io.github.juedsay.toolshop.client;

import io.github.juedsay.toolshop.model.CartItem;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

/** {@code /carts}: carts are anonymous and identified only by their id. */
public class CartsClient extends ApiClient {

    public CartsClient(RequestSpecification spec) {
        super(spec);
    }

    public Response create() {
        return request().post("/carts");
    }

    public Response addItem(String cartId, CartItem item) {
        return request().body(item).post("/carts/{id}", cartId);
    }

    public Response get(String cartId) {
        return request().get("/carts/{id}", cartId);
    }

    public Response updateQuantity(String cartId, CartItem item) {
        return request().body(item).put("/carts/{id}/product/quantity", cartId);
    }

    public Response removeItem(String cartId, String productId) {
        return request().delete("/carts/{id}/product/{productId}", cartId, productId);
    }

    public Response delete(String cartId) {
        return request().delete("/carts/{id}", cartId);
    }
}
