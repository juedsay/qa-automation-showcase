package io.github.juedsay.toolshop.model;

/** Postal address as used in the customer profile. {@code country} is an ISO 3166-1 alpha-2 code. */
public record Address(
        String street,
        String houseNumber,
        String city,
        String state,
        String country,
        String postalCode) {
}
