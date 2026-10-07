import { expect, test } from '../../src/fixtures';

test.describe('Checkout', () => {
  test('logged-in customer can buy a product end to end', async ({
    loggedInCustomer: customer,
    homePage,
    productPage,
    header,
    cartPage,
    checkoutPage,
  }) => {
    await homePage.goto();
    await expect(header.userMenu).toHaveText(`${customer.firstName} ${customer.lastName}`);

    await homePage.openProduct('Combination Pliers');
    await productPage.addToCart();
    await expect(header.cartQuantity).toHaveText('1');

    await header.openCart();
    await cartPage.proceedButton.click();

    // Step 2: already signed in, just continue.
    await checkoutPage.signedInProceedButton.click();

    // Step 3: billing address is prefilled from the customer profile. Only fields the app
    // never rewrites are asserted: right after prefilling, the form calls /postcode-lookup,
    // which on the demo returns made-up street/city/state values that replace the profile's.
    await expect(checkoutPage.postalCode).toHaveValue(customer.address.postalCode);
    await expect(checkoutPage.houseNumber).toHaveValue(customer.address.houseNumber);
    await checkoutPage.addressProceedButton.click();

    // Step 4: payment.
    await checkoutPage.payWith('cash-on-delivery');

    await expect(checkoutPage.orderConfirmation).toHaveText(
      /Thanks for your order! Your invoice number is INV-\d+\./,
    );
    await expect(header.cartQuantity).toBeHidden();
  });
});
