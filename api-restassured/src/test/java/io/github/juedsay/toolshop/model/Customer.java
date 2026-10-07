package io.github.juedsay.toolshop.model;

/**
 * Customer payload for registration and profile updates. Null fields are left out of the
 * JSON, so {@link #withoutPassword()} produces a valid profile-update body.
 */
public record Customer(
        String firstName,
        String lastName,
        String email,
        String password,
        String dob,
        String phone,
        Address address) {

    public Customer withoutPassword() {
        return new Customer(firstName, lastName, email, null, dob, phone, address);
    }

    public Customer withEmail(String newEmail) {
        return new Customer(firstName, lastName, newEmail, password, dob, phone, address);
    }

    public Customer withLastName(String newLastName) {
        return new Customer(firstName, newLastName, email, password, dob, phone, address);
    }

    public Customer withAddress(Address newAddress) {
        return new Customer(firstName, lastName, email, password, dob, phone, newAddress);
    }

    public String fullName() {
        return firstName + " " + lastName;
    }
}
