package io.github.juedsay.toolshop.client;

import static io.restassured.RestAssured.given;

import io.restassured.specification.RequestSpecification;

/**
 * Base for the per-resource clients. The request specification is injected, so the same
 * client works anonymously or as a given customer ({@link RequestSpecs#authenticated}).
 *
 * <p>Clients only send requests and return the raw response; status codes, bodies and
 * schemas are asserted in the tests, where the expectation belongs.
 */
abstract class ApiClient {

    private final RequestSpecification spec;

    protected ApiClient(RequestSpecification spec) {
        this.spec = spec;
    }

    protected RequestSpecification request() {
        return given().spec(spec);
    }
}
