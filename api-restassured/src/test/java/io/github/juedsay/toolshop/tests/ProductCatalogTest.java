package io.github.juedsay.toolshop.tests;

import static io.github.juedsay.toolshop.support.Schemas.matchesSchema;
import static org.hamcrest.Matchers.containsStringIgnoringCase;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.hamcrest.Matchers.not;

import io.github.juedsay.toolshop.client.ProductsClient;
import io.github.juedsay.toolshop.client.RequestSpecs;
import io.github.juedsay.toolshop.support.TestSetup;
import org.junit.jupiter.api.Test;

/** Read-only checks against the seeded catalog; no data is created. */
class ProductCatalogTest {

    private final ProductsClient products = new ProductsClient(RequestSpecs.anonymous());

    @Test
    void product_list_is_paginated() {
        products.page(1)
                .then()
                .statusCode(200)
                .body(matchesSchema("product-page"))
                .body("current_page", equalTo(1))
                .body("data", not(empty()))
                .body("data.size()", lessThanOrEqualTo(9));
    }

    @Test
    void product_can_be_fetched_by_id() {
        String id = TestSetup.productId("Combination Pliers");

        products.byId(id)
                .then()
                .statusCode(200)
                .body(matchesSchema("product"))
                .body("id", equalTo(id))
                .body("name", equalTo("Combination Pliers"));
    }

    @Test
    void unknown_product_returns_404() {
        products.byId("01ZZZZZZZZZZZZZZZZZZZZZZZZ")
                .then()
                .statusCode(404)
                .body("message", equalTo("Requested item not found"));
    }

    @Test
    void search_returns_only_matching_products() {
        products.search("pliers")
                .then()
                .statusCode(200)
                .body(matchesSchema("product-page"))
                .body("data", not(empty()))
                .body("data.name", everyItem(containsStringIgnoringCase("pliers")));
    }

    @Test
    void category_filter_returns_only_products_of_that_category() {
        String hammerCategoryId = TestSetup.subcategoryId("Hammer");

        products.byCategory(hammerCategoryId)
                .then()
                .statusCode(200)
                .body("data", not(empty()))
                .body("data.category.name", everyItem(equalTo("Hammer")));
    }
}
