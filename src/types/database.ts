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
    };
    CompositeTypes: Record<string, never>;
  };
};
