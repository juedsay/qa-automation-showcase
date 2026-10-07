import { expect, test } from '../../src/fixtures';

const PLIERS = 'Combination Pliers';
const SLIP_JOINT = 'Slip Joint Pliers';

/** Parses a price label such as "$14.15" or "14.15" into a number. */
const toNumber = (text: string | null) => Number((text ?? '').replace(/[^0-9.]/g, ''));

test.describe('Cart', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('adding a product updates the cart badge', async ({ homePage, productPage, header }) => {
    await homePage.openProduct(PLIERS);
    await productPage.addToCart();

    await expect(productPage.addedToCartToast).toBeVisible();
    await expect(header.cartQuantity).toHaveText('1');
  });

  test('cart lists every added product', async ({ page, homePage, productPage, header, cartPage }) => {
    await homePage.openProduct(PLIERS);
    await productPage.addToCart();
    await expect(header.cartQuantity).toHaveText('1');

    await page.goBack();
    await homePage.openProduct(SLIP_JOINT);
    await productPage.addToCart();
    await expect(header.cartQuantity).toHaveText('2');

    await header.openCart();
    await expect(cartPage.productTitles).toHaveCount(2);
    await expect(cartPage.row(PLIERS)).toBeVisible();
    await expect(cartPage.row(SLIP_JOINT)).toBeVisible();
  });

  test('changing the quantity recalculates line price and total', async ({ homePage, productPage, header, cartPage }) => {
    await homePage.openProduct(PLIERS);
    const unitPrice = toNumber(await productPage.unitPrice.textContent());
    await productPage.addToCart();
    await header.openCart();

    await cartPage.setQuantity(PLIERS, 3);

    const expected = `$${(unitPrice * 3).toFixed(2)}`;
    await expect(cartPage.linePriceOf(PLIERS)).toHaveText(expected);
    await expect(cartPage.total).toHaveText(expected);
    await expect(header.cartQuantity).toHaveText('3');
  });

  test('removing the only product empties the cart', async ({ homePage, productPage, header, cartPage }) => {
    await homePage.openProduct(PLIERS);
    await productPage.addToCart();
    await header.openCart();
    await expect(cartPage.row(PLIERS)).toBeVisible();

    await cartPage.remove(PLIERS);

    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.productTitles).toHaveCount(0);
  });
});
