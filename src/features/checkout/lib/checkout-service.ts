import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import {
  buildShippingAddressSnapshot,
  getAddressForUser,
} from "@/features/account/lib/address-repository";
import {
  evaluateCoupon,
  type AppliedCoupon,
} from "@/features/checkout/lib/coupon-service";
import type { Json } from "@/types/database";
import type {
  CheckoutItem,
  CheckoutTotals,
  CheckoutValidationResult,
  PendingOrderResult,
} from "@/features/checkout/types";

type CartRow = {
  id?: string | null;
  user_id?: string | null;
  coupon_id?: string | null;
};

type CheckoutCategoryRow = {
  name?: string | null;
  slug?: string | null;
  is_active?: boolean | null;
};

type CheckoutSellerRow = {
  id?: string | null;
  store_name?: string | null;
  slug?: string | null;
  status?: string | null;
};

type CheckoutProductRow = {
  id?: string | null;
  seller_id?: string | null;
  title?: string | null;
  slug?: string | null;
  price_amount?: number | string | null;
  currency_code?: string | null;
  thumbnail_url?: string | null;
  metadata?: Json | null;
  status?: string | null;
  stock_quantity?: number | null;
  is_unlimited_stock?: boolean | null;
  categories?: CheckoutCategoryRow | CheckoutCategoryRow[] | null;
  seller_profiles?: CheckoutSellerRow | CheckoutSellerRow[] | null;
};

type CheckoutCartItemRow = {
  id?: string | null;
  cart_id?: string | null;
  product_id?: string | null;
  quantity?: number | null;
  products?: CheckoutProductRow | null;
};

type PersistedOrderRow = {
  id?: string | null;
  order_number?: string | null;
};

type OrderInsert = {
  order_number: string;
  customer_id: string;
  order_status: "pending";
  payment_status: "unpaid";
  currency_code: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  coupon_id: string | null;
  shipping_address_snapshot: Json | null;
  billing_address_snapshot: Json | null;
  placed_at: string;
};

type OrderItemInsert = {
  order_id: string;
  product_id: string;
  seller_id: string;
  product_title_snapshot: string;
  product_slug_snapshot: string | null;
  unit_price_amount: number;
  quantity: number;
  line_subtotal_amount: number;
  discount_amount: number;
  line_total_amount: number;
  currency_code: string;
  product_metadata_snapshot: Json;
};

const MAX_CART_QUANTITY = 99;

const normalizeJoinedRecord = <T>(value: T | T[] | null | undefined) => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const getCheckoutClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

const getEmptyTotals = (): CheckoutTotals => ({
  itemCount: 0,
  currencyCode: "USD",
  subtotalAmount: 0,
  discountAmount: 0,
  taxAmount: 0,
  totalAmount: 0,
});

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const getAvailabilityLabel = (input: {
  productStatus?: string | null;
  sellerStatus?: string | null;
  categoryIsActive?: boolean | null;
  stockQuantity?: number | null;
  isUnlimitedStock?: boolean | null;
  quantity: number;
}) => {
  const issues: string[] = [];

  if (input.productStatus !== "active") {
    issues.push("An item in your cart is no longer available. Remove it before checkout.");
  }

  if (input.sellerStatus !== "approved") {
    issues.push("A seller in your cart is not currently available for public sales.");
  }

  if (input.categoryIsActive === false) {
    issues.push("An item category is not currently available for checkout.");
  }

  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    issues.push("Quantity must stay greater than zero.");
  }

  if (input.quantity > MAX_CART_QUANTITY) {
    issues.push(`Quantity cannot exceed ${MAX_CART_QUANTITY} units per line.`);
  }

  if (
    !input.isUnlimitedStock &&
    input.stockQuantity != null &&
    input.stockQuantity <= 0
  ) {
    issues.push("Product is out of stock.");
  }

  if (
    !input.isUnlimitedStock &&
    input.stockQuantity != null &&
    input.quantity > input.stockQuantity
  ) {
    issues.push(`Only ${input.stockQuantity} units are currently available.`);
  }

  return {
    issues,
    label: issues[0] ?? "Ready for payment review",
  };
};

const buildOrderNumber = () => {
  const timestamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const token = randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();

  return `ORD-${timestamp}-${token}`;
};

const mapCheckoutItem = (row: CheckoutCartItemRow): CheckoutItem | null => {
  const product = row.products;
  const category = normalizeJoinedRecord(product?.categories);
  const seller = normalizeJoinedRecord(product?.seller_profiles);

  if (
    !row.id ||
    !row.product_id ||
    row.quantity == null ||
    !product?.id ||
    !product.title ||
    !product.slug ||
    product.price_amount == null ||
    !product.currency_code ||
    !seller?.id ||
    !seller.store_name
  ) {
    return null;
  }

  const availability = getAvailabilityLabel({
    productStatus: product.status,
    sellerStatus: seller.status,
    categoryIsActive: category?.is_active,
    stockQuantity: product.stock_quantity ?? null,
    isUnlimitedStock: product.is_unlimited_stock ?? false,
    quantity: row.quantity,
  });

  return {
    cartItemId: row.id,
    productId: row.product_id,
    sellerId: seller.id,
    productSlug: product.slug,
    title: product.title,
    thumbnailUrl: product.thumbnail_url ?? null,
    quantity: row.quantity,
    unitPriceAmount: Number(product.price_amount),
    lineSubtotalAmount: Number(product.price_amount) * row.quantity,
    discountAmount: 0,
    lineTotalAmount: Number(product.price_amount) * row.quantity,
    currencyCode: product.currency_code,
    seller: {
      id: seller.id,
      name: seller.store_name,
      slug: seller.slug,
    },
    category:
      category?.name && category.slug
        ? {
            name: category.name,
            slug: category.slug,
          }
        : null,
    status: availability.issues.length > 0 ? "invalid" : "ready",
    availabilityLabel: availability.label,
    issues: availability.issues,
    snapshotMetadata: {
      thumbnailUrl: product.thumbnail_url ?? null,
      sellerName: seller.store_name,
      sellerSlug: seller.slug,
      categoryName: category?.name ?? null,
      categorySlug: category?.slug ?? null,
    },
  };
};

const buildTotals = (
  items: CheckoutItem[],
  appliedCoupon: AppliedCoupon | null,
): CheckoutTotals => {
  const subtotalAmount = items.reduce(
    (total, item) => total + item.lineSubtotalAmount,
    0,
  );
  const discountAmount = appliedCoupon?.isValid ? appliedCoupon.discountAmount : 0;

  return {
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    currencyCode: items[0]?.currencyCode ?? "USD",
    subtotalAmount,
    discountAmount,
    taxAmount: 0,
    totalAmount: subtotalAmount - discountAmount,
  };
};

const applyCouponDiscountsToItems = (
  items: CheckoutItem[],
  appliedCoupon: AppliedCoupon | null,
) => {
  if (!appliedCoupon?.isValid || appliedCoupon.discountAmount <= 0) {
    return items.map((item) => ({
      ...item,
      discountAmount: 0,
      lineTotalAmount: item.lineSubtotalAmount,
    }));
  }

  const eligibleItems = items.filter(
    (item) =>
      !appliedCoupon.sellerId || item.sellerId === appliedCoupon.sellerId,
  );

  if (eligibleItems.length === 0 || appliedCoupon.applicableSubtotalAmount <= 0) {
    return items.map((item) => ({
      ...item,
      discountAmount: 0,
      lineTotalAmount: item.lineSubtotalAmount,
    }));
  }

  const eligibleItemIds = new Set(eligibleItems.map((item) => item.cartItemId));
  let remainingDiscount = appliedCoupon.discountAmount;

  return items.map((item, index, source) => {
    if (!eligibleItemIds.has(item.cartItemId)) {
      return {
        ...item,
        discountAmount: 0,
        lineTotalAmount: item.lineSubtotalAmount,
      };
    }

    const remainingEligible = source.filter(
      (candidate, candidateIndex) =>
        candidateIndex >= index && eligibleItemIds.has(candidate.cartItemId),
    );

    const discountAmount =
      remainingEligible.length === 1
        ? roundCurrency(Math.max(remainingDiscount, 0))
        : roundCurrency(
            Math.min(
              item.lineSubtotalAmount,
              (item.lineSubtotalAmount / appliedCoupon.applicableSubtotalAmount) *
                appliedCoupon.discountAmount,
            ),
          );

    remainingDiscount = roundCurrency(remainingDiscount - discountAmount);

    return {
      ...item,
      discountAmount,
      lineTotalAmount: roundCurrency(item.lineSubtotalAmount - discountAmount),
    };
  });
};

export class CheckoutOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutOperationError";
  }
}

async function findCartByUserId(userId: string) {
  const client = await getCheckoutClient();
  const { data, error } = await client
    .from("carts")
    .select("id, user_id, coupon_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new CheckoutOperationError("Unable to load the current cart for checkout.");
  }

  return data as CartRow | null;
}

async function getCheckoutCartItems(cartId: string) {
  const client = await getCheckoutClient();
  const { data, error } = await client
    .from("cart_items")
    .select(
      `
        id,
        cart_id,
        product_id,
        quantity,
        products (
          id,
          seller_id,
          title,
          slug,
          price_amount,
          currency_code,
          thumbnail_url,
          metadata,
          status,
          stock_quantity,
          is_unlimited_stock,
          categories (
            name,
            slug,
            is_active
          ),
          seller_profiles!products_seller_id_fkey (
            id,
            store_name,
            slug,
            status
          )
        )
      `,
    )
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new CheckoutOperationError("Unable to load cart items for checkout.");
  }

  return data as CheckoutCartItemRow[];
}

export async function validateCheckout(userId: string): Promise<CheckoutValidationResult> {
  const cart = await findCartByUserId(userId);

  if (!cart?.id) {
    return {
      status: "empty",
      cartId: null,
      items: [],
      totals: getEmptyTotals(),
      appliedCoupon: null,
      errors: ["Your cart is empty."],
      canSubmit: false,
    };
  }

  const rows = await getCheckoutCartItems(cart.id);

  if (rows.length === 0) {
    return {
      status: "empty",
      cartId: cart.id,
      items: [],
      totals: getEmptyTotals(),
      appliedCoupon: null,
      errors: ["Your cart is empty."],
      canSubmit: false,
    };
  }

  const mappedItems = rows
    .map(mapCheckoutItem)
    .filter((item): item is CheckoutItem => Boolean(item));
  const errors: string[] = [];

  if (mappedItems.length !== rows.length) {
    errors.push("One or more cart items could not be resolved against the current product catalog.");
  }

  const distinctCurrencies = [...new Set(mappedItems.map((item) => item.currencyCode))];

  if (distinctCurrencies.length > 1) {
    errors.push("Checkout currently supports a single currency per order.");
  }

  mappedItems.forEach((item) => {
    errors.push(...item.issues);
  });

  const appliedCoupon = cart.coupon_id
    ? await evaluateCoupon({
        userId,
        couponId: cart.coupon_id,
        items: mappedItems.map((item) => ({
          cartItemId: item.cartItemId,
          sellerId: item.sellerId,
          lineSubtotalAmount: item.lineSubtotalAmount,
        })),
        subtotalAmount: mappedItems.reduce(
          (total, item) => total + item.lineSubtotalAmount,
          0,
        ),
      }).catch(() => null)
    : null;

  if (cart.coupon_id && (!appliedCoupon || !appliedCoupon.isValid)) {
    errors.push(
      appliedCoupon?.message ??
        "The saved coupon is no longer valid for the current cart.",
    );
  }

  const items = applyCouponDiscountsToItems(mappedItems, appliedCoupon);
  const totals = buildTotals(items, appliedCoupon);

  const uniqueErrors = [...new Set(errors)];

  return {
    status:
      items.length === 0
        ? "empty"
        : uniqueErrors.length > 0
          ? "invalid"
          : "ready",
    cartId: cart.id,
    items,
    totals,
    appliedCoupon,
    errors: uniqueErrors,
    canSubmit: items.length > 0 && uniqueErrors.length === 0,
  };
}

async function insertPendingOrder(order: OrderInsert) {
  const client = await getCheckoutClient();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidateOrderNumber = buildOrderNumber();
    const { data, error } = await client
      .from("orders")
      .insert({
        ...order,
        order_number: candidateOrderNumber,
      })
      .select("id, order_number")
      .single();

    if (!error && data?.id && data.order_number) {
      return data as PersistedOrderRow;
    }

    if (error?.code !== "23505") {
      throw new CheckoutOperationError("Unable to create the pending order.");
    }
  }

  throw new CheckoutOperationError("Unable to generate a unique order number.");
}

const buildOrderItemInserts = (
  orderId: string,
  items: CheckoutItem[],
): OrderItemInsert[] =>
  items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    seller_id: item.sellerId,
    product_title_snapshot: item.title,
    product_slug_snapshot: item.productSlug,
    unit_price_amount: item.unitPriceAmount,
    quantity: item.quantity,
    line_subtotal_amount: item.lineSubtotalAmount,
    discount_amount: item.discountAmount,
    line_total_amount: item.lineTotalAmount,
    currency_code: item.currencyCode,
    product_metadata_snapshot: item.snapshotMetadata,
  }));

async function rollbackPendingOrder(orderId: string, userId: string) {
  const client = await getCheckoutClient();

  await client.from("order_items").delete().eq("order_id", orderId);
  await client.from("orders").delete().eq("id", orderId).eq("customer_id", userId);
}

async function clearCartAfterOrder(cartId: string, userId: string) {
  const cart = await findCartByUserId(userId);

  if (cart?.id !== cartId) {
    throw new CheckoutOperationError("Unable to verify the cart owner before checkout cleanup.");
  }

  const client = await getCheckoutClient();
  const { error } = await client.from("cart_items").delete().eq("cart_id", cartId);

  if (error) {
    throw new CheckoutOperationError("Unable to clear the cart after creating the pending order.");
  }
}

export async function createPendingOrder(
  userId: string,
  shippingAddressId: string,
): Promise<PendingOrderResult> {
  if (!shippingAddressId) {
    throw new CheckoutOperationError("Choose a shipping address before payment.");
  }

  const checkout = await validateCheckout(userId);

  if (checkout.status === "empty") {
    throw new CheckoutOperationError("Your cart is empty.");
  }

  if (!checkout.canSubmit || !checkout.cartId) {
    throw new CheckoutOperationError(
      checkout.errors[0] ?? "Checkout cannot continue until the cart issues are resolved.",
    );
  }

  let shippingAddress;

  try {
    shippingAddress = await getAddressForUser(userId, shippingAddressId);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to verify your shipping address.";

    throw new CheckoutOperationError(message);
  }

  if (!shippingAddress) {
    throw new CheckoutOperationError(
      "Choose a saved shipping address that belongs to your account.",
    );
  }

  const order = await insertPendingOrder({
    order_number: buildOrderNumber(),
    customer_id: userId,
    order_status: "pending",
    payment_status: "unpaid",
    currency_code: checkout.totals.currencyCode,
    subtotal_amount: checkout.totals.subtotalAmount,
    discount_amount: checkout.totals.discountAmount,
    tax_amount: checkout.totals.taxAmount,
    total_amount: checkout.totals.totalAmount,
    coupon_id: checkout.appliedCoupon?.isValid ? checkout.appliedCoupon.id : null,
    shipping_address_snapshot: buildShippingAddressSnapshot(shippingAddress),
    billing_address_snapshot: null,
    placed_at: new Date().toISOString(),
  });

  if (!order.id || !order.order_number) {
    throw new CheckoutOperationError("Unable to create the pending order.");
  }

  const client = await getCheckoutClient();

  try {
    const { error: itemInsertError } = await client
      .from("order_items")
      .insert(buildOrderItemInserts(order.id, checkout.items));

    if (itemInsertError) {
      throw new CheckoutOperationError("Unable to create the pending order items.");
    }

    await clearCartAfterOrder(checkout.cartId, userId);

    if (checkout.appliedCoupon?.isValid) {
      await client
        .from("carts")
        .update({ coupon_id: null })
        .eq("id", checkout.cartId)
        .eq("user_id", userId);
    }
  } catch (error) {
    await rollbackPendingOrder(order.id, userId);

    if (error instanceof CheckoutOperationError) {
      throw error;
    }

    throw new CheckoutOperationError("Unable to complete the pending order flow.");
  }

  return {
    id: order.id,
    orderNumber: order.order_number,
  };
}
