package io.github.juedsay.toolshop.tests;

import static io.github.juedsay.toolshop.support.Schemas.matchesSchema;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.equalTo;

import io.github.juedsay.toolshop.client.FavoritesClient;
import io.github.juedsay.toolshop.client.RequestSpecs;
import io.github.juedsay.toolshop.support.AuthenticatedCustomer;
import io.github.juedsay.toolshop.support.TestSetup;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FavoritesTest {

    private FavoritesClient favorites;
    private String productId;

    @BeforeEach
    void newCustomer() {
        AuthenticatedCustomer session = TestSetup.newAuthenticatedCustomer();
        favorites = new FavoritesClient(session.spec());
        productId = TestSetup.productId("Slip Joint Pliers");
    }

    @AfterEach
    void removeLeftoverFavorites() {
        favorites.list().then().extract().jsonPath().getList("id", String.class)
                .forEach(favorites::delete);
    }

    @Test
    void favorite_can_be_added_listed_and_removed() {
        String favoriteId = favorites.add(productId)
                .then().statusCode(201).body("product_id", equalTo(productId))
                .extract().path("id");

        favorites.list()
                .then()
                .statusCode(200)
                .body(matchesSchema("favorites"))
                .body("product.name", contains("Slip Joint Pliers"));

        favorites.delete(favoriteId)
                .then().statusCode(204);
        favorites.get(favoriteId)
                .then().statusCode(404);
        favorites.list()
                .then().body("$", empty());
    }

    @Test
    void same_product_cannot_be_favorited_twice() {
        favorites.add(productId).then().statusCode(201);

        favorites.add(productId)
                .then()
                .statusCode(409)
                .body("message", equalTo("Duplicate Entry"));
    }

    @Test
    void favorites_require_authentication() {
        new FavoritesClient(RequestSpecs.anonymous()).list()
                .then()
                .statusCode(401);
    }
}
