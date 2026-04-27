export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          reason: string | null
          target_id: string | null
          target_table: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          reason?: string | null
          target_id?: string | null
          target_table: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          reason?: string | null
          target_id?: string | null
          target_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          city: string
          country_code: string
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          line_1: string
          line_2: string | null
          phone: string | null
          postal_code: string | null
          recipient_name: string
          state_region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country_code: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line_1: string
          line_2?: string | null
          phone?: string | null
          postal_code?: string | null
          recipient_name: string
          state_region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country_code?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line_1?: string
          line_2?: string | null
          phone?: string | null
          postal_code?: string | null
          recipient_name?: string
          state_region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          coupon_id: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          minimum_order_amount: number | null
          seller_id: string | null
          starts_at: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string
          usage_limit_per_user: number | null
          usage_limit_total: number | null
          value_amount: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          minimum_order_amount?: number | null
          seller_id?: string | null
          starts_at?: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          usage_limit_per_user?: number | null
          usage_limit_total?: number | null
          value_amount: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          minimum_order_amount?: number | null
          seller_id?: string | null
          starts_at?: string | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          usage_limit_per_user?: number | null
          usage_limit_total?: number | null
          value_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          currency_code: string
          delivered_at: string | null
          discount_amount: number
          fulfillment_status: Database["public"]["Enums"]["fulfillment_status"]
          id: string
          line_subtotal_amount: number
          line_total_amount: number
          order_id: string
          product_id: string | null
          product_metadata_snapshot: Json
          product_slug_snapshot: string | null
          product_title_snapshot: string
          quantity: number
          seller_id: string
          shipment_note: string | null
          shipped_at: string | null
          tracking_code: string | null
          unit_price_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          delivered_at?: string | null
          discount_amount?: number
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          line_subtotal_amount: number
          line_total_amount: number
          order_id: string
          product_id?: string | null
          product_metadata_snapshot?: Json
          product_slug_snapshot?: string | null
          product_title_snapshot: string
          quantity: number
          seller_id: string
          shipment_note?: string | null
          shipped_at?: string | null
          tracking_code?: string | null
          unit_price_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          delivered_at?: string | null
          discount_amount?: number
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          line_subtotal_amount?: number
          line_total_amount?: number
          order_id?: string
          product_id?: string | null
          product_metadata_snapshot?: Json
          product_slug_snapshot?: string | null
          product_title_snapshot?: string
          quantity?: number
          seller_id?: string
          shipment_note?: string | null
          shipped_at?: string | null
          tracking_code?: string | null
          unit_price_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_snapshot: Json | null
          coupon_id: string | null
          created_at: string
          currency_code: string
          customer_id: string
          discount_amount: number
          id: string
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          placed_at: string | null
          shipping_address_snapshot: Json | null
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          billing_address_snapshot?: Json | null
          coupon_id?: string | null
          created_at?: string
          currency_code: string
          customer_id: string
          discount_amount?: number
          id?: string
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          placed_at?: string | null
          shipping_address_snapshot?: Json | null
          subtotal_amount: number
          tax_amount?: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          billing_address_snapshot?: Json | null
          coupon_id?: string | null
          created_at?: string
          currency_code?: string
          customer_id?: string
          discount_amount?: number
          id?: string
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          placed_at?: string | null
          shipping_address_snapshot?: Json | null
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency_code: string
          id: string
          idempotency_key: string | null
          order_id: string
          paid_at: string | null
          provider: string
          provider_payment_id: string | null
          provider_session_id: string | null
          raw_provider_payload: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency_code: string
          id?: string
          idempotency_key?: string | null
          order_id: string
          paid_at?: string | null
          provider: string
          provider_payment_id?: string | null
          provider_session_id?: string | null
          raw_provider_payload?: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency_code?: string
          id?: string
          idempotency_key?: string | null
          order_id?: string
          paid_at?: string | null
          provider?: string
          provider_payment_id?: string | null
          provider_session_id?: string | null
          raw_provider_payload?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          currency_code: string
          description: string | null
          id: string
          is_unlimited_stock: boolean
          low_stock_threshold: number
          metadata: Json
          price_amount: number
          published_at: string | null
          seller_id: string
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock_quantity: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          currency_code?: string
          description?: string | null
          id?: string
          is_unlimited_stock?: boolean
          low_stock_threshold?: number
          metadata?: Json
          price_amount: number
          published_at?: string | null
          seller_id: string
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          currency_code?: string
          description?: string | null
          id?: string
          is_unlimited_stock?: boolean
          low_stock_threshold?: number
          metadata?: Json
          price_amount?: number
          published_at?: string | null
          seller_id?: string
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      seller_profiles: {
        Row: {
          agreement_accepted_at: string | null
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          business_email: string | null
          commission_rate_bps: number | null
          country_code: string | null
          created_at: string
          id: string
          logo_url: string | null
          phone: string | null
          rejection_reason: string | null
          resubmitted_at: string | null
          slug: string | null
          status: Database["public"]["Enums"]["seller_status"]
          store_name: string
          support_email: string | null
          suspension_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agreement_accepted_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          business_email?: string | null
          commission_rate_bps?: number | null
          country_code?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          rejection_reason?: string | null
          resubmitted_at?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["seller_status"]
          store_name: string
          support_email?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agreement_accepted_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          business_email?: string | null
          commission_rate_bps?: number | null
          country_code?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          rejection_reason?: string | null
          resubmitted_at?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["seller_status"]
          store_name?: string
          support_email?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["seller_status"]
          previous_status: Database["public"]["Enums"]["seller_status"] | null
          reason: string | null
          seller_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["seller_status"]
          previous_status?: Database["public"]["Enums"]["seller_status"] | null
          reason?: string | null
          seller_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["seller_status"]
          previous_status?: Database["public"]["Enums"]["seller_status"] | null
          reason?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_status_history_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_seller_profile_id: { Args: never; Returns: string }
      current_user_can_manage_seller_profile: {
        Args: { target_seller_profile_id: string }
        Returns: boolean
      }
      current_user_can_view_order: {
        Args: { target_order_id: string }
        Returns: boolean
      }
      current_user_owns_cart: {
        Args: { target_cart_id: string }
        Returns: boolean
      }
      current_user_owns_order: {
        Args: { target_order_id: string }
        Returns: boolean
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_active_category: {
        Args: { target_category_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_product_publicly_visible: {
        Args: {
          target_category_id: string
          target_seller_id: string
          target_status: Database["public"]["Enums"]["product_status"]
        }
        Returns: boolean
      }
    }
    Enums: {
      coupon_type: "fixed" | "percentage"
      fulfillment_status:
        | "unfulfilled"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "completed"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
      payment_status:
        | "unpaid"
        | "processing"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded"
      product_status: "draft" | "active" | "archived" | "suspended"
      seller_status: "pending" | "approved" | "rejected" | "suspended"
      user_role: "customer" | "seller" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      coupon_type: ["fixed", "percentage"],
      fulfillment_status: [
        "unfulfilled",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "completed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      payment_status: [
        "unpaid",
        "processing",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      product_status: ["draft", "active", "archived", "suspended"],
      seller_status: ["pending", "approved", "rejected", "suspended"],
      user_role: ["customer", "seller", "admin"],
    },
  },
} as const
