package io.github.juedsay.toolshop.support;

import io.github.juedsay.toolshop.client.RequestSpecs;
import io.github.juedsay.toolshop.model.Customer;
import io.restassured.specification.RequestSpecification;

/** A registered customer with a valid JWT (tokens expire after 5 minutes). */
public record AuthenticatedCustomer(String id, Customer customer, String token) {

    public RequestSpecification spec() {
        return RequestSpecs.authenticated(token);
    }
}
