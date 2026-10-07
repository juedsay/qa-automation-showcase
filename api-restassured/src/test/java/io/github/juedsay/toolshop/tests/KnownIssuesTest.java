package io.github.juedsay.toolshop.tests;

import static org.hamcrest.Matchers.hasKey;

import io.github.juedsay.toolshop.client.CatalogAdminClient;
import io.github.juedsay.toolshop.client.RequestSpecs;
import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * Characterization tests for defects found while building this suite. Each test asserts the
 * CURRENT (wrong) behavior, so it passes today and fails the day the defect is fixed — that
 * failure is the signal to flip the assertion to the expected behavior.
 */
@Tag("known-issue")
class KnownIssuesTest {

    private final CatalogAdminClient catalogAdmin = new CatalogAdminClient(RequestSpecs.anonymous());

    /**
     * Expected: 401 Unauthorized for an anonymous caller, as DELETE on the same resources does.
     * Actual: the request reaches validation (422), so creating catalog data does not require
     * authentication. An empty body is sent on purpose, so nothing is created on the shared site.
     */
    @ParameterizedTest(name = "POST /{0}")
    @ValueSource(strings = {"brands", "categories", "products"})
    void catalog_create_endpoints_do_not_require_authentication(String resource) {
        catalogAdmin.create(resource, Map.of())
                .then()
                .statusCode(422)
                .body("$", hasKey("name"));
    }
}
