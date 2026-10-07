package io.github.juedsay.toolshop.support;

import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

import io.restassured.module.jsv.JsonSchemaValidator;

/** JSON Schemas (draft-04, as supported by RestAssured's validator) under {@code src/test/resources/schemas}. */
public final class Schemas {

    private Schemas() {
    }

    public static JsonSchemaValidator matchesSchema(String name) {
        return matchesJsonSchemaInClasspath("schemas/" + name + ".json");
    }
}
