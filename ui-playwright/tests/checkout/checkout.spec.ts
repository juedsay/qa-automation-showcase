import { expect, test } from '../../src/fixtures';

test.describe('Checkout', () => {
  test('logged-in customer can buy a product end to end', async ({
    loggedInPage: page,
    newCustomer,
    homePage,
    productPage,
    header,
    cartPage,
    checkoutPage,
  }) => {
    await homePage.goto();
    await expect(header.userMenu).toHaveText(`${newCustomer.firstName} ${newCustomer.lastName}`);

    await homePage.openProduct('Combination Pliers');
    await productPage.addToCart();
    await expect(header.cartQuantity).toHaveText('1');

    await header.openCart();
    await cartPage.proceedButton.click();

    // Step 2: already signed in, just continue.
    await checkoutPage.signedInProceedButton.click();

    // Step 3: billing address is prefilled from the customer profile.
    await expect(checkoutPage.street).toHaveValue(newCustomer.address.street);
    await expect(checkoutPage.city).toHaveValue(newCustomer.address.city);
    await expect(checkoutPage.postalCode).toHaveValue(newCustomer.address.postalCode);
    await checkoutPage.addressProceedButton.click();

    // Step 4: payment.
    await checkoutPage.payWith('cash-on-delivery');

    await expect(checkoutPage.orderConfirmation).toHaveText(
      /Thanks for your order! Your invoice number is INV-\d+\./,
    );
    await expect(page.getByTestId('cart-quantity')).toBeHidden();
  });
});
