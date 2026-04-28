import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import { evaluateCoupon } from "@/features/checkout/lib/coupon-service";
import type { Database } from "@/types/database";
import type { CartItem, CartItemAvailability, CartSnapshot } from "@/features/cart/types";

type CartRow = Database["public"]["Tables"]["carts"]["Row"];
type CartItemRow = Database["public"]["Tables"]["cart_items"]["Row"];

type CartCategoryRow = {
  name?: string | null;
  slug?: string | null;
  is_active?: boolean | null;
};

type CartSellerRow = {
  id?: string | null;
  store_name?: string | null;
  slug?: string | null;
  status?: string | null;
};

type CartProductRow = {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
  price_amount?: number | string | null;
  currency_code?: string | null;
  thumbnail_url?: string | null;
  status?: string | null;
  stock_quantity?: number | null;
  is_unlimited_stock?: boolean | null;
  categories?: CartCategoryRow | CartCategoryRow[] | null;
  seller_profiles?: CartSellerRow | CartSellerRow[] | null;
};

type CartItemQueryRow = CartItemRow & {
  products?: CartProductRow | null;
};

type CartMutationProduct = {
  id: string;
  title: string;
  slug: string;
  priceAmount: number;
  currencyCode: string;
  thumbnailUrl: string | null;
  stockQuantity: number | null;
  isUnlimitedStock: boolean;
  seller: {
    id: string;
    name: string;
    slug?: string | null;
    status?: string | null;
  } | null;
  category: {
    name: string;
    slug: string;
    isActive: boolean | null;
  } | null;
  status: string;
};

const MAX_CART_QUANTITY = 99;

const normalizeJoinedRecord = <T>(value: T | T[] | null | undefined) => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const getCartClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

const getAvailability = (product: CartMutationProduct, quantity: number) => {
  if (
    product.status !== "active" ||
    product.seller?.status !== "approved" ||
    product.category?.isActive === false
  ) {
    return {
      state: "unavailable" as CartItemAvailability,
      label: "Unavailable now. Remove this item before checkout.",
    };
  }

  if (
    !product.isUnlimitedStock &&
    product.stockQuantity != null &&
    product.stockQuantity <= 0
  ) {
    return {
      state: "unavailable" as CartItemAvailability,
      label: "Out of stock. Remove this item before checkout.",
    };
  }

  if (
    !product.isUnlimitedStock &&
    product.stockQuantity != null &&
    quantity > product.stockQuantity
  ) {
    return {
      state: "limited_stock" as CartItemAvailability,
      label: `Only ${product.stockQuantity} available. Update the quantity before checkout.`,
    };
  }

  return {
    state: "available" as CartItemAvailability,
    label: "Ready for checkout review",
  };
};

const assertValidQuantity = (quantity: number) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new CartOperationError("Quantity must be a whole number greater than zero.");
  }

  if (quantity > MAX_CART_QUANTITY) {
    throw new CartOperationError(
      `Quantity cannot exceed ${MAX_CART_QUANTITY} units in one cart line.`,
    );
  }
};

const mapProductRow = (row: CartProductRow | null | undefined): CartMutationProduct | null => {
  if (
    !row?.id ||
    !row.title ||
    !row.slug ||
    row.price_amount == null ||
    !row.currency_code
  ) {
    return null;
  }

  const category = normalizeJoinedRecord(row.categories);
  const seller = normalizeJoinedRecord(row.seller_profiles);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    priceAmount: Number(row.price_amount),
    currencyCode: row.currency_code,
    thumbnailUrl: row.thumbnail_url ?? null,
    stockQuantity: row.stock_quantity ?? null,
    isUnlimitedStock: Boolean(row.is_unlimited_stock),
    seller: seller?.store_name && seller.id
      ? {
          id: seller.id,
          name: seller.store_name,
          slug: seller.slug,
          status: seller.status,
        }
      : null,
    category:
      category?.name && category.slug
        ? {
            name: category.name,
            slug: category.slug,
            isActive: category.is_active ?? null,
          }
        : null,
    status: row.status ?? "draft",
  };
};

const mapCartItem = (row: CartItemQueryRow): CartItem | null => {
  const product = mapProductRow(row.products);

  if (!product) {
    return null;
  }

  const availability = getAvailability(product, row.quantity);

  return {
    id: row.id,
    productId: product.id,
    sellerId: product.seller?.id ?? "",
    productSlug: product.slug,
    title: product.title,
    thumbnailUrl: product.thumbnailUrl,
    quantity: row.quantity,
    unitPriceAmount: product.priceAmount,
    currencyCode: product.currencyCode,
    lineTotalAmount: product.priceAmount * row.quantity,
    seller: product.seller
      ? {
          name: product.seller.name,
          slug: product.seller.slug,
        }
      : null,
    category: product.category
      ? {
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    availability: availability.state,
    availabilityLabel: availability.label,
  };
};

const buildCartSnapshot = (
  cart: CartRow | null,
  items: CartItem[],
  appliedCoupon: CartSnapshot["appliedCoupon"],
): CartSnapshot => {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const subtotalAmount = items.reduce(
    (total, item) => total + item.lineTotalAmount,
    0,
  );
  const discountAmount = appliedCoupon?.isValid ? appliedCoupon.discountAmount : 0;

  return {
    cartId: cart?.id ?? null,
    items,
    itemCount,
    subtotalAmount,
    discountAmount,
    totalAmount: subtotalAmount - discountAmount,
    currencyCode: items[0]?.currencyCode ?? "USD",
    appliedCoupon,
    hasUnavailableItems: items.some((item) => item.availability !== "available"),
    isEmpty: items.length === 0,
  };
};

const findCartByUserId = async (userId: string): Promise<CartRow | null> => {
  const client = await getCartClient();
  const { data, error } = await client
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new CartOperationError("Unable to load the current cart.");
  }

  return data;
};

const ensureCartByUserId = async (userId: string): Promise<CartRow> => {
  const existingCart = await findCartByUserId(userId);

  if (existingCart) {
    return existingCart;
  }

  const client = await getCartClient();
  const { data, error } = await client
    .from("carts")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (error || !data) {
    throw new CartOperationError("Unable to create a cart for this account.");
  }

  return data;
};

const getProductForCart = async (
  productId: string,
): Promise<CartMutationProduct | null> => {
  const client = await getCartClient();
  const { data, error } = await client
    .from("products")
    .select(
      `
        id,
        title,
        slug,
        price_amount,
        currency_code,
        thumbnail_url,
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
      `,
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw new CartOperationError("Unable to validate that product for cart use.");
  }

  return mapProductRow(data as CartProductRow | null);
};

const assertPurchasableProduct = (
  product: CartMutationProduct | null,
  quantity: number,
) => {
  if (!product) {
    throw new CartOperationError("That product could not be found.");
  }

  const availability = getAvailability(product, quantity);

  if (availability.state === "unavailable") {
    throw new CartOperationError(
      "That product is not currently available for purchase.",
    );
  }

  if (availability.state === "limited_stock") {
    throw new CartOperationError(availability.label);
  }

  return product;
};

const listCartItemsByCartId = async (cartId: string): Promise<CartItem[]> => {
  const client = await getCartClient();
  const { data, error } = await client
    .from("cart_items")
    .select(
      `
        id,
        cart_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products!inner (
          id,
          title,
          slug,
          price_amount,
          currency_code,
          thumbnail_url,
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
    throw new CartOperationError("Unable to load the items in the current cart.");
  }

  return (data as CartItemQueryRow[])
    .map(mapCartItem)
    .filter((item): item is CartItem => Boolean(item));
};

const getCartItemById = async (
  userId: string,
  cartItemId: string,
): Promise<CartItemRow | null> => {
  const cart = await findCartByUserId(userId);

  if (!cart) {
    return null;
  }

  const client = await getCartClient();
  const { data, error } = await client
    .from("cart_items")
    .select("*")
    .eq("id", cartItemId)
    .eq("cart_id", cart.id)
    .maybeSingle();

  if (error) {
    throw new CartOperationError("Unable to load that cart item.");
  }

  return data;
};

export class CartOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartOperationError";
  }
}

export async function getCartByUserId(userId: string): Promise<CartSnapshot> {
  const cart = await findCartByUserId(userId);

  if (!cart) {
    return buildCartSnapshot(null, [], null);
  }

  const items = await listCartItemsByCartId(cart.id);
  const evaluatedCoupon = cart.coupon_id
    ? await evaluateCoupon({
        userId,
        items: items.map((item) => ({
          cartItemId: item.id,
          sellerId: item.sellerId,
          lineSubtotalAmount: item.lineTotalAmount,
        })),
        subtotalAmount: items.reduce((sum, item) => sum + item.lineTotalAmount, 0),
        couponId: cart.coupon_id,
      }).catch(() => null)
    : null;
  const appliedCoupon = evaluatedCoupon
    ? {
        id: evaluatedCoupon.id,
        code: evaluatedCoupon.code,
        discountAmount: evaluatedCoupon.discountAmount,
        isValid: evaluatedCoupon.isValid,
        message: evaluatedCoupon.message,
      }
    : null;

  return buildCartSnapshot(cart, items, appliedCoupon);
}

export async function getCartItemCountByUserId(userId: string) {
  const cart = await getCartByUserId(userId);

  return cart.itemCount;
}

export async function addItemToCart(input: {
  userId: string;
  productId: string;
  quantity: number;
}) {
  assertValidQuantity(input.quantity);

  const cart = await ensureCartByUserId(input.userId);
  const client = await getCartClient();
  const { data: existingItem, error: existingItemError } = await client
    .from("cart_items")
    .select("*")
    .eq("cart_id", cart.id)
    .eq("product_id", input.productId)
    .maybeSingle();

  if (existingItemError) {
    throw new CartOperationError("Unable to inspect the existing cart state.");
  }

  const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;
  const product = assertPurchasableProduct(
    await getProductForCart(input.productId),
    nextQuantity,
  );

  if (existingItem) {
    const { error } = await client
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", existingItem.id)
      .eq("cart_id", cart.id);

    if (error) {
      throw new CartOperationError("Unable to update the existing cart item.");
    }
  } else {
    const { error } = await client.from("cart_items").insert({
      cart_id: cart.id,
      product_id: input.productId,
      quantity: input.quantity,
    });

    if (error) {
      throw new CartOperationError("Unable to add that item to the cart.");
    }
  }

  return {
    cart: await getCartByUserId(input.userId),
    product,
  };
}

export async function updateCartItemQuantity(input: {
  userId: string;
  cartItemId: string;
  quantity: number;
}) {
  assertValidQuantity(input.quantity);

  const cartItem = await getCartItemById(input.userId, input.cartItemId);

  if (!cartItem) {
    throw new CartOperationError("That cart item could not be found.");
  }

  assertPurchasableProduct(await getProductForCart(cartItem.product_id), input.quantity);
  const client = await getCartClient();
  const { error } = await client
    .from("cart_items")
    .update({ quantity: input.quantity })
    .eq("id", cartItem.id)
    .eq("cart_id", cartItem.cart_id);

  if (error) {
    throw new CartOperationError("Unable to update that cart quantity.");
  }

  return getCartByUserId(input.userId);
}

export async function removeCartItem(input: {
  userId: string;
  cartItemId: string;
}) {
  const cartItem = await getCartItemById(input.userId, input.cartItemId);

  if (!cartItem) {
    throw new CartOperationError("That cart item could not be found.");
  }

  const client = await getCartClient();
  const { error } = await client
    .from("cart_items")
    .delete()
    .eq("id", cartItem.id)
    .eq("cart_id", cartItem.cart_id);

  if (error) {
    throw new CartOperationError("Unable to remove that cart item.");
  }

  return getCartByUserId(input.userId);
}

export async function clearCartByUserId(userId: string) {
  const cart = await findCartByUserId(userId);

  if (!cart) {
    return buildCartSnapshot(null, [], null);
  }

  const client = await getCartClient();
  const { error } = await client
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id);

  if (error) {
    throw new CartOperationError("Unable to clear the current cart.");
  }

  return getCartByUserId(userId);
}

export async function applyCouponToCart(input: {
  userId: string;
  code: string;
}) {
  const cart = await ensureCartByUserId(input.userId);
  const items = await listCartItemsByCartId(cart.id);

  if (items.length === 0) {
    throw new CartOperationError("Add items to your cart before applying a coupon.");
  }

  const subtotalAmount = items.reduce((sum, item) => sum + item.lineTotalAmount, 0);
  const evaluatedCoupon = await evaluateCoupon({
    userId: input.userId,
    code: input.code.trim().toUpperCase(),
    items: items.map((item) => ({
      cartItemId: item.id,
      sellerId: item.sellerId,
      lineSubtotalAmount: item.lineTotalAmount,
    })),
    subtotalAmount,
  }).catch((error) => {
    throw new CartOperationError(
      error instanceof Error ? error.message : "Unable to validate that coupon.",
    );
  });

  if (!evaluatedCoupon?.isValid) {
    throw new CartOperationError(
      evaluatedCoupon?.message ?? "That coupon cannot be applied to the current cart.",
    );
  }

  const client = await getCartClient();
  const { error } = await client
    .from("carts")
    .update({ coupon_id: evaluatedCoupon.id })
    .eq("id", cart.id)
    .eq("user_id", input.userId);

  if (error) {
    throw new CartOperationError("Unable to save that coupon to the cart.");
  }

  return evaluatedCoupon;
}

export async function removeCouponFromCart(userId: string) {
  const cart = await ensureCartByUserId(userId);
  const client = await getCartClient();
  const { error } = await client
    .from("carts")
    .update({ coupon_id: null })
    .eq("id", cart.id)
    .eq("user_id", userId);

  if (error) {
    throw new CartOperationError("Unable to remove the coupon from the cart.");
  }
}
