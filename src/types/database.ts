export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        {
          id: string;
          email: string;
          full_name: string | null;
          role: "customer" | "seller" | "admin";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "customer" | "seller" | "admin";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "customer" | "seller" | "admin";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      seller_profiles: TableDefinition<
        {
          id: string;
          user_id: string;
          store_name: string;
          slug: string | null;
          status: "pending" | "approved" | "rejected" | "suspended";
          bio: string | null;
          logo_url: string | null;
          commission_rate_bps: number | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          store_name: string;
          slug?: string | null;
          status?: "pending" | "approved" | "rejected" | "suspended";
          bio?: string | null;
          logo_url?: string | null;
          commission_rate_bps?: number | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          store_name?: string;
          slug?: string | null;
          status?: "pending" | "approved" | "rejected" | "suspended";
          bio?: string | null;
          logo_url?: string | null;
          commission_rate_bps?: number | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      carts: TableDefinition<
        {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      cart_items: TableDefinition<
        {
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          cart_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      orders: TableDefinition<
        {
          id: string;
          order_number: string;
          customer_id: string;
          order_status:
            | "pending"
            | "confirmed"
            | "processing"
            | "completed"
            | "cancelled"
            | "refunded"
            | "partially_refunded";
          payment_status:
            | "unpaid"
            | "processing"
            | "paid"
            | "failed"
            | "refunded"
            | "partially_refunded";
          currency_code: string;
          subtotal_amount: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          coupon_id: string | null;
          shipping_address_snapshot: Json | null;
          billing_address_snapshot: Json | null;
          placed_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          order_number: string;
          customer_id: string;
          order_status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "completed"
            | "cancelled"
            | "refunded"
            | "partially_refunded";
          payment_status?:
            | "unpaid"
            | "processing"
            | "paid"
            | "failed"
            | "refunded"
            | "partially_refunded";
          currency_code: string;
          subtotal_amount: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount: number;
          coupon_id?: string | null;
          shipping_address_snapshot?: Json | null;
          billing_address_snapshot?: Json | null;
          placed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          order_number?: string;
          customer_id?: string;
          order_status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "completed"
            | "cancelled"
            | "refunded"
            | "partially_refunded";
          payment_status?:
            | "unpaid"
            | "processing"
            | "paid"
            | "failed"
            | "refunded"
            | "partially_refunded";
          currency_code?: string;
          subtotal_amount?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          coupon_id?: string | null;
          shipping_address_snapshot?: Json | null;
          billing_address_snapshot?: Json | null;
          placed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      order_items: TableDefinition<
        {
          id: string;
          order_id: string;
          product_id: string | null;
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
          created_at: string;
        },
        {
          id?: string;
          order_id: string;
          product_id?: string | null;
          seller_id: string;
          product_title_snapshot: string;
          product_slug_snapshot?: string | null;
          unit_price_amount: number;
          quantity: number;
          line_subtotal_amount: number;
          discount_amount?: number;
          line_total_amount: number;
          currency_code: string;
          product_metadata_snapshot?: Json;
          created_at?: string;
        },
        {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          seller_id?: string;
          product_title_snapshot?: string;
          product_slug_snapshot?: string | null;
          unit_price_amount?: number;
          quantity?: number;
          line_subtotal_amount?: number;
          discount_amount?: number;
          line_total_amount?: number;
          currency_code?: string;
          product_metadata_snapshot?: Json;
          created_at?: string;
        }
      >;
      payments: TableDefinition<
        {
          id: string;
          order_id: string;
          provider: string;
          provider_payment_id: string | null;
          provider_session_id: string | null;
          status:
            | "unpaid"
            | "processing"
            | "paid"
            | "failed"
            | "refunded"
            | "partially_refunded";
          amount: number;
          currency_code: string;
          idempotency_key: string | null;
          raw_provider_payload: Json | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          order_id: string;
          provider: string;
          provider_payment_id?: string | null;
          provider_session_id?: string | null;
          status?:
            | "unpaid"
            | "processing"
            | "paid"
            | "failed"
            | "refunded"
            | "partially_refunded";
          amount: number;
          currency_code: string;
          idempotency_key?: string | null;
          raw_provider_payload?: Json | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          order_id?: string;
          provider?: string;
          provider_payment_id?: string | null;
          provider_session_id?: string | null;
          status?:
            | "unpaid"
            | "processing"
            | "paid"
            | "failed"
            | "refunded"
            | "partially_refunded";
          amount?: number;
          currency_code?: string;
          idempotency_key?: string | null;
          raw_provider_payload?: Json | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      categories: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      products: TableDefinition<
        {
          id: string;
          seller_id: string;
          category_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          price_amount: number;
          currency_code: string;
          stock_quantity: number | null;
          is_unlimited_stock: boolean;
          status: "draft" | "active" | "archived" | "suspended";
          thumbnail_url: string | null;
          metadata: Json;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          seller_id: string;
          category_id?: string | null;
          title: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          price_amount: number;
          currency_code?: string;
          stock_quantity?: number | null;
          is_unlimited_stock?: boolean;
          status?: "draft" | "active" | "archived" | "suspended";
          thumbnail_url?: string | null;
          metadata?: Json;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          seller_id?: string;
          category_id?: string | null;
          title?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          price_amount?: number;
          currency_code?: string;
          stock_quantity?: number | null;
          is_unlimited_stock?: boolean;
          status?: "draft" | "active" | "archived" | "suspended";
          thumbnail_url?: string | null;
          metadata?: Json;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      product_images: TableDefinition<
        {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        },
        {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        },
        {
          id?: string;
          product_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "customer" | "seller" | "admin";
      seller_status: "pending" | "approved" | "rejected" | "suspended";
      product_status: "draft" | "active" | "archived" | "suspended";
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "completed"
        | "cancelled"
        | "refunded"
        | "partially_refunded";
      payment_status:
        | "unpaid"
        | "processing"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded";
    };
    CompositeTypes: Record<string, never>;
  };
};
